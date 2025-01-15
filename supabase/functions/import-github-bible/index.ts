import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Aumentando o tamanho do lote e reduzindo o delay
const BATCH_SIZE = 100;
const BATCH_DELAY = 50;

serve(async (req) => {
  // Always handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { version, bookIndex = 0 } = await req.json()
    console.log(`Starting import for version ${version}, book index ${bookIndex}`);

    if (!version) {
      throw new Error('Version is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )

    // Deletando versículos existentes em lotes maiores
    if (bookIndex === 0) {
      console.log(`Deleting existing verses for version: ${version}`);
      
      const { error: deleteError } = await supabaseClient
        .from('bible_verses')
        .delete()
        .eq('version', version);

      if (deleteError) {
        console.error('Error deleting existing verses:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted existing verses for version: ${version}`);
    }

    const BIBLE_SOURCES = {
      'AA': 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/aa.json',
      'ACF': 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json',
      'KJF': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/KJF.json',
      'NAA': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/NAA.json',
      'NVT': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/NVT.json',
      'ARA': 'https://raw.githubusercontent.com/damarals/biblias/master/inst/json/ARA.json'
    };

    const sourceUrl = BIBLE_SOURCES[version];
    if (!sourceUrl) {
      throw new Error(`Invalid version: ${version}`);
    }

    console.log(`Fetching Bible data from ${sourceUrl}`);
    const response = await fetch(sourceUrl, { 
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
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

    const { data: bookData, error: bookError } = await supabaseClient
      .from('bible_books')
      .select('id, name')
      .eq('name', book.name)
      .maybeSingle();

    if (bookError) throw bookError;
    if (!bookData) throw new Error(`Book not found: ${book.name}`);

    // Processando capítulos em paralelo com Promise.all
    const chapterPromises = book.chapters.map(async (verses: string[], chapterIndex: number) => {
      const { data: chapterData, error: chapterError } = await supabaseClient
        .from('bible_chapters')
        .select('id')
        .eq('book_id', bookData.id)
        .eq('chapter_number', chapterIndex + 1)
        .maybeSingle();

      if (chapterError) throw chapterError;

      let chapterId;
      if (!chapterData) {
        const { data: newChapter, error: newChapterError } = await supabaseClient
          .from('bible_chapters')
          .insert({
            book_id: bookData.id,
            chapter_number: chapterIndex + 1
          })
          .select()
          .single();

        if (newChapterError) throw newChapterError;
        chapterId = newChapter.id;
      } else {
        chapterId = chapterData.id;
      }

      // Preparando todos os versículos do capítulo
      const allVerses = verses.map((text: string, index: number) => ({
        chapter_id: chapterId,
        verse_number: index + 1,
        text: text || '',
        version
      }));

      // Inserindo versículos em lotes maiores
      for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
        const verseBatch = allVerses.slice(i, i + BATCH_SIZE);
        const { error: versesError } = await supabaseClient
          .from('bible_verses')
          .insert(verseBatch);

        if (versesError) throw versesError;

        if (i + BATCH_SIZE < allVerses.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
    });

    await Promise.all(chapterPromises);

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