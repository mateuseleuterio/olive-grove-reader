import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BibleVerseProps {
  bookId: number;
  chapter: string;
  version: string;
}

interface Verse {
  id: number;
  verse_number: number;
  text: string;
}

interface StrongWord {
  word: string;
  strong_number: string;
}

interface RenderedWord {
  word: string;
  strongNumber?: string;
}

const BibleVerse = ({ bookId, chapter, version }: BibleVerseProps) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [renderedWords, setRenderedWords] = useState<Record<number, RenderedWord[]>>({});

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        // Primeiro, buscar o chapter_id
        const { data: chapterData, error: chapterError } = await supabase
          .from('bible_chapters')
          .select('id')
          .eq('book_id', bookId)
          .eq('chapter_number', parseInt(chapter))
          .maybeSingle();

        if (chapterError) {
          console.error('Erro ao buscar capítulo:', chapterError);
          return;
        }

        if (!chapterData) {
          console.log('Capítulo não encontrado');
          setVerses([]);
          return;
        }

        // Agora buscar os versículos usando o chapter_id
        const { data: versesData, error: versesError } = await supabase
          .from('bible_verses')
          .select(`
            id,
            verse_number,
            text
          `)
          .eq('version', version)
          .eq('chapter_id', chapterData.id)
          .order('verse_number');

        if (versesError) {
          console.error('Erro ao buscar versículos:', versesError);
          return;
        }

        setVerses(versesData || []);

        // Fetch Strong's numbers for each verse
        if (versesData) {
          const wordsMap: Record<number, RenderedWord[]> = {};
          
          for (const verse of versesData) {
            const { data: strongsData, error: strongsError } = await supabase
              .from('bible_word_strongs')
              .select('word, strong_number')
              .eq('verse_id', verse.id)
              .order('word_position');

            if (!strongsError && strongsData) {
              const words = verse.text.split(" ");
              wordsMap[verse.id] = words.map((word, index) => ({
                word,
                strongNumber: strongsData[index]?.strong_number
              }));
            } else {
              wordsMap[verse.id] = verse.text.split(" ").map(word => ({ word }));
            }
          }
          
          setRenderedWords(wordsMap);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [bookId, chapter, version]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (verses.length === 0) {
    return <div>Nenhum versículo encontrado</div>;
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <p key={verse.id} className="break-words">
          <span className="verse-number">{verse.verse_number}</span>
          {renderedWords[verse.id]?.map((wordData, index) => (
            wordData.strongNumber ? (
              <Popover key={`${verse.id}-${index}`}>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:text-bible-accent mx-1">
                    {wordData.word}
                    <sup className="text-xs text-gray-500">{wordData.strongNumber}</sup>
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <StrongDetails strongNumber={wordData.strongNumber} />
                </PopoverContent>
              </Popover>
            ) : (
              <span key={`${verse.id}-${index}`} className="mx-1">{wordData.word}</span>
            )
          ))}
        </p>
      ))}
    </div>
  );
};

const StrongDetails = ({ strongNumber }: { strongNumber: string }) => {
  const [strongDetails, setStrongDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrongDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('strongs_dictionary')
          .select('*')
          .eq('strong_number', strongNumber)
          .maybeSingle();

        if (error) throw error;
        setStrongDetails(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do Strong:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrongDetails();
  }, [strongNumber]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!strongDetails) {
    return <p>Nenhuma referência Strong encontrada.</p>;
  }

  return (
    <div className="space-y-2">
      <p><strong>Palavra Original:</strong> {strongDetails.hebrew_word}</p>
      <p><strong>Transliteração:</strong> {strongDetails.transliteration}</p>
      <p><strong>Significado:</strong> {strongDetails.meaning}</p>
      <p><strong>Tradução:</strong> {strongDetails.portuguese_word}</p>
      <p className="text-xs text-muted-foreground">Strong's #{strongNumber}</p>
    </div>
  );
};

export default BibleVerse;