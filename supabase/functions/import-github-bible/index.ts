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
    
    // Fazer o fetch e logar a resposta bruta para debug
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/refs/heads/master/json/aa.json');
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados: ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('Resposta bruta do GitHub:', responseText.substring(0, 500) + '...');
    
    let bibleData;
    try {
      bibleData = JSON.parse(responseText);
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      throw new Error('JSON inválido recebido da API');
    }

    console.log('Estrutura dos dados:', {
      tipo: typeof bibleData,
      eArray: Array.isArray(bibleData),
      tamanho: Array.isArray(bibleData) ? bibleData.length : 0,
      amostra: Array.isArray(bibleData) ? JSON.stringify(bibleData[0]).substring(0, 200) : null
    });

    if (!Array.isArray(bibleData)) {
      throw new Error('Dados inválidos: não é um array');
    }

    let totalProcessed = 0;
    let totalVerses = 0;
    let errors = [];

    for (const book of bibleData) {
      try {
        console.log(`\nProcessando livro:`, book);
        
        if (!book || typeof book !== 'object') {
          errors.push({ error: 'Livro inválido', data: book });
          continue;
        }

        // Buscar o livro existente
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
        console.log('Capítulos:', book.chapters);

        if (!Array.isArray(book.chapters)) {
          const error = `Estrutura inválida para o livro ${book.name}: chapters não é um array`;
          console.error(error);
          errors.push({ book: book.name, error });
          continue;
        }

        // Process chapters and verses
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapterNumber = chapterIndex + 1;
          const chapter = book.chapters[chapterIndex];
          
          console.log(`Processando ${book.name} ${chapterNumber}:`, chapter);

          if (!Array.isArray(chapter)) {
            const error = `Estrutura inválida para ${book.name} capítulo ${chapterNumber}: versículos não é um array`;
            console.error(error);
            errors.push({ book: book.name, chapter: chapterNumber, error });
            continue;
          }

          // Buscar o capítulo existente
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

          // Insert verses
          const verses = chapter.map((text: string, index: number) => ({
            chapter_id: chapterData.id,
            verse_number: index + 1,
            text: text || '',
            version: 'AA'
          }));

          console.log(`Inserindo ${verses.length} versículos para ${book.name} ${chapterNumber}`);
          console.log('Primeiro versículo:', verses[0]);

          const { error: versesError } = await supabaseClient
            .from('bible_verses')
            .insert(verses);

          if (versesError) {
            console.error(`Erro ao inserir versículos do capítulo ${chapterNumber}:`, versesError);
            errors.push({ book: book.name, chapter: chapterNumber, error: versesError });
            continue;
          }

          totalVerses += verses.length;
          console.log(`✓ ${verses.length} versículos inseridos para ${book.name} ${chapterNumber}`);
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

    // Verificar o total de versículos após a importação
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