import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput, SermonPointJson } from "@/types/sermon";

export const useSermonManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveSermon = async (sermonData: SermonInput) => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id;

      const dataToSave = {
        ...sermonData,
        user_id,
        // Convertendo o array de SermonPoint para um formato compatível com Json
        points: sermonData.points.map(point => ({
          title: point.title,
          content: point.content,
          illustrations: point.illustrations.map(ill => ({
            content: ill.content,
            type: ill.type
          }))
        })) as SermonPointJson[]
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

  const handleDeleteSermon = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("sermons")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Sermão excluído com sucesso!",
      });

      navigate("/sermon-builder");
    } catch (error) {
      console.error('Erro ao excluir sermão:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSaveSermon,
    handleDeleteSermon,
  };
};