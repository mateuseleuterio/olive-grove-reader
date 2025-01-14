import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BlankSermonFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
}

const BlankSermonForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  isLoading = false,
}: BlankSermonFormProps) => {
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para o sermão",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSave();
      toast({
        title: "Sucesso",
        description: "Sermão salvo com sucesso!",
      });
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Título do sermão"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Textarea
          placeholder="Conteúdo do sermão"
          className="min-h-[400px]"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Sermão"}
        </Button>
      </div>
    </div>
  );
};

export default BlankSermonForm;