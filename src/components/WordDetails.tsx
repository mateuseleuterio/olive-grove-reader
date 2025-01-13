import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import type { StrongEntry } from "@/types/strong";

interface WordDetailsProps {
  word: string;
}

const WordDetails = ({ word }: WordDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [strongData, setStrongData] = useState<StrongEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStrongData = async () => {
      if (!word) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('strongs_dictionary')
          .select('strong_number, hebrew_word, transliteration, meaning, portuguese_word')
          .eq('portuguese_word', word.toLowerCase())
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar dados do Strong:', error);
          return;
        }

        if (data) {
          setStrongData(data);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchStrongData();
    }
  }, [word, isOpen]);

  if (!strongData) {
    return <span className="mr-1">{word}</span>;
  }

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <span 
          className="cursor-pointer text-bible-accent hover:text-bible-navy hover:underline mr-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {word}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-bible-navy">{strongData.hebrew_word}</p>
            <p className="text-sm text-gray-500 italic">{strongData.transliteration}</p>
            <p className="text-xs text-gray-400">Strong's #{strongData.strong_number}</p>
            <p className="text-sm text-gray-700">{strongData.meaning}</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default WordDetails;