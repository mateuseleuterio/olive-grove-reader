import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 25;
const BATCH_DELAY = 200;

const BIBLE_SOURCES = {
  'AA': 'https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/aa.json',
  'ACF': 'https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/acf.json',
  'KJF': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/KJF.json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bookIndex = 0, version = 'AA' } = await req.json();
    
    console.log(`Starting import of book index ${bookIndex} for version ${version}`);

    // Validate version
    if (!BIBLE_SOURCES[version]) {
      throw new Error(`Invalid version: ${version}`);
    }

    // Fetch Bible data with error handling
    const response = await fetch(BIBLE_SOURCES[version]);
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible data: ${response.statusText}`);
    }
    
    const bibleData = await response.json();
    
    if (!Array.isArray(bibleData)) {
      throw new Error('Invalid Bible data format: not an array');
    }

    if (bookIndex >= bibleData.length) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Import completed! All books processed.',
          totalBooks: bibleData.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const book = bibleData[bookIndex];
    let totalVerses = 0;
    let errors = [];

    try {
      console.log(`Processing book: ${book.name}`);
      
      if (!book || typeof book !== 'object') {
        throw new Error('Invalid book data');
      }

      const { data: bookData, error: bookError } = await supabaseClient
        .from('bible_books')
        .select('id, name')
        .eq('name', book.name)
        .maybeSingle();

      if (bookError) {
        throw bookError;
      }

      if (!bookData) {
        throw new Error(`Book not found: ${book.name}`);
      }

      console.log(`Book found: ${book.name} (ID: ${bookData.id})`);

      if (!Array.isArray(book.chapters)) {
        throw new Error(`Invalid structure for book ${book.name}: chapters not an array`);
      }

      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
        const chapterNumber = chapterIndex + 1;
        const chapter = book.chapters[chapterIndex];
        
        console.log(`Processing ${book.name} ${chapterNumber}`);

        if (!Array.isArray(chapter)) {
          throw new Error(`Invalid structure for ${book.name} chapter ${chapterNumber}`);
        }

        const { data: chapterData, error: chapterError } = await supabaseClient
          .from('bible_chapters')
          .select('id')
          .eq('book_id', bookData.id)
          .eq('chapter_number', chapterNumber)
          .maybeSingle();

        if (chapterError) {
          throw chapterError;
        }

        if (!chapterData) {
          throw new Error(`Chapter not found: ${chapterNumber} of book ${book.name}`);
        }

        for (let i = 0; i < chapter.length; i += BATCH_SIZE) {
          try {
            const verseBatch = chapter.slice(i, i + BATCH_SIZE);
            const verses = verseBatch.map((text: string, index: number) => ({
              chapter_id: chapterData.id,
              verse_number: i + index + 1,
              text: text || '',
              version: version
            }));

            console.log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(chapter.length / BATCH_SIZE)} (${verses.length} verses)`);

            const { error: versesError } = await supabaseClient
              .from('bible_verses')
              .upsert(verses);

            if (versesError) {
              throw versesError;
            }

            totalVerses += verses.length;
            console.log(`✓ Batch processed successfully`);
            
            // Add delay between batches
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          } catch (error) {
            console.error(`Error processing verse batch:`, error);
            errors.push({ 
              book: book.name, 
              chapter: chapterNumber, 
              batch: Math.floor(i / BATCH_SIZE) + 1,
              error: error.message 
            });
          }
        }
      }

      console.log(`✓ Book ${book.name} processed successfully`);
    } catch (error) {
      console.error(`Error processing book ${book.name}:`, error);
      errors.push({ book: book.name, error: error.message });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Book ${book.name} processed`,
        stats: {
          bookIndex,
          nextBookIndex: bookIndex + 1,
          totalBooks: bibleData.length,
          versesImported: totalVerses,
          errors: errors.length
        },
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in import function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})