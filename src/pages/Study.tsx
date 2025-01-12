import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Globe, ScrollText, Users } from "lucide-react";

const Study = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Costumes e Cultura",
      description: "Explore os hábitos, tradições e modo de vida dos tempos bíblicos.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      icon: <ScrollText className="h-6 w-6" />,
      slug: "costumes-e-cultura",
    },
    {
      title: "Geografia Bíblica",
      description: "Conheça os lugares mencionados na Bíblia e sua importância histórica.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      icon: <Globe className="h-6 w-6" />,
      slug: "geografia-biblica",
    },
    {
      title: "Arqueologia",
      description: "Descobertas arqueológicas que confirmam eventos bíblicos.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      icon: <BookOpen className="h-6 w-6" />,
      slug: "arqueologia",
    },
    {
      title: "Personagens",
      description: "Biografias detalhadas dos principais personagens bíblicos.",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
      icon: <Users className="h-6 w-6" />,
      slug: "personagens",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-bible-navy mb-8">Estudos Bíblicos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card 
            key={category.title}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/study/${category.slug}`)}
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
    </div>
  );
};

export default Study;