import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Canvas } from "./Canvas";

interface CreateMentalMapProps {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateMentalMap = ({ onClose, onCreated }: CreateMentalMapProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"note" | "mindmap">("note");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("mental_maps").insert({
      title,
      type,
      content: type === "note" ? content : JSON.parse(content),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o mapa mental.",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Mapa mental criado com sucesso!",
    });
    onCreated();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      
      <div className="flex gap-4">
        <Button
          type="button"
          variant={type === "note" ? "default" : "outline"}
          onClick={() => setType("note")}
        >
          Nota
        </Button>
        <Button
          type="button"
          variant={type === "mindmap" ? "default" : "outline"}
          onClick={() => setType("mindmap")}
        >
          Mapa Mental
        </Button>
      </div>

      {type === "note" ? (
        <Textarea
          placeholder="Conteúdo da nota..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px]"
          required
        />
      ) : (
        <Canvas onSave={setContent} />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};