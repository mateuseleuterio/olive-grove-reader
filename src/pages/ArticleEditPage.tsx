import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

const ADMIN_UID = '5e475092-3de0-47b8-8543-c62450e07bbd';

const ArticleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: article } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id !== ADMIN_UID) {
        navigate('/blog');
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para editar este artigo",
          variant: "destructive",
        });
      }
    };

    checkAccess();
  }, [navigate, toast]);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setDescription(article.description || "");
      setContent(article.content);
      setCategory(article.category);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title,
          description,
          content,
          category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Artigo atualizado",
        description: "As alterações foram salvas com sucesso",
      });

      navigate(`/article/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar artigo:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o artigo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!article) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-bible-navy">Artigo não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-bible-navy mb-8">Editar Artigo</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Título
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Descrição
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Categoria
          </label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Conteúdo
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-[400px]"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/article/${id}`)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditPage;