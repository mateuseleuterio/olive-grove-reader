import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const { canManageArticles } = useUserRole();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
    } else {
      setArticles(data || []);
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

      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-gray-600">{article.description}</p>
            <Link to={`/articles/${article.id}`} className="text-blue-500 hover:underline">
              Ler mais
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
