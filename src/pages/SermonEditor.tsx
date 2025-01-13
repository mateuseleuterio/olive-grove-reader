import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { SermonType } from "@/types/sermon";

const SermonEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const type = location.pathname.split("/").pop();

  // State for blank sermon
  const [blankTitle, setBlankTitle] = useState("");
  const [blankContent, setBlankContent] = useState("");

  // State for structured sermon
  const [structuredTitle, setStructuredTitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [points, setPoints] = useState<NonNullable<SermonType['points']>>([
    { title: "", content: "", illustrations: [] }
  ]);
  const [conclusion, setConclusion] = useState("");

  // State for AI sermon
  const [prompt, setPrompt] = useState("");
  const [generatedSermon, setGeneratedSermon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Only fetch if id is a valid UUID
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch existing sermon if in edit mode
  const { data: existingSermon } = useQuery({
    queryKey: ["sermon", id],
    queryFn: async () => {
      if (!isValidUUID) return null;
      
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isValidUUID,
  });

  // Load existing sermon data
  useEffect(() => {
    if (existingSermon) {
      if (existingSermon.bible_text) {
        setBlankTitle(existingSermon.title);
        setBlankContent(existingSermon.bible_text);
      } else {
        setStructuredTitle(existingSermon.title);
        setIntroduction(existingSermon.introduction || "");
        if (existingSermon.points) {
          const existingPoints = existingSermon.points as NonNullable<SermonType['points']>;
          setPoints(existingPoints.map(point => ({
            ...point,
            illustrations: point.illustrations || []
          })));
        }
        setConclusion(existingSermon.conclusion || "");
      }
    }
  }, [existingSermon]);

  const handleSaveSermon = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let sermonData: Partial<SermonType> = {
        id: isValidUUID ? id : undefined,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Default anonymous user
        title: "",
        bible_text: null,
        introduction: null,
        points: null,
        conclusion: null,
      };

      if (type === "blank" || (existingSermon && existingSermon.bible_text)) {
        if (!blankTitle.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, adicione um título para o sermão",
            variant: "destructive",
          });
          return;
        }

        sermonData = {
          ...sermonData,
          title: blankTitle,
          bible_text: blankContent,
        };
      } else if (type === "structure" || (existingSermon && !existingSermon.bible_text)) {
        if (!structuredTitle.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, adicione um título para o sermão",
            variant: "destructive",
          });
          return;
        }

        sermonData = {
          ...sermonData,
          title: structuredTitle,
          introduction,
          points,
          conclusion,
        };
      } else if (type === "ai") {
        if (!generatedSermon.trim()) {
          toast({
            title: "Erro",
            description: "Por favor, gere um sermão primeiro",
            variant: "destructive",
          });
          return;
        }

        sermonData = {
          ...sermonData,
          title: "Sermão Gerado por IA",
          bible_text: generatedSermon,
        };
      }

      let result;
      if (isValidUUID) {
        const { data, error } = await supabase
          .from("sermons")
          .update(sermonData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("sermons")
          .insert(sermonData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      toast({
        title: "Sucesso",
        description: "Sermão salvo com sucesso!",
      });

      navigate(`/preaching-mode/${result.id}`);
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const addIllustration = (pointIndex: number) => {
    const newPoints = [...points];
    newPoints[pointIndex].illustrations.push({
      content: "",
      type: "text",
    });
    setPoints(newPoints);
  };

  const updateIllustration = (pointIndex: number, illIndex: number, content: string) => {
    const newPoints = [...points];
    newPoints[pointIndex].illustrations[illIndex].content = content;
    setPoints(newPoints);
  };

  const addPoint = () => {
    setPoints([...points, { title: "", content: "", illustrations: [] }]);
  };

  const renderBlankSermon = () => (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Título do sermão"
          value={blankTitle}
          onChange={(e) => setBlankTitle(e.target.value)}
        />
      </div>
      <div>
        <Textarea
          placeholder="Conteúdo do sermão"
          className="min-h-[400px]"
          value={blankContent}
          onChange={(e) => setBlankContent(e.target.value)}
        />
      </div>
    </div>
  );

  const renderStructuredSermon = () => (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Título do sermão"
          value={structuredTitle}
          onChange={(e) => setStructuredTitle(e.target.value)}
        />
      </div>
      <div>
        <h3 className="text-lg font-serif mb-2 text-bible-navy">Introdução</h3>
        <Textarea
          placeholder="Introdução do sermão"
          className="min-h-[150px]"
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
        />
      </div>
      <div className="space-y-6">
        <h3 className="text-lg font-serif text-bible-navy">Desenvolvimento</h3>
        {points.map((point, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg bg-white">
            <Input
              placeholder={`Título do ponto ${index + 1}`}
              value={point.title}
              onChange={(e) => {
                const newPoints = [...points];
                newPoints[index].title = e.target.value;
                setPoints(newPoints);
              }}
            />
            <div className="flex items-center gap-2">
              <Textarea
                placeholder={`Conteúdo do ponto ${index + 1}`}
                className="min-h-[100px]"
                value={point.content}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[index].content = e.target.value;
                  setPoints(newPoints);
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => addIllustration(index)}
                className="flex-shrink-0"
              >
                <ImagePlus className="h-4 w-4 text-bible-navy" />
              </Button>
            </div>
            {point.illustrations.map((ill, illIndex) => (
              <div key={illIndex} className="ml-6 p-3 bg-bible-gray rounded-md">
                <Textarea
                  placeholder="Digite sua ilustração aqui..."
                  className="min-h-[80px]"
                  value={ill.content}
                  onChange={(e) => updateIllustration(index, illIndex, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addPoint}
          className="w-full text-bible-navy hover:bg-bible-gray/10"
        >
          Adicionar Ponto
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-serif mb-2 text-bible-navy">Conclusão</h3>
        <Textarea
          placeholder="Conclusão do sermão"
          className="min-h-[150px]"
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
        />
      </div>
    </div>
  );

  const renderAISermon = () => (
    <div className="space-y-6">
      <div>
        <Textarea
          placeholder="Descreva a ideia do seu sermão..."
          className="min-h-[150px]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <Button
        onClick={handleGenerateSermon}
        disabled={isLoading}
        className="w-full bg-bible-navy hover:bg-bible-accent"
      >
        {isLoading ? "Gerando..." : "Gerar Sermão"}
      </Button>
      {generatedSermon && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="text-bible-navy hover:bg-bible-gray/10"
            >
              {isEditing ? "Visualizar" : "Editar"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={generatedSermon}
              onChange={(e) => setGeneratedSermon(e.target.value)}
              className="min-h-[500px] font-serif"
            />
          ) : (
            <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
              <div 
                className="space-y-4 font-serif"
                dangerouslySetInnerHTML={{ 
                  __html: generatedSermon
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-2xl font-bold text-bible-navy">${line.slice(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-semibold text-bible-navy mt-6">${line.slice(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-lg font-medium text-bible-navy mt-4">${line.slice(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li class="ml-4">${line.slice(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '<br>';
                      } else {
                        return `<p class="text-gray-700">${line}</p>`;
                      }
                    })
                    .join('\n')
                }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handleGenerateSermon = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-sermon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate sermon");

      const data = await response.json();
      setGeneratedSermon(data.sermon);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar o sermão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-bible-navy">
            {isValidUUID ? "Editar Sermão" : (
              <>
                {type === "blank" && "Começar do Zero"}
                {type === "structure" && "Estrutura Comprovada"}
                {type === "ai" && "Sermão com IA"}
              </>
            )}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveSermon}
            className="text-bible-navy hover:bg-bible-gray/10"
          >
            <Save className="h-5 w-5" />
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {(type === "blank" || (existingSermon && existingSermon.bible_text)) && renderBlankSermon()}
          {(type === "structure" || (existingSermon && !existingSermon.bible_text)) && renderStructuredSermon()}
          {type === "ai" && renderAISermon()}
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
