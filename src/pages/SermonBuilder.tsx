import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Sparkles, Search, Trash2, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sermonToDelete, setSermonToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sermons = [], isLoading } = useQuery({
    queryKey: ['sermons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar sermões",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const handleStart = (type: 'blank' | 'structure' | 'ai') => {
    navigate(`/sermon-editor/${type}`);
  };

  const handleDelete = async (id: string) => {
    setSermonToDelete(id);
  };

  const confirmDelete = async () => {
    if (sermonToDelete) {
      const { error } = await supabase
        .from('sermons')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sermonToDelete);

      if (error) {
        toast({
          title: "Erro ao excluir sermão",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sermão excluído",
          description: "O sermão foi excluído com sucesso.",
        });
        queryClient.invalidateQueries({ queryKey: ['sermons'] });
      }
      setSermonToDelete(null);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/preaching-mode/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/sermon-editor/${id}`);
  };

  const filteredSermons = sermons.filter(sermon => 
    sermon.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-bible-navy">Meus Sermões</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-bible-navy hover:bg-bible-accent">
                <Plus className="mr-2 h-4 w-4" />
                Novo Sermão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Escolha como começar seu sermão</DialogTitle>
                <DialogDescription>
                  Selecione uma das opções abaixo para começar a criar seu sermão.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  className="flex items-center justify-start gap-2 p-6 bg-white hover:bg-gray-50 border text-left h-auto"
                  variant="outline"
                  onClick={() => handleStart('blank')}
                >
                  <FileText className="h-6 w-6 text-bible-navy shrink-0" />
                  <div>
                    <h3 className="font-semibold text-bible-navy">Sermão em Branco</h3>
                    <p className="text-sm text-muted-foreground">
                      Comece seu sermão do zero com total liberdade criativa
                    </p>
                  </div>
                </Button>
                <Button
                  className="flex items-center justify-start gap-2 p-6 bg-white hover:bg-gray-50 border text-left h-auto"
                  variant="outline"
                  onClick={() => handleStart('structure')}
                >
                  <BookOpen className="h-6 w-6 text-bible-navy shrink-0" />
                  <div>
                    <h3 className="font-semibold text-bible-navy">Estrutura Comprovada</h3>
                    <p className="text-sm text-muted-foreground">
                      Use uma estrutura testada e aprovada por pregadores experientes
                    </p>
                  </div>
                </Button>
                <Button
                  className="flex items-center justify-start gap-2 p-6 bg-white hover:bg-gray-50 border text-left h-auto"
                  variant="outline"
                  onClick={() => handleStart('ai')}
                >
                  <Sparkles className="h-6 w-6 text-bible-navy shrink-0" />
                  <div>
                    <h3 className="font-semibold text-bible-navy">Sermão com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Construa seu sermão com ajuda da Inteligência Artificial
                    </p>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-end mb-6">
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
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Carregando sermões...
                  </TableCell>
                </TableRow>
              ) : filteredSermons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Nenhum sermão encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSermons.map((sermon) => (
                  <TableRow 
                    key={sermon.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(sermon.id)}
                  >
                    <TableCell>{sermon.title}</TableCell>
                    <TableCell>{new Date(sermon.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEdit(e, sermon.id)}
                          className="text-bible-navy hover:bg-bible-gray/10"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sermon.id);
                          }}
                          className="text-bible-accent hover:text-bible-navy hover:bg-bible-gray/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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