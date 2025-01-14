import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonPoint } from "@/types/sermon";
import SermonContent from "@/components/sermon/SermonContent";

const PreachingMode = () => {
  const { id } = useParams<{ id: string }>();

  const { data: sermon, isLoading, error } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Sermão não encontrado');

      return {
        ...data,
        points: data.points as unknown as SermonPoint[]
      } as SermonType;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Erro ao carregar sermão: {error.message}
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Sermão não encontrado
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SermonContent sermon={sermon} />
    </div>
  );
};

export default PreachingMode;