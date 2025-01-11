import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Save, Plus, Trash, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("expository");
  const { toast } = useToast();

  const handleGenerateSermon = async () => {
    if (!topic) {
      toast({
        title: "Tópico necessário",
        description: "Por favor, insira um tópico para o sermão.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-sermon', {
        body: { topic, style },
      });

      if (error) throw error;

      const sermon = data.choices[0].message.content;
      
      // Parse the AI response and update the form fields
      try {
        const parsedSermon = JSON.parse(sermon);
        setTitle(parsedSermon.title || "");
        setIntroduction(parsedSermon.introduction || "");
        setPoints(parsedSermon.points || []);
        setConclusion(parsedSermon.conclusion || "");
      } catch (e) {
        // If parsing fails, use the raw text
        setIntroduction(sermon);
      }

      toast({
        title: "Sermão gerado",
        description: "O sermão foi gerado com sucesso!",
      });
    } catch (error) {
      console.error("Error generating sermon:", error);
      toast({
        title: "Erro ao gerar sermão",
        description: "Houve um erro ao gerar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  if (type === "ai") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-bible-navy">
            Criar Sermão com IA
          </h1>
          <Button
            onClick={handleSaveSermon}
            disabled={isLoading}
            size="sm"
            className="bg-bible-navy hover:bg-bible-accent"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Sobre qual tópico você quer pregar?
              </label>
              <Input
                placeholder="Ex: O amor de Deus, A oração, O perdão..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Estilo do sermão
              </label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expository">Expositivo</SelectItem>
                  <SelectItem value="topical">Temático</SelectItem>
                  <SelectItem value="narrative">Narrativo</SelectItem>
                  <SelectItem value="practical">Prático</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateSermon} 
              disabled={isLoading}
              className="w-full bg-bible-navy hover:bg-bible-accent"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Sermão
            </Button>
          </div>
        </Card>

        {(title || introduction || points.length > 0 || conclusion) && (
          <Card className="p-6 space-y-4">
            <Input
              placeholder="Título do Sermão"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Ponto
            </Button>
            <Textarea
              placeholder="Conclusão"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="mb-4"
            />
          </Card>
        )}
      </div>
    );
  }

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

  useEffect(() => {
    if (sermonId) {
      loadSermon(sermonId);
    }
  }, [sermonId]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-bible-navy">
          {type === "blank" && "Novo Sermão"}
          {type === "structured" && "Sermão Estruturado"}
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
  );
};

export default SermonEditor;
