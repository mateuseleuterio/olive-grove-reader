import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput } from "@/types/sermon";

export const useSermonManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveSermon = async (sermonData: SermonInput) => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id || null;

      const dataToSave = {
        ...sermonData,
        user_id,
        points: sermonData.points || []
      };

      const { data, error } = await supabase
        .from("sermons")
        .insert([dataToSave])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sermão salvo com sucesso!",
      });

      navigate(`/sermon-editor/${data.id}`);
    } catch (error) {
      console.error('Erro ao salvar sermão:', error);
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
    isLoading,
    handleSaveSermon,
  };
};