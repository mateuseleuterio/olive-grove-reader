import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ArticleEditor = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Vida Cristã"); // Valor padrão
  const navigate = useNavigate();
  const { canManageArticles } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (!canManageArticles()) {
      navigate("/");
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para criar ou editar artigos.",
        variant: "destructive",
      });
    }
  }, [canManageArticles, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = await supabase.auth.getSession();
    const user_id = session.data.session?.user.id;

    if (!user_id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um artigo.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("articles").insert({
      title,
      description,
      content,
      category,
      user_id,
    });

    if (error) {
      toast({
        title: "Erro ao criar artigo",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Artigo criado com sucesso.",
      });
      navigate("/");
    }
  };

  const categories = [
    "Vida Cristã",
    "Estudos Bíblicos",
    "Comunidade",
    "Adoração",
    "Evangelismo",
    "Família",
    "Teologia",
    "Devocional",
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold text-bible-navy mb-8">Criar Novo Artigo</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-bible-text mb-2">
            Título
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-bible-text mb-2">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-bible-text mb-2">
            Descrição
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-bible-text mb-2">
            Conteúdo
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full min-h-[300px]"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            className="border-bible-navy text-bible-navy hover:bg-bible-navy hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-bible-navy hover:bg-bible-accent"
          >
            Publicar Artigo
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;