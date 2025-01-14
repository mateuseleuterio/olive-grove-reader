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
  'KJF': 'https://raw.githubusercontent.com/damarals/biblias/refs/heads/master/inst/json/KJF.json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { bookIndex = 0, version = 'AA' } = await req.json();
    
    console.log(`Iniciando importação do livro índice ${bookIndex} da versão ${version}`);

    const response = await fetch(BIBLE_SOURCES[version] || BIBLE_SOURCES.AA);
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }
    
    const bibleData = await response.json();
    
    if (!Array.isArray(bibleData)) {
      throw new Error('Dados inválidos: não é um array');
    }

    if (bookIndex >= bibleData.length) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Importação concluída! Todos os livros foram processados.',
          totalBooks: bibleData.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const book = bibleData[bookIndex];
    let totalVerses = 0;
    let errors = [];

    try {
      console.log(`\nProcessando livro: ${book.name}`);
      
      if (!book || typeof book !== 'object') {
        throw new Error('Livro inválido');
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
        throw new Error(`Livro não encontrado: ${book.name}`);
      }

      console.log(`Livro encontrado: ${book.name} (ID: ${bookData.id})`);

      if (!Array.isArray(book.chapters)) {
        throw new Error(`Estrutura inválida para o livro ${book.name}: chapters não é um array`);
      }

      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
        const chapterNumber = chapterIndex + 1;
        const chapter = book.chapters[chapterIndex];
        
        console.log(`Processando ${book.name} ${chapterNumber}`);

        if (!Array.isArray(chapter)) {
          throw new Error(`Estrutura inválida para ${book.name} capítulo ${chapterNumber}`);
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
          throw new Error(`Capítulo não encontrado: ${chapterNumber} do livro ${book.name}`);
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

            console.log(`Inserindo lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(chapter.length / BATCH_SIZE)} (${verses.length} versículos)`);

            const { error: versesError } = await supabaseClient
              .from('bible_verses')
              .insert(verses);

            if (versesError) {
              throw versesError;
            }

            totalVerses += verses.length;
            console.log(`✓ Lote processado com sucesso`);
            
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          } catch (error) {
            console.error(`Erro ao processar lote de versículos:`, error);
            errors.push({ 
              book: book.name, 
              chapter: chapterNumber, 
              batch: Math.floor(i / BATCH_SIZE) + 1,
              error 
            });
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          }
        }
      }

      console.log(`✓ Livro ${book.name} processado com sucesso`);
    } catch (error) {
      console.error(`Erro ao processar livro ${book.name}:`, error);
      errors.push({ book: book.name, error });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Livro ${book.name} processado`,
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
    console.error('Erro na função de importação:', error);
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