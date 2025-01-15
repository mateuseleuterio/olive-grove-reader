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
    const { word, book, chapter, verse, context, version } = await req.json();
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Primeiro, verifica se já existe no banco
    const { data: existingMeaning, error: searchError } = await supabase
      .from('word_meanings')
      .select('meaning_details')
      .eq('word', word)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .maybeSingle();

    if (searchError) {
      console.error('Erro ao buscar significado existente:', searchError);
      throw searchError;
    }

    if (existingMeaning) {
      console.log('Significado encontrado no banco:', existingMeaning);
      return new Response(
        JSON.stringify({ result: existingMeaning.meaning_details }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verifica se existe palavra original vinculada
    const { data: verseData } = await supabase
      .from('bible_verses')
      .select('id')
      .eq('version', version)
      .eq('chapter_id', `(SELECT id FROM bible_chapters WHERE book_id = ${book} AND chapter_number = ${chapter})`)
      .single();

    if (verseData) {
      const { data: originalWord } = await supabase
        .from('bible_word_strongs')
        .select('strong_number')
        .eq('verse_id', verseData.id)
        .eq('word', word)
        .maybeSingle();

      if (!originalWord) {
        return new Response(
          JSON.stringify({ 
            result: "Não há originais vinculados a essa palavra. Provavelmente essa palavra foi adicionada na tradução para o português para dar sentido à frase." 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Busca o prompt personalizado
    const { data: promptData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'word_details_prompt')
      .single();

    const defaultPrompt = `Você é um especialista em línguas bíblicas analisando o texto sagrado e esta sendo contratado por uma grande editora para relacionar a concordancia Strongs (numeros strongs) a uma versão da Biblia em Portugues

vou te fornecer as seguintes informações

Contexto do versículo:
- Livro: {book}
- Capítulo: {chapter}
- Versículo: {verse}
- Versão da Bíblia: {version}

Trecho do versículo:
"{context_before} **{word}** {context_after}"

Analise especificamente a palavra destacada entre ** considerando seu contexto no versículo. Mas atente-se ao seguinte

Como bom estudioso de linguas originais, você sabe que algumas palavras adicionadas na versão ao português, não existem na versão original. Por exemplo, no caso de "No principio", a palavra "No" foi adicionado no portugues para dar sentido a frase, porém no original é apenas uma palavra

Logo, se for solicitado a você uma palavra que você percebeu que foi adicionada a mais na tradução do portugues e não esta na concordancia strongs, você vai apenas responder: 
"Não há originais vinculados a essa palavra. Provavelmente essa palavra foi adicionada na tradução para o português para dar sentido à frase."

Isso pode acontecer com palavras como "e", "a" que não tem exatamente um correspondente original, na verdade foram adicionados na tradução

Se você perceber que essa palavra que esta em português, tem um correspondente nas línguas originais e numeros strongs

Forneça: numeros strongs
1 - (Palavra no idioma original informando se é hebraico/grego/aramaico) 
2 - (Transliteração)
3 - (Significado strong) 

Responda apenas com o que foi solicitado e as informações solicitadas, sem texto adicional.`;

    let prompt = (promptData?.value || defaultPrompt)
      .replace('{word}', word)
      .replace('{book}', book)
      .replace('{chapter}', chapter)
      .replace('{verse}', verse)
      .replace('{version}', version)
      .replace('{context_before}', context?.before || '')
      .replace('{context_after}', context?.after || '');

    console.log('Buscando novo significado para:', { word, book, chapter, verse, version, context });
    console.log('Prompt utilizado:', prompt);

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
    const meaningDetails = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ result: meaningDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});