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

  const defaultPrompt = `Analise a palavra "{word}" do versículo {book} {chapter}:{verse} da Bíblia e forneça:
1 - Palavra no idioma original (hebraico/grego/aramaico)
2 - Transliteração
3 - Significados principais em ordem de relevância
4 - Significados secundários

Responda apenas com os números e as informações solicitadas, sem texto adicional.`;

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