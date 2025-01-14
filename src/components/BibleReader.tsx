import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import CommentaryDrawer from "./CommentaryDrawer";
import BibleControls from "./bible/BibleControls";
import BibleVersionManager from "./bible/BibleVersionManager";
import { useBibleData, BIBLE_VERSIONS } from "@/hooks/useBibleData";

const BibleReader = () => {
  const [isCommentaryOpen, setIsCommentaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  
  const {
    versions,
    setVersions,
    books,
    selectedBook,
    setSelectedBook,
    chapter,
    setChapter,
    maxChapters
  } = useBibleData();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      // Will automatically fetch and set the last chapter of the previous book
    }
  };

  const addVersion = () => {
    if (versions.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 4 versões para comparação.",
        variant: "destructive",
      });
      return;
    }

    const availableVersions = Object.entries(BIBLE_VERSIONS)
      .map(([id, name]) => ({ id, name }))
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

  const handleVersionChange = (index: number, newVersion: string) => {
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { 
          id: newVersion, 
          name: BIBLE_VERSIONS[newVersion as keyof typeof BIBLE_VERSIONS] 
        };
      }
      return v;
    });
    setVersions(newVersions);
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
        versionsCount={versions.length}
      />
      
      <BibleVersionManager
        versions={versions}
        onVersionChange={handleVersionChange}
        onRemoveVersion={removeVersion}
        selectedBook={selectedBook}
        chapter={chapter}
        isMobile={isMobile}
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