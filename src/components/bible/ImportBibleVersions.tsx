import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ImportBibleVersions = () => {
  const { toast } = useToast();

  const handleImport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('import-github-bible');
      
      if (error) {
        console.error('Erro na importação:', error);
        toast({
          title: "Erro na importação",
          description: "Houve um erro ao importar as versões da Bíblia.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Importação iniciada",
        description: "A importação das versões da Bíblia foi iniciada com sucesso. Este processo pode levar alguns minutos.",
      });

      console.log('Resposta da importação:', data);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro na importação",
        description: "Houve um erro ao importar as versões da Bíblia.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleImport}
      className="mb-4"
    >
      Importar Versões da Bíblia
    </Button>
  );
};

export default ImportBibleVersions;