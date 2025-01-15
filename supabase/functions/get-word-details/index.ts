import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { word, book, chapter, verse, context } = await req.json()
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Primeiro, verifica se já existe no banco
    const { data: existingMeaning, error: searchError } = await supabase
      .from('word_meanings')
      .select('meaning_details')
      .eq('word', word)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .maybeSingle()

    if (searchError) {
      console.error('Erro ao buscar significado existente:', searchError)
      throw searchError
    }

    if (existingMeaning) {
      console.log('Significado encontrado no banco:', existingMeaning)
      return new Response(
        JSON.stringify({ result: existingMeaning.meaning_details }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Busca o prompt personalizado
    const { data: promptData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'word_details_prompt')
      .single()

    const defaultPrompt = `Analise a palavra "{word}" do versículo {book} {chapter}:{verse} da Bíblia, considerando o seguinte contexto:

Palavras anteriores: {context_before}
Palavra analisada: {word}
Palavras posteriores: {context_after}

Forneça:
1 - Palavra no idioma original (hebraico/grego/aramaico)
2 - Transliteração
3 - Significados principais em ordem de relevância
4 - Significados secundários

Responda apenas com os números e as informações solicitadas, sem texto adicional.`

    let prompt = promptData?.value || defaultPrompt
    
    // Substitui os placeholders
    prompt = prompt
      .replace('{word}', word)
      .replace('{book}', book)
      .replace('{chapter}', chapter)
      .replace('{verse}', verse)
      .replace('{context_before}', context?.before || '')
      .replace('{context_after}', context?.after || '')

    console.log('Buscando novo significado para:', { word, book, chapter, verse, context })

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em línguas bíblicas. Seja preciso e conciso.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    const meaningDetails = data.choices[0].message.content

    return new Response(
      JSON.stringify({ result: meaningDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})