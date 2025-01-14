import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Lista de versões a serem importadas
    const versions = ['ACF', 'AA', 'NVI', 'RA', 'NTLH'];
    let totalProcessed = 0;

    for (const version of versions) {
      console.log(`Iniciando importação da versão: ${version}`);
      
      // Fetch Bible data from GitHub
      const response = await fetch(`https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${version.toLowerCase()}.json`);
      if (!response.ok) {
        console.error(`Falha ao buscar dados da versão ${version}: ${response.statusText}`);
        continue;
      }
      
      const bibleData = await response.json();
      console.log(`Dados da versão ${version} obtidos com sucesso`);

      for (const book of bibleData) {
        try {
          // Insert or get book
          const { data: bookData, error: bookError } = await supabaseClient
            .from('bible_books')
            .select('id')
            .eq('name', book.name)
            .maybeSingle();

          if (bookError) {
            console.error(`Erro ao buscar livro ${book.name}:`, bookError);
            continue;
          }

          let bookId;
          if (!bookData) {
            const { data: newBook, error: newBookError } = await supabaseClient
              .from('bible_books')
              .insert({
                name: book.name,
                abbreviation: book.abbrev,
                testament: book.testament || 'old',
                position: totalProcessed + 1
              })
              .select()
              .single();

            if (newBookError) {
              console.error(`Erro ao inserir livro ${book.name}:`, newBookError);
              continue;
            }
            bookId = newBook.id;
          } else {
            bookId = bookData.id;
          }

          // Process chapters and verses
          for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
            // Insert or get chapter
            const { data: chapterData, error: chapterError } = await supabaseClient
              .from('bible_chapters')
              .select('id')
              .eq('book_id', bookId)
              .eq('chapter_number', chapterIndex + 1)
              .maybeSingle();

            if (chapterError) {
              console.error(`Erro ao buscar capítulo ${chapterIndex + 1}:`, chapterError);
              continue;
            }

            let chapterId;
            if (!chapterData) {
              const { data: newChapter, error: newChapterError } = await supabaseClient
                .from('bible_chapters')
                .insert({
                  book_id: bookId,
                  chapter_number: chapterIndex + 1
                })
                .select()
                .single();

              if (newChapterError) {
                console.error(`Erro ao inserir capítulo ${chapterIndex + 1}:`, newChapterError);
                continue;
              }
              chapterId = newChapter.id;
            } else {
              chapterId = chapterData.id;
            }

            // Insert verses
            const verses = book.chapters[chapterIndex].map((text: string, index: number) => ({
              chapter_id: chapterId,
              verse_number: index + 1,
              text,
              version: version
            }));

            const { error: versesError } = await supabaseClient
              .from('bible_verses')
              .insert(verses);

            if (versesError) {
              console.error(`Erro ao inserir versículos do capítulo ${chapterIndex + 1}:`, versesError);
              continue;
            }

            console.log(`Versículos do capítulo ${chapterIndex + 1} do livro ${book.name} (${version}) inseridos com sucesso`);
          }

          totalProcessed++;
        } catch (error) {
          console.error(`Erro ao processar livro ${book.name}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Importação concluída! ${totalProcessed} livros processados.` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Erro na função de importação:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    )
  }
})