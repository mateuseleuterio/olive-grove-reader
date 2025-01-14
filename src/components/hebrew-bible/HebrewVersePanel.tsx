import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HebrewVerse from "./HebrewVerse";

interface HebrewVersePanelProps {
  selectedBook: number;
  chapter: string;
}

const HebrewVersePanel = ({ selectedBook, chapter }: HebrewVersePanelProps) => {
  const { data: verses = [], isLoading } = useQuery({
    queryKey: ["hebrew-verses", selectedBook, chapter],
    queryFn: async () => {
      console.log("Fetching verses for book:", selectedBook, "chapter:", chapter);
      
      // Primeiro, buscar o chapter_id
      const { data: chapterData, error: chapterError } = await supabase
        .from('bible_chapters')
        .select('id')
        .eq('book_id', selectedBook)
        .eq('chapter_number', parseInt(chapter))
        .single();

      if (chapterError) {
        console.error('Error fetching chapter:', chapterError);
        return [];
      }

      if (!chapterData) {
        console.log('No chapter found');
        return [];
      }

      console.log("Found chapter_id:", chapterData.id);

      // Agora buscar os versículos em hebraico com o parsing completo
      const { data, error } = await supabase
        .from('hebrew_bible_verses')
        .select(`
          id,
          verse_number,
          hebrew_text,
          transliteration,
          hebrew_word_parsing (
            hebrew_word,
            transliteration,
            morphology,
            strong_number,
            lexeme,
            part_of_speech,
            person,
            gender,
            number,
            state,
            stem,
            tense
          )
        `)
        .eq('chapter_id', chapterData.id)
        .order('verse_number');

      if (error) {
        console.error('Error fetching verses:', error);
        throw error;
      }

      console.log("Fetched verses:", data);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-bible-navy">Carregando versículos...</div>
      </div>
    );
  }

  if (!verses.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-bible-navy">Nenhum versículo encontrado.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {verses.map((verse) => (
        <HebrewVerse
          key={verse.id}
          verse={verse}
        />
      ))}
    </div>
  );
};

export default HebrewVersePanel;