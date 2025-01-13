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
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Exemplo de estrutura de dados da fonte externa
    const sampleMappings = [
      { word: "deus", strong_number: "H430" },
      { word: "criou", strong_number: "H1254" },
      { word: "céus", strong_number: "H8064" },
      { word: "terra", strong_number: "H776" }
    ]

    // Inserir mapeamentos
    const { data, error } = await supabaseClient
      .from('bible_word_strongs_mapping')
      .upsert(
        sampleMappings,
        { onConflict: 'word,strong_number' }
      )

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mapeamentos importados com sucesso',
        data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})