import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2, FileText, LogIn } from "lucide-react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import AuthModal from "@/components/Auth";

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sermonToDelete, setSermonToDelete] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { handleDeleteSermon } = useSermonManagement();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSermonToDelete(id);
  };

  const confirmDelete = async () => {
    if (sermonToDelete) {
      try {
        await handleDeleteSermon(sermonToDelete);
        queryClient.invalidateQueries({ queryKey: ['sermons'] });
      } catch (error) {
        console.error('Error in confirmDelete:', error);
      }
      setSermonToDelete(null);
    }
  };

  const handleRowClick = (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate(`/preaching-mode/${id}`);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
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
                    {user ? "Nenhum sermão encontrado" : "Faça login para ver seus sermões"}
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

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default SermonBuilder;