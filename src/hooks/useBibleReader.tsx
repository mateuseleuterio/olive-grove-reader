import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BibleVersion = "ACF" | "AA" | "KJF" | "NAA" | "NVT";

export interface Book {
  id: number;
  name: string;
}

export const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "AA": "Almeida Atualizada",
  "KJF": "King James 1611",
  "NAA": "Nova Almeida Atualizada",
  "NVT": "Nova Versão Transformadora"
} as const;

const STORAGE_KEY = "bible_reader_state";

interface StoredState {
  selectedBook: number;
  chapter: string;
  versions: Array<{ id: BibleVersion; name: string }>;
}

export const useBibleReader = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [maxChapters, setMaxChapters] = useState(50);
  const { toast } = useToast();

  // Load saved state on initial mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: StoredState = JSON.parse(savedState);
        setSelectedBook(state.selectedBook);
        setChapter(state.chapter);
        if (state.versions && state.versions.length > 0) {
          setVersions(state.versions);
        } else {
          setVersions([{ id: "ACF", name: BIBLE_VERSIONS.ACF }]);
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        setVersions([{ id: "ACF", name: BIBLE_VERSIONS.ACF }]);
      }
    } else {
      setVersions([{ id: "ACF", name: BIBLE_VERSIONS.ACF }]);
    }
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (versions.length > 0) {
      const state: StoredState = {
        selectedBook,
        chapter,
        versions
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [selectedBook, chapter, versions]);

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
      }
    };

    fetchBooks();
  }, []);

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
      }
    };

    fetchChapterCount();
  }, [selectedBook]);

  const addVersion = () => {
    if (versions.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você pode comparar até 4 versões simultaneamente.",
        variant: "destructive",
      });
      return;
    }
    
    const defaultVersion: BibleVersion = "ACF";
    setVersions([...versions, { id: defaultVersion, name: BIBLE_VERSIONS[defaultVersion] }]);
    
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

  return {
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
  };
};