import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { version } = await req.json()
    if (!version) {
      throw new Error('Version parameter is required')
    }

    console.log(`Importing Bible version: ${version}`)

    // Fetch Bible data from GitHub
    const response = await fetch(`https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${version.toLowerCase()}.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible data: ${response.statusText}`)
    }
    
    const bibleData = await response.json()
    console.log('Bible data fetched successfully')

    let processedCount = 0
    
    for (const book of bibleData) {
      try {
        // Insert book
        const { data: bookData, error: bookError } = await supabaseClient
          .from('bible_books')
          .insert({
            name: book.name,
            abbreviation: book.abbrev,
            testament: book.testament || 'old',
            position: processedCount + 1
          })
          .select()
          .single()

        if (bookError) {
          console.error(`Error inserting book ${book.name}:`, bookError)
          throw bookError
        }

        console.log(`Inserted book: ${book.name}`)

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
            console.error(`Error inserting chapter ${chapterIndex + 1} for book ${book.name}:`, chapterError)
            throw chapterError
          }

          console.log(`Inserted chapter ${chapterIndex + 1} for book ${book.name}`)

          // Insert verses
          const verses = book.chapters[chapterIndex].map((text: string, index: number) => ({
            chapter_id: chapterData.id,
            verse_number: index + 1,
            text,
            version: version
          }))

          const { error: versesError } = await supabaseClient
            .from('bible_verses')
            .insert(verses)

          if (versesError) {
            console.error(`Error inserting verses for chapter ${chapterIndex + 1} of book ${book.name}:`, versesError)
            throw versesError
          }

          console.log(`Inserted verses for chapter ${chapterIndex + 1} of book ${book.name}`)
        }

        processedCount++
      } catch (error) {
        console.error(`Error processing book ${book.name}:`, error)
        throw error
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Importação concluída! ${processedCount} livros processados.` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in import-github-bible function:', error)
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