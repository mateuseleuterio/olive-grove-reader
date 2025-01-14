import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleLayout from "./bible/BibleLayout";
import { useBibleReader } from "@/hooks/useBibleReader";

const BibleReader = () => {
  const {
    versions,
    books,
    selectedBook,
    chapter,
    maxChapters,
    setSelectedBook,
    setChapter,
    removeVersion,
    handleVersionChange,
  } = useBibleReader();
  
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);

  const handleNextChapter = () => {
    const currentChapter = parseInt(chapter);
    if (currentChapter < maxChapters) {
      setChapter((currentChapter + 1).toString());
    } else if (selectedBook < books.length) {
      setSelectedBook(selectedBook + 1);
      setChapter("1");
    }
  };

  const handlePreviousChapter = () => {
    const currentChapter = parseInt(chapter);
    if (currentChapter > 1) {
      setChapter((currentChapter - 1).toString());
    } else if (selectedBook > 1) {
      setSelectedBook(selectedBook - 1);
      const fetchPreviousBookChapters = async () => {
        const { data, error } = await supabase
          .from('bible_chapters')
          .select('chapter_number')
          .eq('book_id', selectedBook - 1)
          .order('chapter_number', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setChapter(data[0].chapter_number.toString());
        }
      };
      fetchPreviousBookChapters();
    }
  };

  const hasNextChapter = parseInt(chapter) < maxChapters || selectedBook < books.length;
  const hasPreviousChapter = parseInt(chapter) > 1 || selectedBook > 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BibleControls
        books={books}
        selectedBook={selectedBook}
        chapter={chapter}
        maxChapters={maxChapters}
        onBookChange={setSelectedBook}
        onChapterChange={setChapter}
        onCommentaryOpen={() => setIsCommentaryOpen(true)}
      />
      
      <BibleLayout
        versions={versions}
        selectedBook={selectedBook}
        chapter={chapter}
        onVersionChange={handleVersionChange}
        onRemoveVersion={removeVersion}
        onNextChapter={handleNextChapter}
        onPreviousChapter={handlePreviousChapter}
        hasNextChapter={hasNextChapter}
        hasPreviousChapter={hasPreviousChapter}
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