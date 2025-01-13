import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();

  const { data: featuredArticles, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featured-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const { data: latestArticles, isLoading: isLatestLoading } = useQuery({
    queryKey: ["latest-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const FAQ_ITEMS = [
    {
      id: 1,
      question: "Por que existem diferentes versões da Bíblia?",
      answer: "As diferentes versões da Bíblia existem devido às várias traduções dos textos originais em hebraico, aramaico e grego. Cada versão busca equilibrar precisão e legibilidade para diferentes públicos.",
    },
    {
      id: 2,
      question: "Como sei que Deus existe?",
      answer: "Esta é uma questão de fé e experiência pessoal, mas também existem argumentos filosóficos e evidências que muitos consideram convincentes, como o design do universo e a experiência moral humana.",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-bible-navy">A Corça Blog</h1>
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate("/new-article")}
        >
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Button>
      </div>
      
      {/* Featured Posts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Artigos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFeaturedLoading ? (
            Array(3).fill(null).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))
          ) : (
            featuredArticles?.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {article.image_url && (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="text-sm text-muted-foreground mb-2">
                    {article.category} • {new Date(article.created_at).toLocaleDateString("pt-BR")}
                  </div>
                  <CardTitle className="text-xl">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <button 
                    className="text-bible-navy hover:text-bible-accent"
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    Ler mais →
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Últimos Artigos</h2>
        <div className="space-y-4">
          {isLatestLoading ? (
            Array(5).fill(null).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="flex flex-row items-start space-y-0 gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            latestArticles?.map((article) => (
              <Card 
                key={article.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <CardHeader className="flex flex-row items-start space-y-0 gap-4">
                  {article.image_url && (
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <CardDescription>{article.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Perguntas Frequentes</h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <Card 
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/article/faq-${item.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;