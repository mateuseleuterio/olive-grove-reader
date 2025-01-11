import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Sparkles, Search, Trash2, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sermonToDelete, setSermonToDelete] = useState<string | null>(null);
  const [sermons, setSermons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      toast({
        title: "Erro ao carregar sermões",
        description: "Não foi possível carregar seus sermões. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleStart = (type: 'blank' | 'structure' | 'ai') => {
    navigate(`/sermon-editor/${type}`);
  };

  const handleDelete = async (id: string) => {
    setSermonToDelete(id);
  };

  const confirmDelete = async () => {
    if (sermonToDelete) {
      try {
        const { error } = await supabase
          .from("sermons")
          .delete()
          .eq("id", sermonToDelete);

        if (error) throw error;

        toast({
          title: "Sermão excluído",
          description: "O sermão foi excluído com sucesso.",
        });
        
        fetchSermons();
      } catch (error) {
        console.error("Error deleting sermon:", error);
        toast({
          title: "Erro ao excluir sermão",
          description: "Não foi possível excluir o sermão. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
      setSermonToDelete(null);
    }
  };

  const filteredSermons = sermons.filter(sermon => 
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... keep existing code (Card components for sermon types)

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

      {/* Meus Sermões Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-bible-navy">Meus Sermões</h2>
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
                <TableHead>Texto Bíblico</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSermons.map((sermon) => (
                <TableRow key={sermon.id}>
                  <TableCell className="font-medium">{sermon.title}</TableCell>
                  <TableCell>{sermon.bible_text}</TableCell>
                  <TableCell>{new Date(sermon.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/sermon-editor/${sermon.type || 'blank'}?id=${sermon.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sermon.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <AlertDialog open={!!sermonToDelete} onOpenChange={() => setSermonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este sermão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SermonBuilder;
