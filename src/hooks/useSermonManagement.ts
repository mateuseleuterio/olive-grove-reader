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
      const user_id = userData.user?.id || '00000000-0000-0000-0000-000000000000';

      const dataToSave = {
        ...sermonData,
        user_id,
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
      
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData.user?.id || '00000000-0000-0000-0000-000000000000';
      
      // Primeiro, verificamos se o sermão pertence ao usuário
      const { data: sermon, error: fetchError } = await supabase
        .from("sermons")
        .select()
        .eq("id", id)
        .eq("user_id", user_id)
        .single();

      if (fetchError) throw fetchError;
      if (!sermon) throw new Error("Sermão não encontrado");

      // Se o sermão foi encontrado, podemos prosseguir com a deleção
      const { error } = await supabase
        .from("sermons")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user_id);

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