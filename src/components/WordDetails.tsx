import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
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

interface WordDetailsProps {
  word: string;
  book: string;
  chapter: string;
  verse: string;
}

const DEFAULT_MESSAGE = "Essa palavra não possui correspondente nas línguas originais";

const WordDetails = ({ word, book, chapter, verse }: WordDetailsProps) => {
  const [details, setDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatResponse = (text: string) => {
    // Substitui os asteriscos duplos por tags de negrito
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Divide o texto em linhas
    const lines = formattedText.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      if (!line.trim()) return null;
      
      // Verifica se a linha começa com um número
      const isNumberedLine = /^\d+\s*-/.test(line);
      
      if (isNumberedLine) {
        const [number, ...rest] = line.split('-');
        return (
          <div key={index} className="mb-3">
            <span className="text-bible-navy font-semibold mr-2">{number.trim()}-</span>
            <span dangerouslySetInnerHTML={{ 
              __html: rest.join('-').trim() 
            }} className="text-bible-text" />
          </div>
        );
      }
      
      return (
        <p key={index} className="mb-2" dangerouslySetInnerHTML={{ 
          __html: line 
        }} />
      );
    });
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === '5e475092-3de0-47b8-8543-c62450e07bbd') {
      setIsAdmin(true);
    }
  };

  const saveToDatabase = async (meaningDetails: string) => {
    try {
      const { error } = await supabase
        .from('word_meanings')
        .upsert({
          word,
          book,
          chapter,
          verse,
          meaning_details: meaningDetails
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Significado salvo no banco de dados.",
      });
      
      setDetails(meaningDetails);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('word_meanings')
        .delete()
        .match({ word, book, chapter, verse });

      if (error) throw error;

      // Save the default message
      await saveToDatabase(DEFAULT_MESSAGE);
      
      setIsDeleteDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Significado excluído e substituído pela mensagem padrão.",
      });
    } catch (error) {
      console.error('Erro ao excluir significado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o significado.",
        variant: "destructive",
      });
    }
  };

  const fetchWordDetails = async () => {
    try {
      setLoading(true);

      // Primeiro, verifica se já existe no banco de dados
      const { data: existingMeaning, error: searchError } = await supabase
        .from('word_meanings')
        .select('meaning_details')
        .eq('word', word)
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('verse', verse)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingMeaning) {
        setDetails(existingMeaning.meaning_details);
        setEditedDetails(existingMeaning.meaning_details);
        return;
      }

      // Se não existir no banco, busca via API
      const { data, error } = await supabase.functions.invoke('get-word-details', {
        body: { word, book, chapter, verse }
      });

      if (error) throw error;
      setDetails(data.result);
      setEditedDetails(data.result);
      
      // Verifica se o usuário é admin
      await checkAdminStatus();
    } catch (error) {
      console.error('Erro ao buscar detalhes da palavra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os detalhes da palavra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <span 
            className="cursor-pointer hover:text-bible-accent inline-block mx-1"
            onClick={fetchWordDetails}
          >
            {word}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-white shadow-lg rounded-lg border border-gray-200">
          {loading ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : details ? (
            <div className="space-y-2">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedDetails}
                    onChange={(e) => setEditedDetails(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => saveToDatabase(editedDetails)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {formatResponse(details)}
                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="w-full mb-2"
                        variant="outline"
                      >
                        Editar resposta
                      </Button>
                      <Button 
                        onClick={() => saveToDatabase(details)}
                        className="w-full mb-2"
                        variant="outline"
                      >
                        Salvar no banco
                      </Button>
                      <Button 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="w-full"
                        variant="destructive"
                      >
                        Excluir resposta
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Clique para ver os detalhes da palavra no idioma original.
            </p>
          )}
        </PopoverContent>
      </Popover>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá excluir o significado atual e substituí-lo pela mensagem padrão. 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WordDetails;