import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, PenLine } from "lucide-react";

const SermonBuilder = () => {
  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <h1 className="text-3xl font-serif text-bible-navy mb-8 text-center">Construtor de Sermão</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Card 1: Página em Branco */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-bible-navy" />
              Página em Branco
            </CardTitle>
            <CardDescription>
              Comece seu sermão do zero com total liberdade criativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Ideal para quando você já tem uma ideia clara do que quer pregar
            </p>
            <Button className="w-full bg-bible-navy hover:bg-bible-accent">
              Começar
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Sermão Guiado */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-bible-navy" />
              Sermão Guiado
            </CardTitle>
            <CardDescription>
              Construa seu sermão com ajuda passo a passo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Perfeito para iniciantes ou quando precisar de orientação estruturada
            </p>
            <Button className="w-full bg-bible-navy hover:bg-bible-accent">
              Começar
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: A partir de Modelo */}
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-6 w-6 text-bible-navy" />
              A partir de Modelo
            </CardTitle>
            <CardDescription>
              Use um modelo pré-definido como ponto de partida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-bible-text mb-4">
              Útil quando você quer seguir uma estrutura comprovada
            </p>
            <Button className="w-full bg-bible-navy hover:bg-bible-accent">
              Começar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SermonBuilder;