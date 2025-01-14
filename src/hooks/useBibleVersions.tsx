import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const BIBLE_VERSIONS = {
  "ACF": "Almeida Corrigida Fiel"
} as const;

type BibleVersion = keyof typeof BIBLE_VERSIONS;

export const useBibleVersions = () => {
  const [versions, setVersions] = useState<Array<{ id: BibleVersion; name: string }>>([
    { id: "ACF", name: BIBLE_VERSIONS.ACF }
  ]);
  const { toast } = useToast();

  const addVersion = () => {
    if (versions.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 4 versões para comparação.",
        variant: "destructive",
      });
      return;
    }

    const newVersion = { id: "ACF" as BibleVersion, name: BIBLE_VERSIONS.ACF };
    setVersions([...versions, newVersion]);
    
    toast({
      title: "Versão adicionada",
      description: "Uma nova versão foi adicionada para comparação.",
    });
  };

  const removeVersion = (index: number) => {
    if (versions.length <= 1) {
      toast({
        title: "Operação não permitida",
        description: "Você precisa manter pelo menos uma versão.",
        variant: "destructive",
      });
      return;
    }
    const newVersions = versions.filter((_, i) => i !== index);
    setVersions(newVersions);
    
    toast({
      title: "Versão removida",
      description: "A versão foi removida da comparação.",
    });
  };

  const handleVersionChange = (index: number, newVersion: BibleVersion) => {
    const newVersions = versions.map((v, i) => {
      if (i === index) {
        return { id: newVersion, name: BIBLE_VERSIONS[newVersion] };
      }
      return v;
    });
    setVersions(newVersions);
  };

  return {
    versions,
    BIBLE_VERSIONS,
    addVersion,
    removeVersion,
    handleVersionChange,
  };
};