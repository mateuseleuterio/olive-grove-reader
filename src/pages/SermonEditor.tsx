import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';

const SermonEditor = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const { toast } = useToast();

  const generateSermon = async () => {
    if (!prompt) {
      toast({
        title: "Prompt necessário",
        description: "Por favor, insira um tema ou texto base para o sermão.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-sermon', {
        body: { prompt }
      });

      if (error) throw error;

      setAiResponse(data.choices[0].message.content);
      toast({
        title: "Sermão gerado com sucesso!",
        description: "O sermão foi gerado e está pronto para edição.",
      });
    } catch (error) {
      console.error("Erro ao gerar sermão:", error);
      toast({
        title: "Erro ao gerar sermão",
        description: "Houve um erro ao tentar gerar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bible-gray p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-bible-text">
                Tema ou Texto Base
              </label>
              <div className="flex gap-4">
                <Input
                  placeholder="Digite o tema ou texto base do seu sermão"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={generateSermon}
                  disabled={loading}
                  className="w-32"
                >
                  {loading ? "Gerando..." : "Gerar"}
                </Button>
              </div>
            </div>

            {aiResponse && (
              <div className="mt-8">
                <div className="prose prose-bible max-w-none">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SermonEditor;