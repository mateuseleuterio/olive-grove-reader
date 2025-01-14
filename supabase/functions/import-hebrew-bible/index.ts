import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
}

const downloadHebrewBibleData = async () => {
  console.log('Iniciando download do OpenHebrewBible...')
  
  try {
    // Download Hebrew text
    const hebrewTextResponse = await fetch('https://raw.githubusercontent.com/eliranwong/OpenHebrewBible/main/010-BHS-verse-by-verse/BHSA.txt')
    // Download morphology data
    const morphologyResponse = await fetch('https://raw.githubusercontent.com/eliranwong/OpenHebrewBible/main/012-BHS-with-Strong-no-and-morphology/morphology.txt')
    // Download transliteration data
    const transliterationResponse = await fetch('https://raw.githubusercontent.com/eliranwong/OpenHebrewBible/main/011-BHS-with-Strong-no/transliteration.txt')
    
    const hebrewText = await hebrewTextResponse.text()
    const morphology = await morphologyResponse.text()
    const transliteration = await transliterationResponse.text()
    
    return { hebrewText, morphology, transliteration }
  } catch (error) {
    console.error('Erro ao baixar dados do OpenHebrewBible:', error)
    throw error
  }
}

const processHebrewBibleData = async (supabase: any, data: any) => {
  console.log('Processando dados do OpenHebrewBible...')
  
  const { hebrewText, morphology, transliteration } = data
  
  // Process verse by verse
  const verses = hebrewText.split('\n').filter(line => line.trim())
  
  for (const verse of verses) {
    try {
      const [reference, text] = verse.split('\t')
      const [book, chapter, verseNum] = reference.split('.')
      
      // Get chapter_id from bible_chapters
      const { data: chapterData, error: chapterError } = await supabase
        .from('bible_chapters')
        .select('id')
        .eq('book_id', parseInt(book))
        .eq('chapter_number', parseInt(chapter))
        .single()

      if (chapterError) {
        console.error(`Erro ao buscar capítulo ${book}.${chapter}:`, chapterError)
        continue
      }
      
      // Insert Hebrew verse
      const { data: verseData, error: verseError } = await supabase
        .from('hebrew_bible_verses')
        .insert({
          chapter_id: chapterData.id,
          verse_number: parseInt(verseNum),
          hebrew_text: text
        })
        .select()
        .single()

      if (verseError) {
        console.error(`Erro ao inserir versículo ${reference}:`, verseError)
        continue
      }
      
      // Process word parsing
      const words = text.split(' ')
      const morphologyLine = morphology.split('\n').find(line => line.startsWith(reference))
      const transliterationLine = transliteration.split('\n').find(line => line.startsWith(reference))
      
      if (morphologyLine && transliterationLine) {
        const morphologyWords = morphologyLine.split('\t')[1].split(' ')
        const transliterationWords = transliterationLine.split('\t')[1].split(' ')
        
        for (let i = 0; i < words.length; i++) {
          await supabase
            .from('hebrew_word_parsing')
            .insert({
              verse_id: verseData.id,
              word_position: i + 1,
              hebrew_word: words[i],
              transliteration: transliterationWords[i] || '',
              morphology: morphologyWords[i] || '',
              strong_number: morphologyWords[i]?.match(/H\d+/)?.[0] || null
            })
        }
      }
      
    } catch (error) {
      console.error('Erro ao processar versículo:', error)
    }
  }
}

serve(async (req: Request) => {
  const corsResult = handleCors(req)
  if (corsResult) return corsResult

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Credenciais do Supabase não encontradas')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Iniciando importação do OpenHebrewBible...')
    
    const hebrewBibleData = await downloadHebrewBibleData()
    await processHebrewBibleData(supabase, hebrewBibleData)
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erro durante a importação:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})