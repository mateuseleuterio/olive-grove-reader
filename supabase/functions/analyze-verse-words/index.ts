import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book, chapter, verse, version, verseText } = await req.json();
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const prompt = `Você é um especialista em línguas bíblicas analisando o texto sagrado.

Contexto do versículo:
- Livro: ${book}
- Capítulo: ${chapter}
- Versículo: ${verse}
- Versão da Bíblia: ${version}

Trecho do versículo:
"${verseText}"

Analise cada palavra ou conjunto de palavras deste versículo e forneça:

Para cada palavra ou grupo de palavras em português, liste:

[PALAVRA]: "{texto em português}"
[ORIGINAL]: {palavra no idioma original} ({idioma: hebraico/grego/aramaico})
[STRONG]: {número strong}
[TRANSLITERAÇÃO]: {transliteração}
[SIGNIFICADO PRINCIPAL]: {significado no contexto}
[SIGNIFICADOS SECUNDÁRIOS]: {outros significados possíveis}
---`;

    console.log('Enviando prompt para Perplexity:', prompt);

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
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Resposta do Perplexity:', analysis);

    // Processar a resposta e extrair os grupos de palavras
    const wordGroups = analysis.split('---').filter(group => group.trim());
    
    // Buscar o verse_id
    const { data: verseData, error: verseError } = await supabase
      .from('bible_verses')
      .select('id')
      .eq('chapter_id', `(SELECT id FROM bible_chapters WHERE book_id = ${book} AND chapter_number = ${chapter})`)
      .eq('verse_number', verse)
      .eq('version', version)
      .single();

    if (verseError) {
      throw verseError;
    }

    // Processar e salvar cada grupo
    for (const group of wordGroups) {
      const lines = group.split('\n').filter(line => line.trim());
      const wordGroup: Record<string, any> = {};

      for (const line of lines) {
        if (line.startsWith('[PALAVRA]:')) {
          wordGroup.words = [line.split(':')[1].trim().replace(/"/g, '')];
        } else if (line.startsWith('[ORIGINAL]:')) {
          const [word, lang] = line.split(':')[1].split('(');
          wordGroup.original_word = word.trim();
          wordGroup.language = lang.replace(')', '').trim().toLowerCase();
        } else if (line.startsWith('[STRONG]:')) {
          wordGroup.strong_number = line.split(':')[1].trim();
        } else if (line.startsWith('[TRANSLITERAÇÃO]:')) {
          wordGroup.transliteration = line.split(':')[1].trim();
        } else if (line.startsWith('[SIGNIFICADO PRINCIPAL]:')) {
          wordGroup.primary_meaning = line.split(':')[1].trim();
        } else if (line.startsWith('[SIGNIFICADOS SECUNDÁRIOS]:')) {
          wordGroup.secondary_meanings = [line.split(':')[1].trim()];
        }
      }

      if (Object.keys(wordGroup).length > 0) {
        const { error: insertError } = await supabase
          .from('bible_word_groups')
          .insert({
            verse_id: verseData.id,
            words: wordGroup.words,
            original_word: wordGroup.original_word,
            language: wordGroup.language,
            strong_number: wordGroup.strong_number,
            transliteration: wordGroup.transliteration,
            primary_meaning: wordGroup.primary_meaning,
            secondary_meanings: wordGroup.secondary_meanings,
            start_index: 0, // Será implementado posteriormente
            end_index: 0, // Será implementado posteriormente
          });

        if (insertError) {
          console.error('Erro ao inserir grupo:', insertError);
          throw insertError;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função analyze-verse-words:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});