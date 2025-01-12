import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudyCategory = () => {
  const { category } = useParams();

  const categoryContent = {
    "costumes-e-cultura": {
      title: "Costumes e Cultura",
      description: "Explore os hábitos, tradições e modo de vida dos tempos bíblicos.",
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
    "geografia-biblica": {
      title: "Geografia Bíblica",
      description: "Conheça os lugares mencionados na Bíblia e sua importância histórica.",
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
    "arqueologia": {
      title: "Arqueologia",
      description: "Descobertas arqueológicas que confirmam eventos bíblicos.",
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
    "personagens": {
      title: "Personagens",
      description: "Biografias detalhadas dos principais personagens bíblicos.",
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
  };

  const selectedCategory = category ? categoryContent[category as keyof typeof categoryContent] : null;

  if (!selectedCategory) {
    return <div className="container mx-auto py-8 px-4">Categoria não encontrada</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-bible-navy mb-8">{selectedCategory.title}</h1>
      <p className="text-lg text-bible-text mb-8">{selectedCategory.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedCategory.content.map((item) => (
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
    </div>
  );
};

export default StudyCategory;