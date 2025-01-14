import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleVersionsPanel from "./bible/BibleVersionsPanel";
import { useBibleVersions } from "@/hooks/useBibleVersions";
import { useBibleNavigation } from "@/hooks/useBibleNavigation";

interface Book {
  id: number;
  name: string;
}

const BibleReader = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { 
    versions, 
    BIBLE_VERSIONS, 
    addVersion, 
    removeVersion, 
    handleVersionChange 
  } = useBibleVersions();

  const {
    chapter,
    setChapter,
    maxChapters,
    handleNextChapter,
    handlePreviousChapter,
    hasNextChapter,
    hasPreviousChapter,
  } = useBibleNavigation({ selectedBook });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('bible_books')
        .select('id, name')
        .order('position');

      if (error) {
        console.error('Erro ao buscar livros:', error);
        return;
      }

      if (data) {
        const uniqueBooks = data.filter((book, index, self) =>
          index === self.findIndex((b) => b.name === book.name)
        );
        setBooks(uniqueBooks);
        if (uniqueBooks.length > 0 && !selectedBook) {
          setSelectedBook(uniqueBooks[0].id);
        }
      }
    };

    fetchBooks();
  }, []); 

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BibleControls
        books={books}
        selectedBook={selectedBook}
        chapter={chapter}
        maxChapters={maxChapters}
        onBookChange={setSelectedBook}
        onChapterChange={setChapter}
        onAddVersion={addVersion}
        onCommentaryOpen={() => setIsCommentaryOpen(true)}
        versionsCount={versions.length}
      />
      
      <BibleVersionsPanel
        versions={versions}
        onVersionChange={handleVersionChange}
        onRemove={removeVersion}
        selectedBook={selectedBook}
        chapter={chapter}
        versions_dict={BIBLE_VERSIONS}
        onNextChapter={handleNextChapter}
        onPreviousChapter={handlePreviousChapter}
        hasNextChapter={hasNextChapter}
        hasPreviousChapter={hasPreviousChapter}
        isMobile={isMobile}
      />

      <CommentaryDrawer 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        currentPassage={{ book: selectedBook.toString(), chapter }}
      />
    </div>
  );
};

export default BibleReader;