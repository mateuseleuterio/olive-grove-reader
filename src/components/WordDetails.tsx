import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StrongEntry } from "@/types/strong";

interface WordDetailsProps {
  word: string;
}

const WordDetails = ({ word }: WordDetailsProps) => {
  const [strongDetails, setStrongDetails] = useState<StrongEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStrongDetails = async () => {
    try {
      setLoading(true);
      const { data: wordStrong, error: wordError } = await supabase
        .from('bible_word_strongs')
        .select('strong_number')
        .eq('word', word)
        .maybeSingle();

      if (wordError) throw wordError;
      
      if (wordStrong) {
        const { data: strongData, error: strongError } = await supabase
          .from('strongs_dictionary')
          .select('*')
          .eq('strong_number', wordStrong.strong_number)
          .maybeSingle();

        if (strongError) throw strongError;
        if (strongData) {
          setStrongDetails(strongData);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do Strong:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span 
          className="cursor-pointer hover:text-bible-accent inline-block mx-1"
          onClick={fetchStrongDetails}
        >
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {loading ? (
          <p>Carregando...</p>
        ) : strongDetails ? (
          <div className="space-y-2">
            <p><strong>Palavra Original:</strong> {strongDetails.hebrew_word}</p>
            <p><strong>Transliteração:</strong> {strongDetails.transliteration}</p>
            <p><strong>Significado:</strong> {strongDetails.meaning}</p>
            <p><strong>Tradução:</strong> {strongDetails.portuguese_word}</p>
            <p className="text-xs text-muted-foreground">Strong's #{strongDetails.strong_number}</p>
          </div>
        ) : (
          <p>Nenhuma referência Strong encontrada para esta palavra.</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WordDetails;