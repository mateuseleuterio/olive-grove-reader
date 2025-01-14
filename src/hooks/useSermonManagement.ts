import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput } from "@/types/sermon";
import { saveSermon } from "@/utils/sermonUtils";

export const useSermonManagement = (id?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSermon = async (sermonData: Partial<SermonType>) => {
    if (!sermonData.title) {
      toast({
        title: "Erro",
        description: "O título do sermão é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting sermon save process...');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log('Current user:', user);

      const finalSermonData: SermonInput = {
        title: sermonData.title,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        bible_text: sermonData.bible_text,
        introduction: sermonData.introduction,
        points: sermonData.points,
        conclusion: sermonData.conclusion,
      };

      console.log('Saving sermon with data:', finalSermonData);

      const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const result = await saveSermon(finalSermonData, isValidUUID, id);

      console.log('Save result:', result);

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