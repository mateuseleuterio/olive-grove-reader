import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    image: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("article_images")
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("article_images")
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("articles").insert({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Artigo criado com sucesso!",
        description: "Seu artigo foi publicado.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao criar artigo",
        description: "Ocorreu um erro ao tentar criar o artigo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-bible-navy mb-8">Novo Artigo</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Imagem</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Conteúdo</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            className="min-h-[300px]"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Publicando..." : "Publicar Artigo"}
        </Button>
      </form>
    </div>
  );
};

export default ArticleEditor;