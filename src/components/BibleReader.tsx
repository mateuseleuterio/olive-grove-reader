import React, { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleVersionPanel from "./bible/BibleVersionPanel";
import ImportBibleVersions from "./bible/ImportBibleVersions";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: number;
  name: string;
}

const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "AA": "Almeida Atualizada",
  "NVI": "Nova Versão Internacional",
  "RA": "Almeida Revista e Atualizada",
  "NTLH": "Nova Tradução na Linguagem de Hoje"
} as const;

type BibleVersion = keyof typeof BIBLE_VERSIONS;

const BibleReader = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([
    { id: "ACF", name: BIBLE_VERSIONS.ACF }
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(266); // ID do livro de Gênesis
  const [chapter, setChapter] = useState("1");
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [maxChapters, setMaxChapters] = useState(50);
  const { toast } = useToast();

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
      console.log("Fetching books...");
      const { data, error } = await supabase
        .from('bible_books')
        .select('id, name')
        .order('position');

      if (error) {
        console.error('Erro ao buscar livros:', error);
        return;
      }

      if (data) {
        console.log("Books data received:", data);
        const uniqueBooks = data.filter((book, index, self) =>
          index === self.findIndex((b) => b.name === book.name)
        );
        console.log("Unique books:", uniqueBooks);
        setBooks(uniqueBooks);
      }
    };

    fetchBooks();
  }, []); 

  useEffect(() => {
    const fetchChapterCount = async () => {
      if (!selectedBook) return;
      
      console.log("Fetching chapter count for book:", selectedBook);
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
        console.log("Max chapters for book:", data[0].chapter_number);
        setMaxChapters(data[0].chapter_number);
        setChapter("1");
      }
    };

    fetchChapterCount();
  }, [selectedBook]);

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
      // Buscar o último capítulo do livro anterior
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

  const addVersion = () => {
    if (versions.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 4 versões para comparação.",
        variant: "destructive",
      });
      return;
    }

    const newVersion = { id: "ACF" as BibleVersion, name: BIBLE_VERSIONS.ACF };
    setVersions([...versions, newVersion]);
    
    toast({
      title: "Versão adicionada",
      description: "Uma nova versão foi adicionada para comparação.",
    });
  };

  const removeVersion = (index: number) => {
    if (versions.length <= 1) {
      toast({
        title: "Operação não permitida",
        description: "Você precisa manter pelo menos uma versão.",
        variant: "destructive",
      });
      return;
    }
    const newVersions = versions.filter((_, i) => i !== index);
    setVersions(newVersions);
    
    toast({
      title: "Versão removida",
      description: "A versão foi removida da comparação.",
    });
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
      <ImportBibleVersions />
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
                onNextChapter={handleNextChapter}
                onPreviousChapter={handlePreviousChapter}
                hasNextChapter={hasNextChapter}
                hasPreviousChapter={hasPreviousChapter}
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
                  onNextChapter={handleNextChapter}
                  onPreviousChapter={handlePreviousChapter}
                  hasNextChapter={hasNextChapter}
                  hasPreviousChapter={hasPreviousChapter}
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