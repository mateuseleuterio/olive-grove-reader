import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BIBLE_VERSIONS } from "@/hooks/useBibleReader";

const HideBibleVersions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [hiddenVersions, setHiddenVersions] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchHiddenVersions();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === '5e475092-3de0-47b8-8543-c62450e07bbd') {
      setIsAdmin(true);
    }
  };

  const fetchHiddenVersions = async () => {
    const { data, error } = await supabase
      .from('hidden_bible_versions')
      .select('version');
    
    if (error) {
      console.error('Erro ao buscar versões ocultas:', error);
      return;
    }

    setHiddenVersions(data.map(item => item.version));
  };

  const handleHideVersion = async () => {
    if (!selectedVersion) {
      toast({
        title: "Erro",
        description: "Selecione uma versão para ocultar",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('hidden_bible_versions')
      .insert({
        version: selectedVersion,
      });

    if (error) {
      console.error('Erro ao ocultar versão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ocultar a versão",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Versão ocultada com sucesso",
    });

    fetchHiddenVersions();
    setSelectedVersion("");
  };

  const handleUnhideVersion = async (version: string) => {
    const { error } = await supabase
      .from('hidden_bible_versions')
      .delete()
      .eq('version', version);

    if (error) {
      console.error('Erro ao mostrar versão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mostrar a versão",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Versão está visível novamente",
    });

    fetchHiddenVersions();
  };

  if (!isAdmin) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Versões da Bíblia</CardTitle>
        <CardDescription>
          Oculte ou mostre versões da Bíblia para todos os usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select 
            value={selectedVersion} 
            onValueChange={setSelectedVersion}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione a versão" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BIBLE_VERSIONS)
                .filter(([id]) => !hiddenVersions.includes(id))
                .map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={handleHideVersion}>Ocultar Versão</Button>
        </div>

        {hiddenVersions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Versões Ocultas:</h4>
            <div className="space-y-2">
              {hiddenVersions.map((version) => (
                <div key={version} className="flex items-center justify-between bg-secondary p-2 rounded">
                  <span>{BIBLE_VERSIONS[version as keyof typeof BIBLE_VERSIONS]}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleUnhideVersion(version)}
                  >
                    Mostrar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HideBibleVersions;