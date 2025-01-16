import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

const ArticleView = () => {
  const { id } = useParams();

  const { data: article, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-bible-navy">Artigo não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold text-bible-navy mb-4">{article.title}</h1>
        <div className="text-sm text-bible-verse mb-8">
          {new Date(article.created_at).toLocaleDateString("pt-BR")} • {article.category}
        </div>
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ArticleView;