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
import { BookText, Pencil, Brain, FileText } from "lucide-react";

type Sermon = Database['public']['Tables']['sermons']['Row'];

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("sermons").select("*");
      if (error) {
        console.error("Error fetching sermons:", error);
      } else {
        setSermons(data);
      }
      setLoading(false);
    };

    fetchSermons();
  }, []);

  const handleOptionSelect = (type: string) => {
    setOpen(false);
    navigate(`/sermon-editor/${type}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-bible-navy">
          Meus Sermões
        </h1>
        <div className="flex gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-bible-navy hover:bg-bible-accent">
                Novo Sermão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-serif text-bible-navy mb-4">
                  Escolha um método para criar seu sermão
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-6 hover:bg-bible-gray"
                  onClick={() => handleOptionSelect("simple")}
                >
                  <Pencil className="h-5 w-5" />
                  <div className="text-left">
                    <h3 className="font-semibold">Começar do Zero</h3>
                    <p className="text-sm text-muted-foreground">
                      Crie um sermão simples com título e texto
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-6 hover:bg-bible-gray"
                  onClick={() => handleOptionSelect("structured")}
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <h3 className="font-semibold">Estrutura Guiada</h3>
                    <p className="text-sm text-muted-foreground">
                      Use uma estrutura completa com introdução, pontos e conclusão
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-6 hover:bg-bible-gray"
                  onClick={() => handleOptionSelect("ai")}
                >
                  <Brain className="h-5 w-5" />
                  <div className="text-left">
                    <h3 className="font-semibold">Sermão com IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Crie um sermão com auxílio de inteligência artificial
                    </p>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {sermons.map((sermon) => (
            <li key={sermon.id} className="border-b py-4">
              <h2 className="text-lg font-semibold">{sermon.title}</h2>
              <p>{sermon.introduction}</p>
              <Button
                onClick={() => navigate(`/sermon-editor/structured?id=${sermon.id}`)}
                className="mt-2"
              >
                Editar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SermonBuilder;