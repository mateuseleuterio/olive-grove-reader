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
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const dataToSave = {
        ...sermonData,
        user_id: userData.user.id,
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

      return data.id;
    } catch (error) {
      console.error('Erro ao salvar sermão:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o sermão. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSermon = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("sermons")
        .delete()
        .match({ id, user_id: userData.user.id });

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