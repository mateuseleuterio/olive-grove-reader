import React, { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleVersionPanel from "./bible/BibleVersionPanel";

interface Book {
  id: number;
  name: string;
}

const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "NVI": "Nova Versão Internacional",
  "ARA": "Almeida Revista e Atualizada"
} as const;

type BibleVersion = keyof typeof BIBLE_VERSIONS;

const BibleReader = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([
    { id: "ACF", name: BIBLE_VERSIONS.ACF }
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [maxChapters, setMaxChapters] = useState(50);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch books only once when component mounts
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
        setBooks(data);
        if (data.length > 0 && !selectedBook) {
          setSelectedBook(data[0].id);
        }
      }
    };

    fetchBooks();
  }, []); // Empty dependency array means this runs once on mount

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

  const addVersion = () => {
    if (versions.length < 4) {
      const unusedVersion = (Object.entries(BIBLE_VERSIONS) as [BibleVersion, string][])
        .find(([id]) => !versions.some(v => v.id === id));
      
      if (unusedVersion) {
        setVersions([...versions, { id: unusedVersion[0], name: unusedVersion[1] }]);
      }
    }
  };

  const removeVersion = (index: number) => {
    const newVersions = versions.filter((_, i) => i !== index);
    setVersions(newVersions);
  };

  const handleVersionChange = (index: number, newVersion: BibleVersion) => {
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { id: newVersion, name: BIBLE_VERSIONS[newVersion] };
      }
      return v;
    });
    setVersions(newVersions);
  };

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
      
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {versions.map((version, index) => (
            <div key={`mobile-version-${version.id}-${index}`} className="border rounded-lg bg-white">
              <BibleVersionPanel
                version={version}
                onVersionChange={(newVersion) => handleVersionChange(index, newVersion as BibleVersion)}
                onRemove={() => removeVersion(index)}
                canRemove={versions.length > 1}
                selectedBook={selectedBook}
                chapter={chapter}
                versions={BIBLE_VERSIONS}
              />
            </div>
          ))}
        </div>
      ) : (
        <ResizablePanelGroup 
          direction="horizontal" 
          className="min-h-[400px] w-full rounded-lg border"
        >
          {versions.map((version, index) => (
            <React.Fragment key={`panel-${version.id}-${index}`}>
              <ResizablePanel defaultSize={100 / versions.length}>
                <BibleVersionPanel
                  version={version}
                  onVersionChange={(newVersion) => handleVersionChange(index, newVersion as BibleVersion)}
                  onRemove={() => removeVersion(index)}
                  canRemove={versions.length > 1}
                  selectedBook={selectedBook}
                  chapter={chapter}
                  versions={BIBLE_VERSIONS}
                />
              </ResizablePanel>
              {index < versions.length - 1 && (
                <ResizableHandle withHandle />
              )}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      )}

      <CommentaryDrawer 
        isOpen={isCommentaryOpen}
        onClose={() => setIsCommentaryOpen(false)}
        currentPassage={{ book: selectedBook.toString(), chapter }}
      />
    </div>
  );
};

export default BibleReader;