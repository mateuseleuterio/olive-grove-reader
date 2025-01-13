import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { SermonType } from "@/types/sermon";
import BlankSermonForm from "@/components/sermon/BlankSermonForm";
import StructuredSermonForm from "@/components/sermon/StructuredSermonForm";
import AISermonForm from "@/components/sermon/AISermonForm";
import { saveSermon } from "@/utils/sermonUtils";

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

      let sermonData = {
        id: isValidUUID ? id : undefined,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Use anonymous user ID if not logged in
        title: "",
        bible_text: null as string | null,
        introduction: null as string | null,
        points: null as SermonType['points'] | null,
        conclusion: null as string | null,
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

      console.log('Saving sermon with data:', sermonData); // Debug log

      const result = await saveSermon(sermonData, isValidUUID, id);
      console.log('Save result:', result); // Debug log

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
          {(type === "blank" || (existingSermon && existingSermon.bible_text)) && (
            <BlankSermonForm
              title={blankTitle}
              content={blankContent}
              onTitleChange={setBlankTitle}
              onContentChange={setBlankContent}
            />
          )}
          {(type === "structure" || (existingSermon && !existingSermon.bible_text)) && (
            <StructuredSermonForm
              title={structuredTitle}
              introduction={introduction}
              points={points}
              conclusion={conclusion}
              onTitleChange={setStructuredTitle}
              onIntroductionChange={setIntroduction}
              onPointsChange={setPoints}
              onConclusionChange={setConclusion}
            />
          )}
          {type === "ai" && (
            <AISermonForm
              prompt={prompt}
              generatedSermon={generatedSermon}
              isLoading={isLoading}
              isEditing={isEditing}
              onPromptChange={setPrompt}
              onGeneratedSermonChange={setGeneratedSermon}
              onEditToggle={() => setIsEditing(!isEditing)}
              onGenerate={handleGenerateSermon}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;