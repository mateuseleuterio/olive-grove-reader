import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
}

const PLACEHOLDER_ARTICLES = [
  {
    id: "1",
    title: "A Importância da Oração",
    description: "Descobrindo o poder transformador da oração na vida cristã e como desenvolver uma vida de intimidade com Deus através da prática diária da oração.",
    content: "Lorem ipsum...",
    category: "Vida Cristã",
    image_url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Estudo Bíblico: O Livro de João",
    description: "Um mergulho profundo no evangelho de João, explorando seus temas principais e as revelações sobre a divindade de Jesus Cristo.",
    content: "Lorem ipsum...",
    category: "Estudos Bíblicos",
    image_url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Vida em Comunidade",
    description: "A importância da comunhão entre os irmãos e como construir relacionamentos significativos na igreja.",
    content: "Lorem ipsum...",
    category: "Comunidade",
    image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Os Salmos e a Adoração",
    description: "Explorando a profundidade dos Salmos e sua relevância para nossa vida de adoração hoje.",
    content: "Lorem ipsum...",
    category: "Adoração",
    image_url: "https://images.unsplash.com/photo-1445855743215-296f71d4be49",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Evangelismo no Mundo Moderno",
    description: "Como compartilhar o evangelho de maneira relevante e eficaz na era digital.",
    content: "Lorem ipsum...",
    category: "Evangelismo",
    image_url: "https://images.unsplash.com/photo-1493836512294-502baa1986e2",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Família Segundo a Bíblia",
    description: "Princípios bíblicos para construir e manter uma família saudável e centrada em Deus.",
    content: "Lorem ipsum...",
    category: "Família",
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300",
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
        setArticles(PLACEHOLDER_ARTICLES);
      } else {
        setArticles(data?.length ? data : PLACEHOLDER_ARTICLES);
      }
    } catch (error) {
      console.error("Error:", error);
      setArticles(PLACEHOLDER_ARTICLES);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[85rem] mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-bible-navy mb-2">A Corça Blog</h1>
            <p className="text-bible-text text-lg">Reflexões e estudos bíblicos para edificação da igreja</p>
          </div>
          {canManageArticles() && (
            <Link to="/new-article">
              <Button className="bg-bible-navy hover:bg-bible-accent">
                Criar Novo Artigo
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none bg-white">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image_url || "https://images.unsplash.com/photo-1501290741922-b56c0d0884af"}
                  alt={article.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-bible-navy text-white text-sm rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="text-xl font-serif text-bible-navy hover:text-bible-accent transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-bible-text mt-2">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-bible-verse">
                    {formatDate(article.created_at)}
                  </span>
                  <Link
                    to={`/article/${article.id}`}
                    className="text-bible-accent hover:text-bible-navy font-medium transition-colors"
                  >
                    Ler mais →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;