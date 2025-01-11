import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Pencil, Brain, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Sermon = Database['public']['Tables']['sermons']['Row'];

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("sermons").select("*");
      if (error) {
        console.error("Error fetching sermons:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar sermões",
          description: "Não foi possível carregar seus sermões. Tente novamente mais tarde.",
        });
      } else {
        setSermons(data);
      }
      setLoading(false);
    };

    fetchSermons();
  }, [toast]);

  const handleOptionSelect = (type: string) => {
    setOpen(false);
    navigate(`/sermon-editor/${type}`);
  };

  const handleDeleteSermon = async (id: string) => {
    const { error } = await supabase
      .from("sermons")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir sermão",
        description: "Não foi possível excluir o sermão. Tente novamente mais tarde.",
      });
    } else {
      setSermons(sermons.filter(sermon => sermon.id !== id));
      toast({
        title: "Sermão excluído",
        description: "O sermão foi excluído com sucesso.",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-bible-navy">
          Meus Sermões
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-bible-navy hover:bg-bible-accent">
              Novo Sermão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-serif text-bible-navy mb-6">
                Como você quer criar seu sermão?
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <Card 
                className="cursor-pointer hover:bg-bible-gray/50 transition-colors"
                onClick={() => handleOptionSelect("simple")}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Pencil className="h-6 w-6 text-bible-navy" />
                  <div>
                    <CardTitle className="text-lg">Começar do Zero</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crie um sermão simples com título e texto
                    </p>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer hover:bg-bible-gray/50 transition-colors"
                onClick={() => handleOptionSelect("structured")}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <FileText className="h-6 w-6 text-bible-navy" />
                  <div>
                    <CardTitle className="text-lg">Estrutura Guiada</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use uma estrutura completa com introdução, pontos e conclusão
                    </p>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer hover:bg-bible-gray/50 transition-colors"
                onClick={() => handleOptionSelect("ai")}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Brain className="h-6 w-6 text-bible-navy" />
                  <div>
                    <CardTitle className="text-lg">Sermão com IA</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crie um sermão com auxílio de inteligência artificial
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-bible-navy">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sermons.map((sermon) => (
            <Card key={sermon.id} className="relative group">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir sermão?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente seu sermão.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteSermon(sermon.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <CardHeader 
                className="cursor-pointer"
                onClick={() => navigate(`/sermon-editor/structured?id=${sermon.id}`)}
              >
                <CardTitle className="text-lg font-medium text-bible-navy">
                  {sermon.title}
                </CardTitle>
                {sermon.introduction && (
                  <CardContent className="pt-2 px-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sermon.introduction}
                    </p>
                  </CardContent>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SermonBuilder;