import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')

    if (!apiKey) {
      throw new Error('API key not configured')
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em criar sermões. 
                     Crie sermões bem estruturados, bíblicos e edificantes.
                     Use linguagem clara e acessível.
                     Formate o sermão da seguinte maneira:
                     
                     # Título
                     [Título sugerido baseado no tema/texto]
                     
                     ## Texto Base
                     [Versículo ou passagem bíblica principal]
                     
                     ## Introdução
                     [Introdução cativante e contextualizada]
                     
                     ## Desenvolvimento
                     
                     ### 1. [Primeiro Ponto Principal]
                     - Explicação detalhada
                     - Aplicação prática
                     - Versículos de suporte
                     
                     ### 2. [Segundo Ponto Principal]
                     - Explicação detalhada
                     - Aplicação prática
                     - Versículos de suporte
                     
                     ### 3. [Terceiro Ponto Principal]
                     - Explicação detalhada
                     - Aplicação prática
                     - Versículos de suporte
                     
                     ## Conclusão
                     [Conclusão impactante com chamada à ação]
                     
                     ## Oração Final
                     [Sugestão de oração para encerrar]`
          },
          {
            role: "user",
            content: `Crie um sermão sobre o seguinte tema/texto: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate sermon')
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})