import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        .select("id, name, position, testament")
        .order('position');

      if (error) {
        console.error('Error fetching books:', error);
        throw error;
      }

      // Remove duplicates based on book id
      const uniqueBooks = data.filter((book, index, self) =>
        index === self.findIndex((b) => b.id === book.id)
      );

      console.log("Fetched unique books:", uniqueBooks);
      return uniqueBooks;
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

      if (error) {
        console.error('Error fetching max chapters:', error);
        throw error;
      }

      console.log("Max chapters for book", selectedBook, ":", data.chapter_number);
      return data.chapter_number;
    },
    enabled: !!selectedBook,
  });

  const handleBookChange = (bookId: number) => {
    console.log("Changing book to:", bookId);
    setSelectedBook(bookId);
    setChapter("1");
  };

  const handleChapterChange = (newChapter: string) => {
    console.log("Changing chapter to:", newChapter);
    setChapter(newChapter);
  };

  if (isLoadingBooks) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-bible-navy">Carregando...</div>
      </div>
    );
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

      <ScrollArea className="h-[calc(100vh-300px)] mt-6">
        <HebrewVersePanel
          selectedBook={selectedBook}
          chapter={chapter}
        />
      </ScrollArea>
    </div>
  );
};

export default HebrewBible;