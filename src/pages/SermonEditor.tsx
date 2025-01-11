import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Save, Plus, Trash } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
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
        setPoints(sermon.points as string[] || []);
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

  const handleRemovePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = points.map((point, i) => (i === index ? value : point));
    setPoints(newPoints);
  };

  const handleSaveSermon = async () => {
    try {
      setIsLoading(true);

      const sermonData = {
        title,
        bible_text: bibleText,
        introduction,
        points,
        conclusion,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      let error;
      if (sermonId) {
        ({ error } = await supabase
          .from("sermons")
          .update(sermonData)
          .eq("id", sermonId));
      } else {
        ({ error } = await supabase.from("sermons").insert(sermonData));
      }

      if (error) throw error;

      toast({
        title: "Sermão salvo",
        description: "Seu sermão foi salvo com sucesso!",
      });

      navigate("/sermon-builder");
    } catch (error) {
      console.error("Error saving sermon:", error);
      toast({
        title: "Erro ao salvar sermão",
        description: "Houve um erro ao tentar salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif text-bible-navy">
            {type === "blank" && "Novo Sermão"}
            {type === "structure" && "Sermão Estruturado"}
            {type === "ai" && "Sermão com IA"}
          </h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Voltar para a Bíblia
            </Button>
            <Button
              onClick={handleSaveSermon}
              disabled={isLoading}
              className="flex items-center gap-2 bg-bible-navy hover:bg-bible-accent"
            >
              <Save className="h-4 w-4" />
              Salvar Sermão
            </Button>
          </div>
        </div>

        <div>
          <Input
            placeholder="Título do Sermão"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
          <Textarea
            placeholder="Texto Bíblico"
            value={bibleText}
            onChange={(e) => setBibleText(e.target.value)}
            className="mb-4"
          />
          <Textarea
            placeholder="Introdução"
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            className="mb-4"
          />
          {points.map((point, index) => (
            <div key={index} className="flex items-center mb-2">
              <Input
                placeholder={`Ponto ${index + 1}`}
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className="mr-2"
              />
              <Button
                variant="outline"
                onClick={() => handleRemovePoint(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddPoint} className="mb-4">
            Adicionar Ponto
          </Button>
          <Textarea
            placeholder="Conclusão"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
