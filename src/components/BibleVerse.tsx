import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";
import HebrewVerse from "./HebrewVerse";

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
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [bookId, chapter, version]);

  const renderVerse = (text: string) => {
    return text.split(" ").map((word, index) => (
      <WordDetails key={`${text}-${index}`} word={word} />
    ));
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
          <HebrewVerse 
            bookId={bookId}
            chapter={chapter}
            verseNumber={verse.verse_number}
          />
          <p className="break-words">
            <span className="verse-number">{verse.verse_number}</span>
            {renderVerse(verse.text)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BibleVerse;