import React, { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleVersionPanel from "./bible/BibleVersionPanel";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: number;
  name: string;
}

const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "BSB": "Berean Study Bible"
} as const;

type BibleVersion = keyof typeof BIBLE_VERSIONS;

const BibleReader = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [maxChapters, setMaxChapters] = useState(50);
  const { toast } = useToast();

  // Initialize available versions
  useEffect(() => {
    const fetchAvailableVersions = async () => {
      try {
        const { data, error } = await supabase
          .from('bible_verses')
          .select('version')
          .order('version');

        if (error) throw error;

        // Filter unique versions
        const uniqueVersions = Array.from(new Set(data.map(v => v.version)))
          .filter(version => version in BIBLE_VERSIONS)
          .map(version => ({
            id: version as BibleVersion,
            name: BIBLE_VERSIONS[version as BibleVersion]
          }));

        if (uniqueVersions.length > 0) {
          setVersions([uniqueVersions[0]]);
        } else {
          console.error('No available versions found');
          toast({
            title: "Error loading versions",
            description: "No Bible versions available were found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast({
          title: "Error loading versions",
          description: "An error occurred while fetching available versions.",
          variant: "destructive",
        });
      }
    };

    fetchAvailableVersions();
  }, []);

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
      // Get the current version
      const currentVersion = versions[0]?.id;
      
      const { data, error } = await supabase
        .from('bible_books')
        .select(`
          id,
          name,
          position,
          bible_chapters!inner (
            bible_verses!inner (
              version
            )
          )
        `)
        .eq('bible_chapters.bible_verses.version', currentVersion)
        .order('position');

      if (error) {
        console.error('Error fetching books:', error);
        toast({
          title: "Error loading books",
          description: "Could not load the list of books.",
          variant: "destructive",
        });
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

    if (versions.length > 0) {
      fetchBooks();
    }
  }, [versions]); 

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

    // Add the next available version that isn't already being displayed
    const availableVersions = Object.entries(BIBLE_VERSIONS)
      .map(([id, name]) => ({ id: id as BibleVersion, name }))
      .filter(v => !versions.some(existing => existing.id === v.id));

    if (availableVersions.length > 0) {
      const newVersions = [...versions, availableVersions[0]];
      setVersions(newVersions);
      toast({
        title: "Versão adicionada",
        description: "Uma nova versão foi adicionada para comparação.",
      });
    } else {
      toast({
        title: "Sem versões disponíveis",
        description: "Não há mais versões disponíveis para adicionar.",
        variant: "destructive",
      });
    }
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