import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Canvas } from "@/components/mental-maps/Canvas";

const CreateMentalMap = () => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"note" | "mindmap">("note");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
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
    navigate("/mental-maps");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Novo Mapa Mental</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
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
          <Button type="button" variant="outline" onClick={() => navigate("/mental-maps")}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateMentalMap;