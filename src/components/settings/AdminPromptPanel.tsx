import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPromptPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchCurrentPrompt();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === '5e475092-3de0-47b8-8543-c62450e07bbd') {
      setIsAdmin(true);
    }
  };

  const fetchCurrentPrompt = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'word_details_prompt')
        .single();

      if (error) throw error;
      setPrompt(data?.value || defaultPrompt);
    } catch (error) {
      console.error('Erro ao buscar prompt:', error);
      setPrompt(defaultPrompt);
    }
  };

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

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'word_details_prompt',
          value: prompt
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Prompt atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o prompt.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Prompt</CardTitle>
        <CardDescription>
          Configure o prompt usado para gerar os significados das palavras.
          Use {"{word}"}, {"{book}"}, {"{chapter}"} e {"{verse}"} como placeholders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[200px] font-mono"
        />
        <Button onClick={handleSave}>Salvar Prompt</Button>
      </CardContent>
    </Card>
  );
};

export default AdminPromptPanel;