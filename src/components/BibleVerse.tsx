import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BibleHighlightToolbar } from "./bible/BibleHighlightToolbar";
import { BibleVerseList } from "./bible/BibleVerseList";

interface BibleVerseProps {
  bookId: number;
  chapter: string;
  version: string;
  onVerseSelect?: (verses: number[]) => void;
  selectedVerses?: number[];
}

const BibleVerse = ({ bookId, chapter, version, onVerseSelect, selectedVerses = [] }: BibleVerseProps) => {
  const { toast } = useToast();
  const [localSelectedVerses, setLocalSelectedVerses] = useState<number[]>([]);
  const [hasHighlightedVerses, setHasHighlightedVerses] = useState(false);
  const queryClient = useQueryClient();

  const fetchVerses = async () => {
    console.log("Iniciando busca de versículos:", { bookId, chapter, version });
    
    const { data: bookData, error: bookError } = await supabase
      .from('bible_books')
      .select('id, name')
      .eq('id', bookId)
      .maybeSingle();

    if (bookError) {
      console.error('Erro ao buscar livro:', bookError);
      throw new Error(`Erro ao buscar livro ${bookId}`);
    }

    if (!bookData) {
      console.error('Livro não encontrado:', bookId);
      throw new Error(`O livro com ID ${bookId} não foi encontrado`);
    }

    console.log('Livro encontrado:', bookData);
    
    const { data: chapterData, error: chapterError } = await supabase
      .from('bible_chapters')
      .select('id')
      .eq('book_id', bookId)
      .eq('chapter_number', parseInt(chapter))
      .maybeSingle();

    if (chapterError) {
      console.error('Erro ao buscar capítulo:', chapterError);
      console.log('Detalhes da busca do capítulo:', { bookId, chapter });
      throw new Error(`Erro ao buscar capítulo ${chapter} do livro ${bookData.name}`);
    }

    if (!chapterData) {
      console.log('Capítulo não encontrado:', { bookId, chapter });
      throw new Error(`O capítulo ${chapter} do livro ${bookData.name} não foi encontrado`);
    }

    console.log('Chapter ID encontrado:', chapterData.id);

    const { data: versesData, error: versesError } = await supabase
      .from('bible_verses')
      .select('id, verse_number, text')
      .eq('version', version)
      .eq('chapter_id', chapterData.id)
      .order('verse_number');

    if (versesError) {
      console.error('Erro ao buscar versículos:', versesError);
      throw new Error('Ocorreu um erro ao carregar os versículos.');
    }

    if (!versesData || versesData.length === 0) {
      console.log('Nenhum versículo encontrado para:', {
        version,
        chapterId: chapterData.id,
        bookId,
        chapter
      });
      throw new Error(`A versão ${version} ainda não está disponível para este capítulo.`);
    }

    return { versesData, bookName: bookData?.name, chapterData };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['verses', bookId, chapter, version],
    queryFn: fetchVerses,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar versículos",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleVerseSelect = (verseNumber: number) => {
    const newSelectedVerses = localSelectedVerses.includes(verseNumber)
      ? localSelectedVerses.filter(num => num !== verseNumber)
      : [...localSelectedVerses, verseNumber];
    
    setLocalSelectedVerses(newSelectedVerses);
    if (onVerseSelect) {
      onVerseSelect(newSelectedVerses);
    }
  };

  const handleRemoveHighlights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: verseIds } = await supabase
        .from('bible_verses')
        .select('id')
        .eq('chapter_id', data?.chapterData?.id)
        .in('verse_number', localSelectedVerses);

      if (!verseIds) return;

      for (const verse of verseIds) {
        const { error } = await supabase
          .from('bible_verse_highlights')
          .delete()
          .eq('verse_id', verse.id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['verse-highlight'] });
      setLocalSelectedVerses([]);
      setHasHighlightedVerses(false);

      toast({
        title: "Destaques removidos",
        description: "Os destaques foram removidos com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover destaques:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover os destaques.",
        variant: "destructive",
      });
    }
  };

  const handleHighlight = async (color: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (hasHighlightedVerses) {
        await handleRemoveHighlights();
      }

      const { data: verseIds } = await supabase
        .from('bible_verses')
        .select('id')
        .eq('chapter_id', data?.chapterData?.id)
        .in('verse_number', localSelectedVerses);

      if (!verseIds) return;

      for (const verse of verseIds) {
        const { error } = await supabase
          .from('bible_verse_highlights')
          .insert({
            verse_id: verse.id,
            color,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['verse-highlight'] });
      setLocalSelectedVerses([]);
    } catch (error) {
      console.error('Erro ao destacar versículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível destacar o versículo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkHighlights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let hasHighlights = false;
        for (const verseNumber of localSelectedVerses) {
          const { data } = await supabase
            .from('bible_verse_highlights')
            .select('id')
            .eq('verse_number', verseNumber)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data) {
            hasHighlights = true;
            break;
          }
        }
        setHasHighlightedVerses(hasHighlights);
      } catch (error) {
        console.error('Error checking highlights:', error);
      }
    };
    
    if (localSelectedVerses.length > 0) {
      checkHighlights();
    } else {
      setHasHighlightedVerses(false);
    }
  }, [localSelectedVerses]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(30)].map((_, index) => (
          <div key={index} className="flex items-start space-x-2">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BibleHighlightToolbar
        selectedVerses={selectedVerses || localSelectedVerses}
        hasHighlightedVerses={hasHighlightedVerses}
        onRemoveHighlights={handleRemoveHighlights}
        onHighlight={handleHighlight}
        onClose={() => {
          setLocalSelectedVerses([]);
          if (onVerseSelect) {
            onVerseSelect([]);
          }
        }}
      />
      <BibleVerseList
        verses={data?.versesData || []}
        selectedVerses={selectedVerses || localSelectedVerses}
        onVerseSelect={handleVerseSelect}
        bookName={data?.bookName}
        chapter={chapter}
        version={version}
      />
    </div>
  );
};

export default BibleVerse;
