import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HebrewVerseProps {
  bookId: number;
  chapter: string;
  verseNumber: number;
}

interface HebrewVerse {
  id: number;
  hebrew_text: string;
  transliteration: string | null;
}

interface WordParsing {
  hebrew_word: string;
  transliteration: string | null;
  morphology: string | null;
  strong_number: string | null;
}

const HebrewVerse = ({ bookId, chapter, verseNumber }: HebrewVerseProps) => {
  const [verse, setVerse] = useState<HebrewVerse | null>(null);
  const [wordParsing, setWordParsing] = useState<WordParsing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHebrewVerse = async () => {
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
          return;
        }

        // Buscar o versículo em hebraico
        const { data: verseData, error: verseError } = await supabase
          .from('hebrew_bible_verses')
          .select('*')
          .eq('chapter_id', chapterData.id)
          .eq('verse_number', verseNumber)
          .maybeSingle();

        if (verseError) {
          console.error('Erro ao buscar versículo em hebraico:', verseError);
          return;
        }

        if (verseData) {
          setVerse(verseData);
          
          // Buscar o parsing das palavras
          const { data: parsingData, error: parsingError } = await supabase
            .from('hebrew_word_parsing')
            .select('*')
            .eq('verse_id', verseData.id)
            .order('word_position');

          if (parsingError) {
            console.error('Erro ao buscar parsing:', parsingError);
            return;
          }

          setWordParsing(parsingData || []);
        }
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHebrewVerse();
  }, [bookId, chapter, verseNumber]);

  if (loading) {
    return null;
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="hebrew-text text-right" dir="rtl">
      {wordParsing.map((word, index) => (
        <Popover key={index}>
          <PopoverTrigger asChild>
            <span className="cursor-pointer hover:text-bible-accent mx-1">
              {word.hebrew_word}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              {word.transliteration && (
                <p><strong>Transliteração:</strong> {word.transliteration}</p>
              )}
              {word.morphology && (
                <p><strong>Morfologia:</strong> {word.morphology}</p>
              )}
              {word.strong_number && (
                <p className="text-xs text-muted-foreground">Strong's #{word.strong_number}</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
};

export default HebrewVerse;