import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch the Bible data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/gapmiss/berean-study-bible-with-strongs/master/berean-study-bible.json')
    const data = await response.json()

    for (const book of data) {
      // Get or create book
      const { data: bookData, error: bookError } = await supabase
        .from('bible_books')
        .select('id')
        .eq('name', book.name)
        .maybeSingle()

      if (bookError) throw bookError

      let bookId = bookData?.id

      if (!bookId) {
        const { data: newBook, error: newBookError } = await supabase
          .from('bible_books')
          .insert({
            name: book.name,
            testament: book.testament,
            position: book.position
          })
          .select('id')
          .single()

        if (newBookError) throw newBookError
        bookId = newBook.id
      }

      // Process chapters
      for (const chapter of book.chapters) {
        // Create chapter
        const { data: chapterData, error: chapterError } = await supabase
          .from('bible_chapters')
          .insert({
            book_id: bookId,
            chapter_number: chapter.number
          })
          .select('id')
          .single()

        if (chapterError) throw chapterError

        // Process verses
        for (const verse of chapter.verses) {
          // Insert verse
          const { data: verseData, error: verseError } = await supabase
            .from('bible_verses')
            .insert({
              chapter_id: chapterData.id,
              verse_number: verse.number,
              text: verse.text,
              version: 'BSB'
            })
            .select('id')
            .single()

          if (verseError) throw verseError

          // Process Strong's numbers
          if (verse.strongs) {
            for (const [position, strongNumber] of verse.strongs.entries()) {
              await supabase
                .from('bible_word_strongs')
                .insert({
                  verse_id: verseData.id,
                  word_position: position + 1,
                  word: verse.text.split(' ')[position],
                  strong_number: strongNumber
                })
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Bible imported successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})