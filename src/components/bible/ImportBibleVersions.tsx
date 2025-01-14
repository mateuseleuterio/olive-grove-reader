import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const VERSIONS = {
  "AA": "Almeida Atualizada",
  "ACF": "Almeida Corrigida Fiel",
  "KJF": "King James 1611"
} as const;

type BibleVersion = keyof typeof VERSIONS;

const ImportBibleVersions = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion>("AA");

  const importNextBook = async (bookIndex: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('import-github-bible', {
        body: { bookIndex, version: selectedVersion }
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

      if (data.stats.nextBookIndex < data.stats.totalBooks) {
        toast({
          title: "Importação em andamento",
          description: `Processado: ${data.stats.bookIndex + 1} de ${data.stats.totalBooks} livros`,
        });
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
      description: `A importação da versão ${VERSIONS[selectedVersion]} foi iniciada. Este processo pode levar alguns minutos.`,
    });
    
    await importNextBook(0);
  };

  return (
    <div className="flex gap-4 items-center mb-4">
      <Select 
        value={selectedVersion} 
        onValueChange={(value: BibleVersion) => setSelectedVersion(value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione a versão" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(VERSIONS).map(([id, name]) => (
            <SelectItem key={id} value={id}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleImport}
        disabled={isImporting}
      >
        {isImporting ? "Importando..." : "Importar Versão da Bíblia"}
      </Button>
    </div>
  );
};

export default ImportBibleVersions;