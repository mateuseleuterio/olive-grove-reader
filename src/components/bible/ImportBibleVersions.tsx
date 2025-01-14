import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ImportBibleVersions = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const importNextBook = async (bookIndex: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('import-github-bible', {
        body: { bookIndex }
      });
      
      if (error) {
        console.error('Erro na importação:', error);
        toast({
          title: "Erro na importação",
          description: "Houve um erro ao importar as versões da Bíblia.",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      if (data.errors && data.errors.length > 0) {
        console.warn('Erros durante a importação:', data.errors);
      }

      // Se ainda há mais livros para processar
      if (data.stats.nextBookIndex < data.stats.totalBooks) {
        toast({
          title: "Importação em andamento",
          description: `Processado: ${data.stats.bookIndex + 1} de ${data.stats.totalBooks} livros`,
        });
        // Continuar com o próximo livro
        await importNextBook(data.stats.nextBookIndex);
      } else {
        toast({
          title: "Importação concluída",
          description: "Todos os livros foram importados com sucesso!",
        });
        setIsImporting(false);
      }

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro na importação",
        description: "Houve um erro ao importar as versões da Bíblia.",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    toast({
      title: "Importação iniciada",
      description: "A importação das versões da Bíblia foi iniciada. Este processo pode levar alguns minutos.",
    });
    
    await importNextBook(0);
  };

  return (
    <Button 
      onClick={handleImport}
      className="mb-4"
      disabled={isImporting}
    >
      {isImporting ? "Importando..." : "Importar Versões da Bíblia"}
    </Button>
  );
};

export default ImportBibleVersions;