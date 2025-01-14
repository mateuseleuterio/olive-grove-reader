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
        setLoading(true);
        console.log(`Buscando versículos para: Livro ${bookId}, Capítulo ${chapter}, Versão ${version}`);
        
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
            title: "Erro ao carregar capítulo",
            description: "Não foi possível encontrar o capítulo solicitado.",
            variant: "destructive",
          });
          return;
        }

        if (!chapterData) {
          console.log('Capítulo não encontrado');
          setVerses([]);
          return;
        }

        console.log('Chapter ID encontrado:', chapterData.id);

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
            title: "Erro ao carregar versículos",
            description: "Não foi possível carregar os versículos desta versão.",
            variant: "destructive",
          });
          return;
        }

        if (!versesData || versesData.length === 0) {
          toast({
            title: "Versão não disponível",
            description: `A versão ${version} não está disponível para este texto.`,
            variant: "destructive",
          });
        }

        console.log(`${versesData?.length || 0} versículos encontrados`);
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
    return <div className="flex justify-center items-center p-4">Carregando...</div>;
  }

  if (verses.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-muted-foreground">
        Nenhum versículo encontrado para esta versão
      </div>
    );
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