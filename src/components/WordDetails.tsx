import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WordDetailsProps {
  word: string;
  book: string;
  chapter: string;
  verse: string;
}

const WordDetails = ({ word, book, chapter, verse }: WordDetailsProps) => {
  const [details, setDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const fetchWordDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-word-details', {
        body: { word, book, chapter, verse }
      });

      if (error) throw error;
      setDetails(data.result);
    } catch (error) {
      console.error('Erro ao buscar detalhes da palavra:', error);
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