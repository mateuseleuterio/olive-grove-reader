import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";
import HebrewVerse from "./HebrewVerse";
import { Button } from "./ui/button";
import { ScrollText } from "lucide-react";

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

const BibleVerse = ({ bookId, chapter, version }: BibleVerseProps) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        console.log('Fetching verses for:', { bookId, chapter, version });
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
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [bookId, chapter, version]);

  const toggleHebrewVerse = (verseNumber: number) => {
    setSelectedVerse(selectedVerse === verseNumber ? null : verseNumber);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (verses.length === 0) {
    return <div>Nenhum versículo encontrado</div>;
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <div key={verse.id} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <p className="break-words flex-1">
              <span className="verse-number font-semibold mr-2">
                {verse.verse_number}
              </span>
              {verse.text.split(" ").map((word, index) => (
                <span
                  key={`${verse.id}-${index}`}
                  className="cursor-pointer hover:text-bible-accent inline-block mx-1 transition-colors"
                >
                  <WordDetails word={word} />
                </span>
              ))}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleHebrewVerse(verse.verse_number)}
              className="mt-1 hover:bg-gray-100"
              title="Ver texto original"
            >
              <ScrollText className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedVerse === verse.verse_number && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <HebrewVerse 
                bookId={bookId}
                chapter={chapter}
                verseNumber={verse.verse_number}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BibleVerse;