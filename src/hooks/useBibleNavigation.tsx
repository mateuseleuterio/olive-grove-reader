import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseBibleNavigationProps {
  selectedBook: number;
  initialChapter?: string;
}

export const useBibleNavigation = ({ selectedBook, initialChapter = "1" }: UseBibleNavigationProps) => {
  const [chapter, setChapter] = useState(initialChapter);
  const [maxChapters, setMaxChapters] = useState(50);

  useEffect(() => {
    const fetchChapterCount = async () => {
      if (!selectedBook) return;
      
      const { data, error } = await supabase
        .from('bible_chapters')
        .select('chapter_number')
        .eq('book_id', selectedBook)
        .order('chapter_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar número de capítulos:', error);
        return;
      }

      if (data && data.length > 0) {
        setMaxChapters(data[0].chapter_number);
        setChapter("1");
      }
    };

    fetchChapterCount();
  }, [selectedBook]);

  const handleNextChapter = async () => {
    const currentChapter = parseInt(chapter);
    if (currentChapter < maxChapters) {
      setChapter((currentChapter + 1).toString());
      return;
    }
  };

  const handlePreviousChapter = async () => {
    const currentChapter = parseInt(chapter);
    if (currentChapter > 1) {
      setChapter((currentChapter - 1).toString());
      return;
    }
  };

  const hasNextChapter = parseInt(chapter) < maxChapters;
  const hasPreviousChapter = parseInt(chapter) > 1;

  return {
    chapter,
    setChapter,
    maxChapters,
    handleNextChapter,
    handlePreviousChapter,
    hasNextChapter,
    hasPreviousChapter,
  };
};