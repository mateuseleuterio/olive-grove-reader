import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 10; // Reduced batch size
const BATCH_DELAY = 300; // Increased delay between batches

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { version, bookIndex = 0 } = await req.json()
    console.log(`Starting import for version ${version}, book index ${bookIndex}`);

    if (!version) {
      throw new Error('Version is required');
    }

    const BIBLE_SOURCES = {
      'AA': 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json',
      'ACF': 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json',
      'KJF': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/KJF.json'
    };

    const sourceUrl = BIBLE_SOURCES[version];
    if (!sourceUrl) {
      throw new Error(`Invalid version: ${version}`);
    }

    console.log(`Fetching Bible data from ${sourceUrl}`);
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible data: ${response.statusText}`);
    }

    const bibleData = await response.json();
    console.log(`Bible data fetched successfully. Total books: ${bibleData.length}`);

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
    console.log(`Processing book: ${book.name} (${bookIndex + 1}/${bibleData.length})`);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get book ID
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

    // Process chapters in smaller batches
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
      console.log(`Processing chapter ${chapterIndex + 1}/${book.chapters.length}`);

      // Get or create chapter
      const { data: chapterData, error: chapterError } = await supabaseClient
        .from('bible_chapters')
        .select('id')
        .eq('book_id', bookData.id)
        .eq('chapter_number', chapterIndex + 1)
        .maybeSingle();

      if (chapterError) {
        throw chapterError;
      }

      let chapterId;
      if (!chapterData) {
        console.log(`Creating chapter ${chapterIndex + 1}`);
        const { data: newChapter, error: newChapterError } = await supabaseClient
          .from('bible_chapters')
          .insert({
            book_id: bookData.id,
            chapter_number: chapterIndex + 1
          })
          .select()
          .single();

        if (newChapterError) {
          throw newChapterError;
        }
        chapterId = newChapter.id;
        console.log(`Chapter ${chapterIndex + 1} created successfully`);
      } else {
        chapterId = chapterData.id;
      }

      // Process verses in batches
      const verses = book.chapters[chapterIndex];
      for (let i = 0; i < verses.length; i += BATCH_SIZE) {
        const verseBatch = verses.slice(i, i + BATCH_SIZE);
        const versesData = verseBatch.map((text: string, index: number) => ({
          chapter_id: chapterId,
          verse_number: i + index + 1,
          text: text || '',
          version
        }));

        console.log(`Upserting verses ${i + 1} to ${i + verseBatch.length} of chapter ${chapterIndex + 1}`);

        // Usar upsert em vez de insert
        const { error: versesError } = await supabaseClient
          .from('bible_verses')
          .upsert(versesData, {
            onConflict: 'chapter_id,verse_number,version',
            ignoreDuplicates: false
          });

        if (versesError) {
          console.error('Error upserting verses:', versesError);
          throw versesError;
        }

        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Book ${book.name} processed successfully`,
        stats: {
          bookIndex,
          nextBookIndex: bookIndex + 1,
          totalBooks: bibleData.length,
        }
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