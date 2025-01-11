import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Sparkles, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - This should be replaced with real data from a backend
  const sermons = [
    { id: 1, title: "A Graça de Deus", type: "blank", createdAt: "2024-03-15" },
    { id: 2, title: "O Amor ao Próximo", type: "structure", createdAt: "2024-03-14" },
    { id: 3, title: "Fé e Obras", type: "ai", createdAt: "2024-03-13" },
  ];

  const handleStart = (type: 'blank' | 'structure' | 'ai') => {
    navigate(`/sermon-editor/${type}`);
  };

  const filteredSermons = sermons.filter(sermon => 
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-bible-navy hover:bg-bible-accent"
                onClick={() => handleStart('blank')}
              >
                Começar
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-bible-navy hover:bg-bible-accent"
                onClick={() => handleStart('structure')}
              >
                Começar
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-bible-navy hover:bg-bible-accent"
                onClick={() => handleStart('ai')}
              >
                Começar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sermões Salvos Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-bible-navy">Sermões Salvos</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Input
                placeholder="Buscar sermão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSermons.map((sermon) => (
                <TableRow key={sermon.id}>
                  <TableCell>{sermon.title}</TableCell>
                  <TableCell>
                    {sermon.type === 'blank' && 'Sermão em Branco'}
                    {sermon.type === 'structure' && 'Estrutura Comprovada'}
                    {sermon.type === 'ai' && 'Sermão com IA'}
                  </TableCell>
                  <TableCell>{new Date(sermon.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/sermon-editor/${sermon.type}?id=${sermon.id}`)}
                    >
                      Abrir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default SermonBuilder;