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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch Bible data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json')
    const bibleData = await response.json()

    let processedCount = 0
    
    for (const book of bibleData) {
      // Insert book
      const { data: bookData, error: bookError } = await supabaseClient
        .from('bible_books')
        .insert({
          name: book.name,
          abbreviation: book.abbrev,
          testament: book.testament || 'old', // você precisará especificar isso no JSON
          position: processedCount + 1
        })
        .select()
        .single()

      if (bookError) {
        throw bookError
      }

      // Insert chapters and verses
      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
        // Insert chapter
        const { data: chapterData, error: chapterError } = await supabaseClient
          .from('bible_chapters')
          .insert({
            book_id: bookData.id,
            chapter_number: chapterIndex + 1
          })
          .select()
          .single()

        if (chapterError) {
          throw chapterError
        }

        // Insert verses
        const verses = book.chapters[chapterIndex].map((text: string, index: number) => ({
          chapter_id: chapterData.id,
          verse_number: index + 1,
          text,
          version: 'ACF'
        }))

        const { error: versesError } = await supabaseClient
          .from('bible_verses')
          .insert(verses)

        if (versesError) {
          throw versesError
        }
      }

      processedCount++
    }

    return new Response(
      JSON.stringify({ message: `Importação concluída! ${processedCount} livros processados.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})