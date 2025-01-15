import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BibleVerseActions } from "./bible/BibleVerseActions";

interface BibleVerseProps {
  bookId: number;
  chapter: string;
  version: string;
}

interface Verse {
  id: number;
  verse_number: number;
  text: string;
}

const BibleVerse = ({ bookId, chapter, version }: BibleVerseProps) => {
  const { toast } = useToast();

  const fetchVerses = async () => {
    console.log("Iniciando busca de versículos:", { bookId, chapter, version });
    
    // Primeiro, verificar se o livro existe
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
    
    // Buscar o chapter_id
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

    // Verificar se existem versículos para esta versão
    const { count: verseCount, error: countError } = await supabase
      .from('bible_verses')
      .select('*', { count: 'exact', head: true })
      .eq('version', version)
      .eq('chapter_id', chapterData.id);

    if (countError) {
      console.error('Erro ao contar versículos:', countError);
      throw new Error('Erro ao verificar versículos disponíveis');
    }

    console.log(`Total de versículos encontrados para capítulo ${chapterData.id}, versão ${version}:`, verseCount);

    // Buscar versículos
    const { data: versesData, error: versesError } = await supabase
      .from('bible_verses')
      .select('id, verse_number, text')
      .eq('version', version)
      .eq('chapter_id', chapterData.id)
      .order('verse_number');

    if (versesError) {
      console.error('Erro ao buscar versículos:', versesError);
      console.log('Detalhes da busca de versículos:', { 
        chapterId: chapterData.id, 
        version 
      });
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

    return versesData;
  };

  const { data: verses, isLoading, error } = useQuery({
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
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start gap-2">
          <span className="verse-number font-semibold text-bible-verse min-w-[1.5rem]">
            {verse.verse_number}
          </span>
          <div className="flex-1 rounded p-1">
            <BibleVerseActions
              verseId={verse.id}
              verseNumber={verse.verse_number}
              text={verse.text}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BibleVerse;