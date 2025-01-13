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
    const { word } = await req.json()

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Primeiro, vamos buscar o contexto da palavra na versão ARA
    const { data: verses, error: versesError } = await supabaseClient
      .from('bible_verses')
      .select('text')
      .textSearch('text', word)
      .eq('version', 'ARA')
      .limit(3);

    if (versesError) throw versesError;

    // Buscar números strongs existentes para referência
    const { data: strongs, error: strongsError } = await supabaseClient
      .from('strongs_dictionary')
      .select('strong_number, hebrew_word, meaning')
      .limit(100);

    if (strongsError) throw strongsError;

    // Preparar o prompt para o Perplexity
    const context = verses?.map(v => v.text).join('\n');
    const strongsList = strongs?.map(s => 
      `${s.strong_number}: ${s.hebrew_word} - ${s.meaning}`
    ).join('\n');

    const prompt = `
    Analise a palavra em português "${word}" no contexto bíblico:
    
    Contexto dos versículos:
    ${context}
    
    Com base nestes números Strong's disponíveis:
    ${strongsList}
    
    Retorne apenas os 3 números Strong's mais prováveis em formato JSON:
    {
      "suggestions": [
        {"strongNumber": "H1234", "confidence": 0.95},
        {"strongNumber": "H5678", "confidence": 0.85},
        {"strongNumber": "H9012", "confidence": 0.75}
      ]
    }
    `;

    // Fazer requisição para o Perplexity
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de textos bíblicos e dicionário Strong.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error('Erro na requisição do Perplexity');
    }

    const perplexityData = await perplexityResponse.json();
    const suggestions = JSON.parse(perplexityData.choices[0].message.content);

    return new Response(
      JSON.stringify(suggestions),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});