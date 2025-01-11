import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SermonEditor = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const sermonId = searchParams.get('id');
  
  const [title, setTitle] = useState("");
  const [bibleText, setBibleText] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [points, setPoints] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (sermonId) {
      loadSermon(sermonId);
    }
  }, [sermonId]);

  const loadSermon = async (id: string) => {
    try {
      const { data: sermon, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (sermon) {
        setTitle(sermon.title || "");
        setBibleText(sermon.bible_text || "");
        setIntroduction(sermon.introduction || "");
        setPoints(sermon.points || []);
        setConclusion(sermon.conclusion || "");
      }
    } catch (error) {
      console.error("Error loading sermon:", error);
      toast({
        title: "Erro ao carregar sermão",
        description: "Houve um erro ao tentar carregar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleAddPoint = () => {
    setPoints([...points, ""]);
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleDeletePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  const handleSaveSermon = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro ao salvar sermão",
          description: "Você precisa estar logado para salvar um sermão.",
          variant: "destructive",
        });
        return;
      }

      let sermonData = {
        user_id: user.id,
        title: title || "Sermão sem título",
        bible_text: bibleText,
        introduction,
        points: points.length > 0 ? points : null,
        conclusion,
      };

      if (type === "ai" && aiResponse) {
        // Parse AI response into sections
        const sections = aiResponse.split("\n\n");
        sermonData = {
          ...sermonData,
          introduction: sections[0],
          points: sections.slice(1, -1),
          conclusion: sections[sections.length - 1],
        };
      }

      let error;
      if (sermonId) {
        // Update existing sermon
        ({ error } = await supabase
          .from("sermons")
          .update(sermonData)
          .eq("id", sermonId));
      } else {
        // Insert new sermon
        ({ error } = await supabase.from("sermons").insert(sermonData));
      }

      if (error) throw error;

      toast({
        title: "Sermão salvo com sucesso!",
        description: "Seu sermão foi salvo e está disponível em 'Meus Sermões'.",
      });

      navigate("/sermon-builder");
    } catch (error) {
      console.error("Erro ao salvar sermão:", error);
      toast({
        title: "Erro ao salvar sermão",
        description: "Houve um erro ao tentar salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const generateSermon = async () => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua chave da API Perplexity para continuar.",
        variant: "destructive",
      });
      return;
    }

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
              content: "Você é um assistente especializado em criar sermões. Crie sermões bem estruturados, bíblicos e edificantes. Use linguagem clara e acessível."
            },
            {
              role: "user",
              content: `Crie um sermão sobre o seguinte tema/texto: ${prompt}. 
                       Estruture o sermão com introdução, desenvolvimento (com pontos principais) e conclusão.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar o sermão");
      }

      const data = await response.json();
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

  if (type === "structure") {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-bible-navy">
                1. Título - Texto Base
              </label>
              <Input 
                placeholder="Digite o título e o texto base do sermão (ex: A Criação - Gênesis 1:1)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-bible-navy">
                2. Texto Bíblico
              </label>
              <Textarea 
                placeholder="Digite o texto bíblico completo" 
                value={bibleText}
                onChange={(e) => setBibleText(e.target.value)}
                className="font-serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-bible-navy">
                3. Introdução
              </label>
              <Textarea 
                placeholder="Digite a introdução do sermão" 
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="font-serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-bible-navy">
                4. Desenvolvimento
              </label>
              <div className="space-y-4">
                {points.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2 text-bible-navy">
                        Ponto {index + 1}
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          value={point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          placeholder={`Digite o ponto ${index + 1}`}
                          className="font-serif"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePoint(index)}
                          className="self-start"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPoint}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ponto
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-bible-navy">
                5. Conclusão
              </label>
              <Textarea 
                placeholder="Digite a conclusão do sermão" 
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="font-serif"
              />
            </div>

            <Button 
              className="w-full bg-bible-navy hover:bg-bible-accent"
              onClick={handleSaveSermon}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Sermão
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bible-gray p-8">
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
          <h1 className="text-2xl font-serif mb-6 text-bible-navy">
            {type === "blank" && "Sermão em Branco"}
            {type === "ai" && "Sermão com IA"}
          </h1>

          {type === "blank" && (
            <>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-bible-navy">
                    Título do Sermão
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o título do sermão"
                    className="font-serif"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-bible-navy">
                    Texto Bíblico
                  </label>
                  <Textarea
                    value={bibleText}
                    onChange={(e) => setBibleText(e.target.value)}
                    placeholder="Digite o texto bíblico"
                    className="font-serif"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-bible-navy">
                    Conteúdo do Sermão
                  </label>
                  <Textarea
                    className="min-h-[500px] font-serif"
                    placeholder="Digite seu sermão aqui..."
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full bg-bible-navy hover:bg-bible-accent"
                  onClick={handleSaveSermon}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Sermão
                </Button>
              </div>
            </>
          )}

          {type === "ai" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-bible-navy">
                  API Key da Perplexity
                </label>
                <Input
                  type="password"
                  placeholder="Insira sua API key da Perplexity"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Nota: Esta é uma solução temporária. Em um ambiente de produção, as chaves API devem ser armazenadas de forma segura.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-bible-navy">
                  Tema ou Texto Base
                </label>
                <Input
                  placeholder="Digite o tema ou texto base do seu sermão"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-bible-navy hover:bg-bible-accent" 
                onClick={generateSermon}
                disabled={loading}
              >
                {loading ? "Gerando..." : "Gerar Sermão"}
              </Button>

              <div>
                <label className="block text-sm font-medium mb-2 text-bible-navy">
                  Sermão Gerado
                </label>
                <Textarea
                  className="min-h-[400px] font-serif"
                  placeholder="O sermão gerado aparecerá aqui..."
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                />
              </div>

              {aiResponse && (
                <Button 
                  className="w-full bg-bible-navy hover:bg-bible-accent"
                  onClick={handleSaveSermon}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Sermão
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SermonEditor;
