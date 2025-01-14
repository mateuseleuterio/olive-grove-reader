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

    console.log(`Iniciando importação da versão: ${version}`)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Primeiro, limpar os versículos existentes da versão
    console.log(`Removendo versículos existentes da versão ${version}...`)
    const { error: deleteError } = await supabaseClient
      .from('bible_verses')
      .delete()
      .eq('version', version.toUpperCase())

    if (deleteError) {
      console.error(`Erro ao deletar versículos existentes:`, deleteError)
      throw deleteError
    }

    // Fetch Bible data from GitHub
    const githubUrl = `https://raw.githubusercontent.com/damarals/biblias/32e9176727c73518b7055a1df5d5045df71de496/inst/usx/traducao/${version.toLowerCase()}.json`
    console.log(`Buscando dados da Bíblia em: ${githubUrl}`)
    
    const response = await fetch(githubUrl)
    if (!response.ok) {
      console.error(`Erro ao buscar dados: ${response.status} - ${response.statusText}`)
      throw new Error(`Failed to fetch Bible data: ${response.statusText}`)
    }
    
    const bibleData = await response.json()
    console.log(`Dados da Bíblia obtidos com sucesso para versão ${version}`)

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
          console.error(`Erro ao buscar livro ${book.name}:`, bookError)
          continue
        }

        console.log(`Processando livro: ${book.name}`)

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
            console.error(`Erro ao buscar capítulo ${chapterIndex + 1} do livro ${book.name}:`, chapterError)
            continue
          }

          console.log(`Processando capítulo ${chapterIndex + 1} do livro ${book.name}`)

          // Insert verses
          const verses = book.chapters[chapterIndex].map((verse: any, index: number) => ({
            chapter_id: chapterData.id,
            verse_number: index + 1,
            text: verse.text,
            version: version.toUpperCase()
          }))

          const { error: versesError } = await supabaseClient
            .from('bible_verses')
            .insert(verses)

          if (versesError) {
            console.error(`Erro ao inserir versículos do capítulo ${chapterIndex + 1} do livro ${book.name}:`, versesError)
            continue
          }

          console.log(`Versículos inseridos para o capítulo ${chapterIndex + 1} do livro ${book.name}`)
        }

        processedCount++
      } catch (error) {
        console.error(`Erro ao processar livro ${book.name}:`, error)
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
    console.error('Erro na função import-github-bibles:', error)
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