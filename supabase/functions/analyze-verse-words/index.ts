import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { verseId, verseText, book, chapter, verse } = await req.json();
    
    const prompt = `
    Analyze this Bible verse and identify word groups and their meanings. 
    The verse is from ${book} ${chapter}:${verse}: "${verseText}"
    
    For each significant word or phrase:
    1. List the original language word (Hebrew/Greek/Aramaic)
    2. Provide the Strong's number
    3. Give the transliteration
    4. Explain the primary meaning
    5. List any secondary meanings
    
    Format your response as JSON with this structure:
    {
      "wordGroups": [
        {
          "words": ["word1", "word2"],
          "originalWord": "original",
          "language": "hebrew/greek/aramaic",
          "strongNumber": "H1234",
          "transliteration": "transliterated",
          "primaryMeaning": "main meaning",
          "secondaryMeanings": ["meaning1", "meaning2"],
          "startIndex": 0,
          "endIndex": 5
        }
      ]
    }`;

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a biblical scholar expert in Hebrew, Greek, and Aramaic. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    // Conectar ao Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Inserir cada grupo de palavras no banco
    for (const group of analysis.wordGroups) {
      const { error } = await supabaseClient
        .from('bible_word_groups')
        .insert({
          verse_id: verseId,
          words: group.words,
          original_word: group.originalWord,
          language: group.language.toLowerCase(),
          strong_number: group.strongNumber,
          transliteration: group.transliteration,
          primary_meaning: group.primaryMeaning,
          secondary_meanings: group.secondaryMeanings,
          start_index: group.startIndex,
          end_index: group.endIndex,
          created_by: '5e475092-3de0-47b8-8543-c62450e07bbd' // Admin user
        });

      if (error) {
        console.error('Error inserting word group:', error);
        throw error;
      }
    }

    return new Response(JSON.stringify(analysis), {
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