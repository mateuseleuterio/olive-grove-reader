import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Study = () => {
  const navigate = useNavigate();

  const { data: historicalEvents, isLoading } = useQuery({
    queryKey: ["historical-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const categories = [
    {
      title: "Costumes e Cultura",
      description: "Explore os hábitos, tradições e modo de vida dos tempos bíblicos.",
      image: "/placeholder.svg",
    },
    {
      title: "Geografia Bíblica",
      description: "Conheça os lugares mencionados na Bíblia e sua importância histórica.",
      image: "/placeholder.svg",
    },
    {
      title: "Arqueologia",
      description: "Descobertas arqueológicas que confirmam eventos bíblicos.",
      image: "/placeholder.svg",
    },
    {
      title: "Personagens",
      description: "Biografias detalhadas dos principais personagens bíblicos.",
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-bible-navy mb-8">Estudos Bíblicos</h1>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Categorias de Estudo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/study/${category.title.toLowerCase().replace(/ /g, "-")}`)}
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Historical Events Timeline */}
      <section>
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Linha do Tempo Histórica</h2>
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(null).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            historicalEvents?.map((event) => (
              <Card 
                key={event.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/study/event/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {event.year ? `Ano ${event.year}` : "Data desconhecida"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Study;