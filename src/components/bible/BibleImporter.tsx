import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const VERSIONS = ["ara", "arc", "nvi", "kjv", "bbe"];

const BibleImporter = () => {
  const [importing, setImporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const importVersion = async (version: string) => {
    try {
      setLogs(prev => [...prev, `Iniciando importação da versão ${version.toUpperCase()}...`]);
      
      const { data, error } = await supabase.functions.invoke('import-github-bibles', {
        body: { version }
      });

      if (error) throw error;

      setLogs(prev => [...prev, `✅ ${data.message}`]);
      
      toast({
        title: "Sucesso!",
        description: `Versão ${version.toUpperCase()} importada com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao importar versão:', error);
      setLogs(prev => [...prev, `❌ Erro ao importar versão ${version.toUpperCase()}: ${error.message}`]);
      
      toast({
        title: "Erro",
        description: `Erro ao importar versão ${version.toUpperCase()}`,
        variant: "destructive",
      });
    }
  };

  const importAllVersions = async () => {
    setImporting(true);
    setLogs([]);

    for (const version of VERSIONS) {
      await importVersion(version);
    }

    setImporting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Importador de Versões da Bíblia</CardTitle>
        <CardDescription>
          Importe todas as versões disponíveis da Bíblia para o banco de dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={importAllVersions} 
          disabled={importing}
          className="w-full"
        >
          {importing ? "Importando..." : "Importar Todas as Versões"}
        </Button>

        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-2">
            {logs.map((log, index) => (
              <p key={index} className="text-sm">
                {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BibleImporter;