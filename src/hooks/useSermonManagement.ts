import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType } from "@/types/sermon";
import { saveSermon } from "@/utils/sermonUtils";

export const useSermonManagement = (id?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSermon = async (sermonData: Partial<SermonType>) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const finalSermonData = {
        ...sermonData,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
      };

      console.log('Saving sermon with data:', finalSermonData);

      const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const result = await saveSermon(finalSermonData, isValidUUID, id);

      toast({
        title: "Sucesso",
        description: "Sermão salvo com sucesso!",
      });

      navigate(`/preaching-mode/${result.id}`);
    } catch (error) {
      console.error('Error saving sermon:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSaveSermon,
    isLoading,
  };
};