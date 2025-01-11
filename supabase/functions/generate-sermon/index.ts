import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, style } = await req.json();

    console.log(`Generating sermon about ${topic} in ${style} style`);

    const systemPrompt = `You are a helpful assistant that generates sermon outlines. Create a well-structured sermon with the following format:
    {
      "title": "An engaging title for the sermon",
      "introduction": "A compelling introduction that sets up the main message",
      "points": ["Main point 1", "Main point 2", "Main point 3"],
      "conclusion": "A powerful conclusion that ties everything together"
    }
    
    Make the sermon ${style} in style and focused on ${topic}.
    For expository style, focus on explaining the biblical text.
    For topical style, organize around the main theme.
    For narrative style, use storytelling elements.
    For practical style, emphasize application to daily life.
    
    Keep the response concise but meaningful.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create a ${style} sermon about ${topic}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    console.log('Sermon generated successfully');
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});