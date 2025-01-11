import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Sparkles } from "lucide-react";

const SermonBuilder = () => {
  const navigate = useNavigate();

  const handleStart = (type: 'blank' | 'structure' | 'ai') => {
    navigate(`/sermon-editor/${type}`);
  };

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <h1 className="text-3xl font-serif text-bible-navy mb-8 text-center">Construtor de Sermão</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Card 1: Sermão em Branco */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-bible-navy" />
              Sermão em Branco
            </CardTitle>
            <CardDescription>
              Comece seu sermão do zero com total liberdade criativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Ideal para quando você já tem uma ideia clara do que quer pregar e deseja total liberdade na construção
            </p>
            <Button 
              className="w-full bg-bible-navy hover:bg-bible-accent"
              onClick={() => handleStart('blank')}
            >
              Começar
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: A partir de uma estrutura comprovada */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-bible-navy" />
              Estrutura Comprovada
            </CardTitle>
            <CardDescription>
              Use uma estrutura testada e aprovada por pregadores experientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Perfeito para quando você quer seguir um modelo que já demonstrou resultados positivos
            </p>
            <Button 
              className="w-full bg-bible-navy hover:bg-bible-accent"
              onClick={() => handleStart('structure')}
            >
              Começar
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Sermão com IA */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-bible-navy" />
              Sermão com IA
            </CardTitle>
            <CardDescription>
              Construa seu sermão com ajuda da Inteligência Artificial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Utilize o poder da IA para receber sugestões, insights e estruturação do seu sermão
            </p>
            <Button 
              className="w-full bg-bible-navy hover:bg-bible-accent"
              onClick={() => handleStart('ai')}
            >
              Começar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SermonBuilder;