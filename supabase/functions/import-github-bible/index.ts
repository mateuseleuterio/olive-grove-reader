import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 50; // Reduzido para 50 versículos por vez
const BATCH_DELAY = 500; // Aumentado para 500ms

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
    
    const responseText = await response.text();
    console.log('Resposta recebida do GitHub, iniciando processamento...');
    
    let bibleData;
    try {
      bibleData = JSON.parse(responseText);
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      throw new Error('JSON inválido recebido da API');
    }

    console.log('Dados JSON parseados com sucesso');

    if (!Array.isArray(bibleData)) {
      throw new Error('Dados inválidos: não é um array');
    }

    let totalProcessed = 0;
    let totalVerses = 0;
    let errors = [];

    for (const book of bibleData) {
      try {
        console.log(`\nProcessando livro: ${book.name}`);
        
        if (!book || typeof book !== 'object') {
          errors.push({ error: 'Livro inválido', data: book });
          continue;
        }

        const { data: bookData, error: bookError } = await supabaseClient
          .from('bible_books')
          .select('id, name')
          .eq('name', book.name)
          .maybeSingle();

        if (bookError) {
          console.error(`Erro ao buscar livro ${book.name}:`, bookError);
          errors.push({ book: book.name, error: bookError });
          continue;
        }

        if (!bookData) {
          const error = `Livro não encontrado: ${book.name}`;
          console.error(error);
          errors.push({ book: book.name, error });
          continue;
        }

        console.log(`Livro encontrado: ${book.name} (ID: ${bookData.id})`);

        if (!Array.isArray(book.chapters)) {
          const error = `Estrutura inválida para o livro ${book.name}: chapters não é um array`;
          console.error(error);
          errors.push({ book: book.name, error });
          continue;
        }

        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapterNumber = chapterIndex + 1;
          const chapter = book.chapters[chapterIndex];
          
          console.log(`Processando ${book.name} ${chapterNumber}`);

          if (!Array.isArray(chapter)) {
            const error = `Estrutura inválida para ${book.name} capítulo ${chapterNumber}: versículos não é um array`;
            console.error(error);
            errors.push({ book: book.name, chapter: chapterNumber, error });
            continue;
          }

          const { data: chapterData, error: chapterError } = await supabaseClient
            .from('bible_chapters')
            .select('id')
            .eq('book_id', bookData.id)
            .eq('chapter_number', chapterNumber)
            .maybeSingle();

          if (chapterError) {
            console.error(`Erro ao buscar capítulo ${chapterNumber}:`, chapterError);
            errors.push({ book: book.name, chapter: chapterNumber, error: chapterError });
            continue;
          }

          if (!chapterData) {
            const error = `Capítulo não encontrado: ${chapterNumber} do livro ${book.name}`;
            console.error(error);
            errors.push({ book: book.name, chapter: chapterNumber, error });
            continue;
          }

          for (let i = 0; i < chapter.length; i += BATCH_SIZE) {
            try {
              const verseBatch = chapter.slice(i, i + BATCH_SIZE);
              const verses = verseBatch.map((text: string, index: number) => ({
                chapter_id: chapterData.id,
                verse_number: i + index + 1,
                text: text || '',
                version: 'AA'
              }));

              console.log(`Inserindo lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(chapter.length / BATCH_SIZE)} (${verses.length} versículos) para ${book.name} ${chapterNumber}`);

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
              // Continua para o próximo lote mesmo com erro
              await new Promise(resolve => setTimeout(resolve, BATCH_DELAY * 2));
            }
          }
        }

        totalProcessed++;
        console.log(`✓ Livro ${book.name} processado com sucesso`);
      } catch (error) {
        console.error(`Erro ao processar livro ${book.name}:`, error);
        errors.push({ book: book.name, error });
      }
    }

    const successMessage = `Importação concluída! ${totalProcessed} livros processados, ${totalVerses} versículos importados.`;
    console.log(successMessage);
    
    if (errors.length > 0) {
      console.error('Erros encontrados durante a importação:', errors);
    }

    const { count: finalCount, error: countError } = await supabaseClient
      .from('bible_verses')
      .select('*', { count: 'exact', head: true })
      .eq('version', 'AA');

    if (countError) {
      console.error('Erro ao contar versículos após importação:', countError);
    } else {
      console.log(`Total de versículos AA após importação: ${finalCount}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: successMessage,
        stats: {
          booksProcessed: totalProcessed,
          versesImported: totalVerses,
          errors: errors.length,
          finalVerseCount: finalCount
        }
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