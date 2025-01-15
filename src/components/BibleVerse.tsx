import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { BibleVerseActions } from "./bible/BibleVerseActions";
import { StickyNote, Share, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const HIGHLIGHT_COLORS = {
  yellow: "bg-[#FFF3B0]",
  blue: "bg-[#C1E3FF]",
  red: "bg-[#FFD6DB]",
  purple: "bg-[#DED4FF]",
  green: "bg-[#E8FAD5]",
  orange: "bg-[#FFE4D3]",
};

const BibleVerse = ({ bookId, chapter, version }: BibleVerseProps) => {
  const { toast } = useToast();
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
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

  const handleVerseSelect = (verseId: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseId)) {
        return prev.filter(id => id !== verseId);
      }
      return [...prev, verseId];
    });
  };

  const handleRemoveHighlights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const verseId of selectedVerses) {
        const { error } = await supabase
          .from('bible_verse_highlights')
          .delete()
          .eq('verse_id', verseId)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['verse-highlight'] });
      setSelectedVerses([]);
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

  useEffect(() => {
    const checkHighlights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let hasHighlights = false;
        for (const verseId of selectedVerses) {
          const { data } = await supabase
            .from('bible_verse_highlights')
            .select('id')
            .eq('verse_id', verseId)
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
    
    if (selectedVerses.length > 0) {
      checkHighlights();
    } else {
      setHasHighlightedVerses(false);
    }
  }, [selectedVerses]);

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
      {selectedVerses.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50 min-w-[600px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              {hasHighlightedVerses && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveHighlights}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  <X className="h-3 w-3 mr-1" />
                  <span>Remover destaque</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-6 gap-4">
              {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
                <button
                  key={color}
                  className={`h-12 rounded-md ${className} hover:opacity-80 transition-opacity`}
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      // Se já existe destaque, remove primeiro
                      if (hasHighlightedVerses) {
                        await handleRemoveHighlights();
                      }

                      // Aplica o novo destaque
                      for (const verseId of selectedVerses) {
                        const { error } = await supabase
                          .from('bible_verse_highlights')
                          .insert({
                            verse_id: verseId,
                            color,
                            user_id: user.id
                          });
                        
                        if (error) throw error;
                      }

                      // Atualiza a UI
                      queryClient.invalidateQueries({ queryKey: ['verse-highlight'] });
                      setSelectedVerses([]);
                    } catch (error) {
                      console.error('Erro ao destacar versículo:', error);
                      toast({
                        title: "Erro",
                        description: "Não foi possível destacar o versículo.",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <StickyNote className="h-4 w-4" />
                <span>Anotar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                <span>Compartilhar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Original</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start gap-2">
          <div className="flex-1 rounded p-1">
            <BibleVerseActions
              verseId={verse.id}
              text={verse.text}
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={handleVerseSelect}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BibleVerse;