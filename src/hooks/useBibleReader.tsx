import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BibleVersion = "ACF" | "AA" | "KJF";

export interface Book {
  id: number;
  name: string;
}

export const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "AA": "Almeida Atualizada",
  "KJF": "King James 1611"
} as const;

export const useBibleReader = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([
    { id: "ACF", name: BIBLE_VERSIONS.ACF }
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [maxChapters, setMaxChapters] = useState(50);
  const { toast } = useToast();

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