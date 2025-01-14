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
    
    // Primeiro, vamos limpar os versículos AA existentes
    const { error: deleteError } = await supabaseClient
      .from('bible_verses')
      .delete()
      .eq('version', 'AA');

    if (deleteError) {
      console.error('Erro ao limpar versículos AA:', deleteError);
      throw deleteError;
    }

    console.log('Versículos AA anteriores removidos com sucesso');
    
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/aa.json');
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }
    
    const bibleData = await response.json();
    console.log(`Dados obtidos com sucesso. Total de livros:`, bibleData.length);

    let totalProcessed = 0;
    let totalVerses = 0;

    for (const book of bibleData) {
      try {
        console.log(`\nProcessando livro: ${book.name}`);
        
        // Buscar o livro existente
        const { data: bookData, error: bookError } = await supabaseClient
          .from('bible_books')
          .select('id, name')
          .eq('name', book.name)
          .maybeSingle();

        if (bookError) {
          console.error(`Erro ao buscar livro ${book.name}:`, bookError);
          continue;
        }

        if (!bookData) {
          console.error(`Livro não encontrado: ${book.name}`);
          continue;
        }

        console.log(`Livro encontrado: ${book.name} (ID: ${bookData.id})`);

        // Process chapters and verses
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapterNumber = chapterIndex + 1;
          console.log(`Processando ${book.name} ${chapterNumber}`);

          // Buscar o capítulo existente
          const { data: chapterData, error: chapterError } = await supabaseClient
            .from('bible_chapters')
            .select('id')
            .eq('book_id', bookData.id)
            .eq('chapter_number', chapterNumber)
            .maybeSingle();

          if (chapterError) {
            console.error(`Erro ao buscar capítulo ${chapterNumber}:`, chapterError);
            continue;
          }

          if (!chapterData) {
            console.error(`Capítulo não encontrado: ${chapterNumber} do livro ${book.name}`);
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
            console.error(`Erro ao inserir versículos do capítulo ${chapterNumber}:`, versesError);
            continue;
          }

          totalVerses += verses.length;
          console.log(`✓ ${verses.length} versículos inseridos para ${book.name} ${chapterNumber}`);
        }

        totalProcessed++;
        console.log(`✓ Livro ${book.name} processado com sucesso`);
      } catch (error) {
        console.error(`Erro ao processar livro ${book.name}:`, error);
      }
    }

    const successMessage = `Importação concluída! ${totalProcessed} livros processados, ${totalVerses} versículos importados.`;
    console.log(successMessage);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: successMessage
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