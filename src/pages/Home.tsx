import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  created_at: string;
}

const PLACEHOLDER_ARTICLES = [
  {
    id: "1",
    title: "A Importância da Oração",
    description: "Descobrindo o poder da oração na vida cristã",
    content: "Lorem ipsum...",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Estudo Bíblico: O Livro de João",
    description: "Um mergulho profundo no evangelho de João",
    content: "Lorem ipsum...",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Vida em Comunidade",
    description: "A importância da comunhão entre os irmãos",
    content: "Lorem ipsum...",
    created_at: new Date().toISOString(),
  },
];

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { canManageArticles } = useUserRole();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        // Se houver erro, mostrar artigos placeholder
        setArticles(PLACEHOLDER_ARTICLES);
      } else {
        // Se não houver artigos no banco, mostrar placeholder
        setArticles(data?.length ? data : PLACEHOLDER_ARTICLES);
      }
    } catch (error) {
      console.error("Error:", error);
      setArticles(PLACEHOLDER_ARTICLES);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">A Corça Blog</h1>
        {canManageArticles() && (
          <Link to="/new-article">
            <Button>Criar Novo Artigo</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-4">{article.description}</p>
            <Link
              to={`/article/${article.id}`}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Ler mais →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;