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
    const { content } = await req.json()
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
            content: `You are a sermon formatting assistant. Format sermons with clear structure and beautiful typography.
                     Use the following format:
                     
                     # Title
                     [Create a compelling title based on the content]
                     
                     ## Introduction
                     [Format the introduction]
                     
                     ## Main Points
                     
                     ### 1. [First Main Point]
                     [Content with proper formatting]
                     
                     ### 2. [Second Main Point]
                     [Content with proper formatting]
                     
                     ### 3. [Third Main Point]
                     [Content with proper formatting]
                     
                     ## Conclusion
                     [Format the conclusion]
                     
                     ## Application
                     [Add practical application points]`
          },
          {
            role: "user",
            content: `Format this sermon content: ${content}`
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