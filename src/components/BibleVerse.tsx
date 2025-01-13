import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";

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
        const { data, error } = await supabase
          .from('bible_verses')
          .select(`
            id,
            verse_number,
            text
          `)
          .eq('version', version)
          .eq('chapter_id', 
            supabase
              .from('bible_chapters')
              .select('id')
              .eq('book_id', bookId)
              .eq('chapter_number', parseInt(chapter))
              .single()
              .then(res => res.data?.id)
          )
          .order('verse_number');

        if (error) {
          console.error('Erro ao buscar versículos:', error);
          return;
        }

        setVerses(data || []);
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
      <WordDetails key={index} word={word} />
    ));
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <p key={verse.id} className="break-words">
          <span className="verse-number">{verse.verse_number}</span>
          {renderVerse(verse.text)}
        </p>
      ))}
    </div>
  );
};

export default BibleVerse;