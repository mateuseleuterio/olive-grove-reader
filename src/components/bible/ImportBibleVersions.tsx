import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const VERSIONS = {
  "AA": "Almeida Atualizada",
  "ACF": "Almeida Corrigida Fiel",
  "KJF": "King James 1611",
  "NAA": "Nova Almeida Atualizada",
  "NVT": "Nova Versão Transformadora",
  "ARA": "Almeida Revista e Atualizada"
} as const;

type BibleVersion = keyof typeof VERSIONS;

export const ImportBibleVersions = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion>("AA");
  const [showImportSection, setShowImportSection] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem("showBibleImportSection");
    setShowImportSection(savedPreference === "true");
  }, []);

  const handleToggleImportSection = (checked: boolean) => {
    setShowImportSection(checked);
    localStorage.setItem("showBibleImportSection", checked.toString());
  };

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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-import"
          checked={showImportSection}
          onCheckedChange={handleToggleImportSection}
        />
        <Label htmlFor="show-import">Mostrar seção de importação da Bíblia</Label>
      </div>

      {showImportSection && (
        <div className="flex gap-4 items-center">
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
      )}
    </div>
  );
};

export default ImportBibleVersions;