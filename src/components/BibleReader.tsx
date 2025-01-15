import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleLayout from "./bible/BibleLayout";
import { useBibleReader } from "@/hooks/useBibleReader";
import { BibleNotes } from "./bible/BibleNotes";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const BibleReader = () => {
  const {
    versions,
    books,
    selectedBook,
    chapter,
    maxChapters,
    setSelectedBook,
    setChapter,
    addVersion,
    removeVersion,
    handleVersionChange,
  } = useBibleReader();
  
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

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
        onAddVersion={addVersion}
        onCommentaryOpen={() => setIsCommentaryOpen(true)}
        onNotesOpen={() => setIsNotesOpen(true)}
        versionsCount={versions.length}
      />
      
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={isNotesOpen ? 70 : 100}>
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
            onVerseSelect={setSelectedVerses}
            selectedVerses={selectedVerses}
          />
        </ResizablePanel>

        {isNotesOpen && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={30}>
              <BibleNotes
                bookId={selectedBook}
                chapter={chapter}
                selectedVerses={selectedVerses}
                onClose={() => {
                  setIsNotesOpen(false);
                  setSelectedVerses([]);
                }}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      <CommentaryDrawer 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        currentPassage={{ book: selectedBook.toString(), chapter }}
      />
    </div>
  );
};

export default BibleReader;