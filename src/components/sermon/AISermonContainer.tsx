import { useState } from "react";
import AISermonForm from "./AISermonForm";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import { useToast } from "@/hooks/use-toast";

const AISermonContainer = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedSermon, setGeneratedSermon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { handleSaveSermon } = useSermonManagement();
  const { toast } = useToast();

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

  const onSave = async () => {
    await handleSaveSermon({
      title: "Sermão Gerado por IA",
      bible_text: generatedSermon,
      points: [],
      user_id: '00000000-0000-0000-0000-000000000000'
    });
  };

  return (
    <AISermonForm
      prompt={prompt}
      generatedSermon={generatedSermon}
      isLoading={isLoading}
      isEditing={isEditing}
      onPromptChange={setPrompt}
      onGeneratedSermonChange={setGeneratedSermon}
      onEditToggle={() => setIsEditing(!isEditing)}
      onGenerate={handleGenerateSermon}
      onSave={onSave}
    />
  );
};

export default AISermonContainer;