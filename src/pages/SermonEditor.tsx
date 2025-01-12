import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SermonEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const type = location.pathname.split("/").pop();

  // State for blank sermon
  const [blankTitle, setBlankTitle] = useState("");
  const [blankContent, setBlankContent] = useState("");

  // State for structured sermon
  const [structuredTitle, setStructuredTitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [points, setPoints] = useState([{ title: "", content: "", illustrations: [] }]);
  const [conclusion, setConclusion] = useState("");

  // State for AI sermon
  const [prompt, setPrompt] = useState("");
  const [generatedSermon, setGeneratedSermon] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSermon = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar um sermão",
          variant: "destructive",
        });
        return;
      }

      let sermonData = {
        user_id: user.id,
        type: type,
      };

      if (type === "blank") {
        sermonData = {
          ...sermonData,
          title: blankTitle,
          content: blankContent,
        };
      } else if (type === "structure") {
        sermonData = {
          ...sermonData,
          title: structuredTitle,
          introduction,
          points,
          conclusion,
        };
      } else if (type === "ai") {
        sermonData = {
          ...sermonData,
          content: generatedSermon,
        };
      }

      const { error } = await supabase.from("sermons").insert(sermonData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sermão salvo com sucesso!",
      });

      navigate("/sermon-builder");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o sermão",
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
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: generatedSermon }} />
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
            {type === "blank" && "Começar do Zero"}
            {type === "structure" && "Estrutura Comprovada"}
            {type === "ai" && "Sermão com IA"}
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
          {type === "blank" && renderBlankSermon()}
          {type === "structure" && renderStructuredSermon()}
          {type === "ai" && renderAISermon()}
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;