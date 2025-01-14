import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Book {
  id: number;
  name: string;
  name_bsb?: string;
}

export interface BibleVersion {
  id: string;
  name: string;
}

export const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel",
  "BSB": "Berean Study Bible"
} as const;

export const useBibleData = () => {
  const [versions, setVersions] = useState<Array<BibleVersion>>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapter, setChapter] = useState("1");
  const [maxChapters, setMaxChapters] = useState(50);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableVersions = async () => {
      try {
        const { data, error } = await supabase
          .from('bible_verses')
          .select('version')
          .order('version');

        if (error) throw error;

        const uniqueVersions = Array.from(new Set(data.map(v => v.version)))
          .filter(version => version in BIBLE_VERSIONS)
          .map(version => ({
            id: version,
            name: BIBLE_VERSIONS[version as keyof typeof BIBLE_VERSIONS]
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
  }, [toast]);

  useEffect(() => {
    const fetchBooks = async () => {
      const currentVersion = versions[0]?.id;
      if (!currentVersion) return;
      
      const { data, error } = await supabase
        .from('bible_books')
        .select('id, name, name_bsb, position')
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
        const processedBooks = data.map(book => ({
          id: book.id,
          name: currentVersion === 'BSB' && book.name_bsb ? book.name_bsb : book.name,
          name_bsb: book.name_bsb
        }));

        setBooks(processedBooks);
        if (processedBooks.length > 0 && !selectedBook) {
          setSelectedBook(processedBooks[0].id);
        }
      }
    };

    if (versions.length > 0) {
      fetchBooks();
    }
  }, [versions, toast, selectedBook]);

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
        console.error('Error fetching chapter count:', error);
        return;
      }

      if (data && data.length > 0) {
        setMaxChapters(data[0].chapter_number);
        setChapter("1");
      }
    };

    fetchChapterCount();
  }, [selectedBook]);

  return {
    versions,
    setVersions,
    books,
    selectedBook,
    setSelectedBook,
    chapter,
    setChapter,
    maxChapters
  };
};