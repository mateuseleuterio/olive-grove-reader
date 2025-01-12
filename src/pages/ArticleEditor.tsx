import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ArticleEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    image: null as File | null,
    image_url: "",
  });

  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const { data: article, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: article.title,
        description: article.description || "",
        content: article.content,
        category: article.category,
        image: null,
        image_url: article.image_url || "",
      });
    } catch (error) {
      console.error("Error loading article:", error);
      toast({
        title: "Erro ao carregar artigo",
        description: "Não foi possível carregar o artigo para edição.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0], image_url: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = formData.image_url;

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
        
        finalImageUrl = publicUrl;
      }

      const articleData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        image_url: finalImageUrl,
      };

      if (id) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Artigo atualizado com sucesso!",
          description: "Suas alterações foram salvas.",
        });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert(articleData);

        if (error) throw error;

        toast({
          title: "Artigo criado com sucesso!",
          description: "Seu artigo foi publicado.",
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao salvar artigo",
        description: "Ocorreu um erro ao tentar salvar o artigo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-bible-navy mb-8">
        {id ? "Editar Artigo" : "Novo Artigo"}
      </h1>
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
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {(formData.image_url || formData.image) && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={formData.image_url || (formData.image ? URL.createObjectURL(formData.image) : '')}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {id ? "Salvando..." : "Publicando..."}
            </>
          ) : (
            id ? "Salvar Alterações" : "Publicar Artigo"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ArticleEditor;