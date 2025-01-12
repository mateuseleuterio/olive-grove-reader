import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const FEATURED_POSTS = [
  {
    id: 1,
    title: "Entendendo a Trindade",
    description: "Um guia completo sobre o conceito da Trindade no cristianismo",
    category: "Teologia",
    date: "12 Jan 2024",
  },
  {
    id: 2,
    title: "Como Ler a Bíblia Efetivamente",
    description: "Métodos práticos para uma leitura bíblica mais profunda",
    category: "Estudos Bíblicos",
    date: "11 Jan 2024",
  },
  {
    id: 3,
    title: "O Significado do Batismo",
    description: "Explorando o simbolismo e importância do batismo",
    category: "Sacramentos",
    date: "10 Jan 2024",
  },
];

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

const Home = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-bible-navy">A Corça Blog</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Button>
      </div>
      
      {/* Featured Posts Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Artigos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_POSTS.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">
                  {post.category} • {post.date}
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="text-bible-navy hover:text-bible-accent">
                  Ler mais →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-2xl font-semibold text-bible-navy mb-6">Perguntas Frequentes</h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.id}>
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