import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface BibleBook {
  abbrev: string;
  book: string;
  chapters: string[][];
}

serve(async (req) => {
  try {
    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Receber dados do request
    const { books, version } = await req.json();

    if (!Array.isArray(books) || !version) {
      return new Response(
        JSON.stringify({ error: 'Formato inválido. Necessário array de livros e versão.' }),
        { status: 400 }
      );
    }

    const results = [];

    for (const book of books) {
      try {
        // 1. Inserir ou buscar o livro
        const { data: bookData, error: bookError } = await supabase
          .from('bible_books')
          .select('id')
          .eq('abbreviation', book.abbrev)
          .maybeSingle();

        if (bookError) throw bookError;

        let bookId;
        if (!bookData) {
          const { data: newBook, error: newBookError } = await supabase
            .from('bible_books')
            .insert({
              name: book.book,
              abbreviation: book.abbrev,
              testament: 'old', // Você pode ajustar isso baseado em alguma lógica
              position: 1 // Você precisa definir a posição correta
            })
            .select('id')
            .single();

          if (newBookError) throw newBookError;
          bookId = newBook.id;
        } else {
          bookId = bookData.id;
        }

        // 2. Processar cada capítulo
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          // Inserir capítulo
          const { data: chapterData, error: chapterError } = await supabase
            .from('bible_chapters')
            .insert({
              book_id: bookId,
              chapter_number: chapterIndex + 1
            })
            .select('id')
            .single();

          if (chapterError && !chapterError.message.includes('duplicate')) {
            throw chapterError;
          }

          // Buscar ID do capítulo se já existir
          let chapterId;
          if (chapterError?.message.includes('duplicate')) {
            const { data: existingChapter } = await supabase
              .from('bible_chapters')
              .select('id')
              .eq('book_id', bookId)
              .eq('chapter_number', chapterIndex + 1)
              .single();
            chapterId = existingChapter?.id;
          } else {
            chapterId = chapterData?.id;
          }

          // 3. Inserir versículos
          const verses = book.chapters[chapterIndex];
          for (let verseIndex = 0; verseIndex < verses.length; verseIndex++) {
            const { error: verseError } = await supabase
              .from('bible_verses')
              .insert({
                chapter_id: chapterId,
                verse_number: verseIndex + 1,
                text: verses[verseIndex],
                version: version
              });

            if (verseError && !verseError.message.includes('duplicate')) {
              throw verseError;
            }
          }
        }

        results.push({
          book: book.book,
          status: 'success'
        });

      } catch (error) {
        results.push({
          book: book.book,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Importação concluída', results }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});