import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Globe, ScrollText, Users } from "lucide-react";

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
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      icon: <ScrollText className="h-6 w-6" />,
      content: [
        {
          title: "Vestimentas na Era Bíblica",
          description: "Descubra como as pessoas se vestiam nos tempos bíblicos.",
          image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
        },
        {
          title: "Alimentação e Agricultura",
          description: "Conheça os alimentos e métodos de cultivo da época.",
          image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
        },
      ],
    },
    {
      title: "Geografia Bíblica",
      description: "Conheça os lugares mencionados na Bíblia e sua importância histórica.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      icon: <Globe className="h-6 w-6" />,
      content: [
        {
          title: "Jerusalém Antiga",
          description: "Um tour virtual pela cidade santa nos tempos bíblicos.",
          image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9",
        },
        {
          title: "O Mar da Galileia",
          description: "Explore o cenário de muitos milagres de Jesus.",
          image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
        },
      ],
    },
    {
      title: "Arqueologia",
      description: "Descobertas arqueológicas que confirmam eventos bíblicos.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      icon: <BookOpen className="h-6 w-6" />,
      content: [
        {
          title: "Manuscritos do Mar Morto",
          description: "A descoberta que revolucionou os estudos bíblicos.",
          image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
        },
        {
          title: "Artefatos Históricos",
          description: "Objetos que comprovam narrativas bíblicas.",
          image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
        },
      ],
    },
    {
      title: "Personagens",
      description: "Biografias detalhadas dos principais personagens bíblicos.",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
      icon: <Users className="h-6 w-6" />,
      content: [
        {
          title: "Reis de Israel",
          description: "A história dos monarcas do povo escolhido.",
          image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff",
        },
        {
          title: "Profetas",
          description: "Os mensageiros de Deus e suas profecias.",
          image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
        },
      ],
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
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/study/${category.title.toLowerCase().replace(/ /g, "-")}`)}
            >
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                  {category.icon}
                  <span className="font-semibold">{category.title}</span>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Preview of Category Content */}
      {categories.map((category) => (
        <section key={category.title} className="mb-12">
          <h2 className="text-2xl font-semibold text-bible-navy mb-6 flex items-center gap-2">
            {category.icon}
            {category.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.content.map((item) => (
              <Card 
                key={item.title}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
              >
                <div className="relative h-48">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      ))}

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