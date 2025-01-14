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
    const { version } = await req.json()
    
    if (!version) {
      return new Response(
        JSON.stringify({ error: 'Version parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Importing Bible version: ${version}`)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch Bible data from GitHub
    // Usando o caminho correto do repositório e o nome do arquivo em minúsculo
    const response = await fetch(`https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/${version.toLowerCase()}.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Bible data: ${response.statusText}`)
    }
    
    const bibleData = await response.json()
    console.log(`Bible data fetched successfully for version ${version}`)

    let processedCount = 0
    
    for (const book of bibleData) {
      try {
        // Get book_id from existing book
        const { data: bookData, error: bookError } = await supabaseClient
          .from('bible_books')
          .select('id')
          .eq('name', book.name)
          .single()

        if (bookError) {
          console.error(`Error finding book ${book.name}:`, bookError)
          continue
        }

        console.log(`Processing book: ${book.name}`)

        // Insert chapters and verses
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          // Get chapter_id from existing chapter
          const { data: chapterData, error: chapterError } = await supabaseClient
            .from('bible_chapters')
            .select('id')
            .eq('book_id', bookData.id)
            .eq('chapter_number', chapterIndex + 1)
            .single()

          if (chapterError) {
            console.error(`Error finding chapter ${chapterIndex + 1} for book ${book.name}:`, chapterError)
            continue
          }

          console.log(`Processing chapter ${chapterIndex + 1} for book ${book.name}`)

          // Insert verses
          const verses = book.chapters[chapterIndex].map((text: string, index: number) => ({
            chapter_id: chapterData.id,
            verse_number: index + 1,
            text,
            version: version.toUpperCase()
          }))

          const { error: versesError } = await supabaseClient
            .from('bible_verses')
            .insert(verses)

          if (versesError) {
            console.error(`Error inserting verses for chapter ${chapterIndex + 1} of book ${book.name}:`, versesError)
            continue
          }

          console.log(`Inserted verses for chapter ${chapterIndex + 1} of book ${book.name}`)
        }

        processedCount++
      } catch (error) {
        console.error(`Error processing book ${book.name}:`, error)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Importação da versão ${version.toUpperCase()} concluída! ${processedCount} livros processados.` 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in import-github-bibles function:', error)
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