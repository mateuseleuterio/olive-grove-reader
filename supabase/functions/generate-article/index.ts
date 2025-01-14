import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
            content: `Você é um assistente especializado em criar artigos cristãos.
                     Crie artigos bem estruturados, bíblicos e edificantes.
                     Use linguagem clara e acessível.
                     Retorne o artigo no seguinte formato JSON:
                     {
                       "title": "Título do artigo",
                       "description": "Breve descrição do artigo",
                       "content": "Conteúdo completo do artigo"
                     }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate article')
    }

    const data = await response.json()
    
    // Tenta extrair o JSON do texto gerado
    let content;
    try {
      const lastMessage = data.choices[0].message.content;
      content = JSON.parse(lastMessage);
    } catch (e) {
      console.error('Error parsing JSON from response:', e);
      content = {
        title: "",
        description: "",
        content: data.choices[0].message.content
      };
    }

    return new Response(JSON.stringify({ content }), {
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