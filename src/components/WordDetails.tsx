import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WordDetailsProps {
  word: string;
  book: string;
  chapter: string;
  verse: string;
}

const WordDetails = ({ word, book, chapter, verse }: WordDetailsProps) => {
  const [details, setDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const saveToDatabase = async () => {
    if (!details) return;

    try {
      const { error } = await supabase
        .from('word_meanings')
        .insert({
          word,
          book,
          chapter,
          verse,
          meaning_details: details
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Significado salvo no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const getWordContext = () => {
    // Encontra o elemento pai que contém o texto do versículo
    const verseElement = document.querySelector(`[data-verse="${verse}"]`);
    if (!verseElement) return { before: "", after: "" };

    const text = verseElement.textContent || "";
    const words = text.split(/\s+/);
    const wordIndex = words.findIndex(w => w === word);
    
    if (wordIndex === -1) return { before: "", after: "" };

    // Pega até 3 palavras antes
    const beforeWords = words.slice(Math.max(0, wordIndex - 3), wordIndex);
    // Pega até 3 palavras depois
    const afterWords = words.slice(wordIndex + 1, wordIndex + 4);

    return {
      before: beforeWords.join(" "),
      after: afterWords.join(" ")
    };
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
        return;
      }

      // Se não existir no banco, busca via API
      const context = getWordContext();
      const { data, error } = await supabase.functions.invoke('get-word-details', {
        body: { 
          word,
          book,
          chapter,
          verse,
          context
        }
      });

      if (error) throw error;
      setDetails(data.result);
      
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
            {formatResponse(details)}
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  onClick={saveToDatabase}
                  className="w-full"
                  variant="outline"
                >
                  Enviar para banco de dados
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Clique para ver os detalhes da palavra no idioma original.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WordDetails;
