import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BibleControls from "@/components/bible/BibleControls";
import HebrewVersePanel from "@/components/hebrew-bible/HebrewVersePanel";

const HebrewBible = () => {
  const [selectedBook, setSelectedBook] = useState(1);
  const [chapter, setChapter] = useState("1");

  const { data: books = [], isLoading: isLoadingBooks } = useQuery({
    queryKey: ["bible-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bible_books")
        .select("*")
        .order("position");

      if (error) throw error;
      return data;
    },
  });

  const { data: maxChapters = 0 } = useQuery({
    queryKey: ["bible-chapters", selectedBook],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bible_chapters")
        .select("chapter_number")
        .eq("book_id", selectedBook)
        .order("chapter_number", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data.chapter_number;
    },
    enabled: !!selectedBook,
  });

  const handleBookChange = (bookId: number) => {
    setSelectedBook(bookId);
    setChapter("1");
  };

  const handleChapterChange = (newChapter: string) => {
    setChapter(newChapter);
  };

  if (isLoadingBooks) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-serif text-bible-navy mb-8">Bíblia Hebraica</h1>
      
      <BibleControls
        books={books}
        selectedBook={selectedBook}
        chapter={chapter}
        maxChapters={maxChapters}
        onBookChange={handleBookChange}
        onChapterChange={handleChapterChange}
        onAddVersion={() => {}}
        onCommentaryOpen={() => {}}
        versionsCount={1}
      />

      <div className="grid grid-cols-1 gap-6">
        <HebrewVersePanel
          selectedBook={selectedBook}
          chapter={chapter}
        />
      </div>
    </div>
  );
};

export default HebrewBible;