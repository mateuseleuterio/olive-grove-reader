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

    console.log('Iniciando importação da versão AA');
    
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/aa.json');
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }
    
    const bibleData = await response.json();
    console.log(`Dados obtidos com sucesso. Total de livros:`, bibleData.length);

    let totalProcessed = 0;

    for (const book of bibleData) {
      try {
        // Buscar o livro existente
        const { data: bookData } = await supabaseClient
          .from('bible_books')
          .select('id, name')
          .eq('name', book.name)
          .maybeSingle();

        if (!bookData) {
          console.error(`Livro não encontrado: ${book.name}`);
          continue;
        }

        console.log(`Processando livro: ${book.name} (ID: ${bookData.id})`);

        // Process chapters and verses
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          // Buscar o capítulo existente
          const { data: chapterData } = await supabaseClient
            .from('bible_chapters')
            .select('id')
            .eq('book_id', bookData.id)
            .eq('chapter_number', chapterIndex + 1)
            .maybeSingle();

          if (!chapterData) {
            console.error(`Capítulo não encontrado: ${chapterIndex + 1} do livro ${book.name}`);
            continue;
          }

          // Verificar se já existem versículos para esta versão e capítulo
          const { count: existingVerses } = await supabaseClient
            .from('bible_verses')
            .select('*', { count: 'exact', head: true })
            .eq('chapter_id', chapterData.id)
            .eq('version', 'AA');

          if (existingVerses && existingVerses > 0) {
            console.log(`Versículos já existem para ${book.name} ${chapterIndex + 1} (AA). Pulando...`);
            continue;
          }

          // Insert verses
          const verses = book.chapters[chapterIndex].map((text: string, index: number) => ({
            chapter_id: chapterData.id,
            verse_number: index + 1,
            text,
            version: 'AA'
          }));

          const { error: versesError } = await supabaseClient
            .from('bible_verses')
            .insert(verses);

          if (versesError) {
            console.error(`Erro ao inserir versículos do capítulo ${chapterIndex + 1}:`, versesError);
            continue;
          }

          console.log(`Versículos do capítulo ${chapterIndex + 1} do livro ${book.name} (AA) inseridos com sucesso`);
        }

        totalProcessed++;
      } catch (error) {
        console.error(`Erro ao processar livro ${book.name}:`, error);
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