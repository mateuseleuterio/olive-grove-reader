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

const downloadAndParseStrongs = async () => {
  console.log('Iniciando download do Strong\'s...')
  
  try {
    const hebrewResponse = await fetch('https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew.json')
    const greekResponse = await fetch('https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek.json')
    
    const hebrewData = await hebrewResponse.json()
    const greekData = await greekResponse.json()
    
    return { hebrewData, greekData }
  } catch (error) {
    console.error('Erro ao baixar dados do Strong\'s:', error)
    throw error
  }
}

const processStrongsData = async (supabase: any, data: any, language: 'hebrew' | 'greek') => {
  console.log(`Processando dados ${language}...`)
  
  for (const [strongNumber, entry] of Object.entries(data)) {
    try {
      const { data: existingEntry, error: checkError } = await supabase
        .from('strongs_dictionary')
        .select('id')
        .eq('strong_number', strongNumber)
        .maybeSingle()

      if (checkError) {
        console.error(`Erro ao verificar entrada ${strongNumber}:`, checkError)
        continue
      }
      
      if (!existingEntry) {
        const { error: insertError } = await supabase
          .from('strongs_dictionary')
          .insert({
            strong_number: strongNumber,
            language,
            hebrew_word: language === 'hebrew' ? (entry as any).word : '',
            transliteration: (entry as any).translit || '',
            meaning: (entry as any).def || '',
            portuguese_word: '' // Será preenchido posteriormente
          })

        if (insertError) {
          console.error(`Erro ao inserir entrada ${strongNumber}:`, insertError)
        }
      }
    } catch (error) {
      console.error(`Erro ao processar entrada ${strongNumber}:`, error)
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
    
    console.log('Iniciando importação do Strong\'s...')
    
    const { hebrewData, greekData } = await downloadAndParseStrongs()
    
    await processStrongsData(supabase, hebrewData, 'hebrew')
    await processStrongsData(supabase, greekData, 'greek')
    
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