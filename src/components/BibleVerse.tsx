import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "./WordDetails";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  const [isVersionDownloaded, setIsVersionDownloaded] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkVersionStatus();
  }, [version]);

  const checkVersionStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setIsVersionDownloaded(false);
        setLoading(false);
        return;
      }

      const { data: versionData, error: versionError } = await supabase
        .from('user_bible_versions')
        .select('version')
        .eq('version', version.toLowerCase())
        .eq('user_id', session.session.user.id)
        .maybeSingle();

      if (versionError) throw versionError;
      setIsVersionDownloaded(!!versionData);

      if (versionData) {
        fetchVerses();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status da versão:', error);
      setLoading(false);
    }
  };

  const handleDownloadVersion = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Erro ao baixar versão",
          description: "Você precisa estar logado para baixar uma versão da Bíblia.",
          variant: "destructive",
        });
        return;
      }

      setDownloadLoading(true);
      
      // Registrar o download da versão
      const { error: downloadError } = await supabase
        .from('user_bible_versions')
        .insert([
          { 
            version: version.toLowerCase(),
            user_id: session.session.user.id
          }
        ]);

      if (downloadError) throw downloadError;

      toast({
        title: "Versão baixada com sucesso",
        description: "Agora você pode acessar esta versão da Bíblia.",
      });

      setIsVersionDownloaded(true);
      fetchVerses();
    } catch (error) {
      console.error('Erro ao baixar versão:', error);
      toast({
        title: "Erro ao baixar versão",
        description: "Não foi possível baixar esta versão da Bíblia.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const fetchVerses = async () => {
    try {
      setLoading(true);
      console.log(`Buscando versículos para: Livro ${bookId}, Capítulo ${chapter}, Versão ${version}`);
      
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

      const { data: versesData, error: versesError } = await supabase
        .from('bible_verses')
        .select(`
          id,
          verse_number,
          text
        `)
        .eq('version', version.toLowerCase())
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

  const renderVerse = (text: string) => {
    return text.split(" ").map((word, index) => (
      <WordDetails key={`${text}-${index}`} word={word} />
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4">Carregando...</div>;
  }

  if (!isVersionDownloaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-center text-muted-foreground">
          Esta versão da Bíblia ainda não foi baixada.
        </p>
        <Button 
          onClick={handleDownloadVersion}
          disabled={downloadLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {downloadLoading ? "Baixando..." : "Baixar versão"}
        </Button>
      </div>
    );
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