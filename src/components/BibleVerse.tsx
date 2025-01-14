import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";
import { useToast } from "@/hooks/use-toast";

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
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        console.log("Iniciando busca de versículos:", { bookId, chapter, version });
        
        // Primeiro, buscar o chapter_id
        const { data: chapterData, error: chapterError } = await supabase
          .from('bible_chapters')
          .select('id')
          .eq('book_id', bookId)
          .eq('chapter_number', parseInt(chapter))
          .maybeSingle();

        if (chapterError) {
          console.error('Erro ao buscar capítulo:', chapterError);
          toast({
            title: "Erro ao buscar capítulo",
            description: chapterError.message,
            variant: "destructive",
          });
          return;
        }

        if (!chapterData) {
          console.log('Capítulo não encontrado para:', { bookId, chapter });
          setVerses([]);
          return;
        }

        console.log('Chapter ID encontrado:', chapterData.id);

        // Verificar se existem versículos para esta versão
        const { count: verseCount, error: countError } = await supabase
          .from('bible_verses')
          .select('*', { count: 'exact', head: true })
          .eq('version', version);

        if (countError) {
          console.error('Erro ao contar versículos:', countError);
          return;
        }

        console.log(`Total de versículos para versão ${version}:`, verseCount);

        // Agora buscar os versículos usando o chapter_id
        const { data: versesData, error: versesError } = await supabase
          .from('bible_verses')
          .select(`
            id,
            verse_number,
            text
          `)
          .eq('version', version)
          .eq('chapter_id', chapterData.id)
          .order('verse_number');

        if (versesError) {
          console.error('Erro ao buscar versículos:', versesError);
          toast({
            title: "Erro ao buscar versículos",
            description: versesError.message,
            variant: "destructive",
          });
          return;
        }

        // Log detalhado dos versículos encontrados
        console.log("Versículos encontrados:", {
          quantidade: versesData?.length,
          version,
          chapterId: chapterData.id,
          primeiroVersiculo: versesData?.[0],
          ultimoVersiculo: versesData?.[versesData.length - 1]
        });

        if (!versesData || versesData.length === 0) {
          console.log('Nenhum versículo encontrado para:', {
            version,
            chapterId: chapterData.id,
            bookId,
            chapter
          });
          
          toast({
            title: "Versão não disponível",
            description: `A versão ${version} ainda não está disponível para este capítulo.`,
            variant: "destructive",
          });
        }

        setVerses(versesData || []);
      } catch (error) {
        console.error('Erro:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar os versículos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [bookId, chapter, version, toast]);

  const renderVerse = (text: string) => {
    return text.split(" ").map((word, index) => (
      <WordDetails key={`${text}-${index}`} word={word} />
    ));
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (verses.length === 0) {
    return <div>Nenhum versículo encontrado</div>;
  }

  return (
    <div className="space-y-4">
      {verses.map((verse) => (
        <p key={verse.id} className="break-words">
          <span className="verse-number">{verse.verse_number}</span>
          {renderVerse(verse.text)}
        </p>
      ))}
    </div>
  );
};

export default BibleVerse;