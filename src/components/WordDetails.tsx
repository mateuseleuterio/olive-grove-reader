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
      <PopoverContent className="w-80">
        {loading ? (
          <p>Carregando...</p>
        ) : details ? (
          <div className="space-y-2 whitespace-pre-line">
            {details}
          </div>
        ) : (
          <p>Clique para ver os detalhes da palavra no idioma original.</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WordDetails;