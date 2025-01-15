import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { word, book, chapter, verse } = await req.json()
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')

    console.log('Buscando detalhes para:', { word, book, chapter, verse })

    const prompt = `Analise a palavra "${word}" do versículo ${book} ${chapter}:${verse} da Bíblia e forneça:
1 - Palavra no idioma original (hebraico/grego/aramaico)
2 - Transliteração
3 - Significados principais em ordem de relevância
4 - Significados secundários

Responda apenas com os números e as informações solicitadas, sem texto adicional.`

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
    console.log('Resposta da API:', data)

    return new Response(
      JSON.stringify({ result: data.choices[0].message.content }),
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