import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonPoint } from "@/types/sermon";

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
      <h1 className="text-3xl font-bold mb-4">{sermon.title}</h1>
      <div className="space-y-6">
        {sermon.bible_text && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Texto Bíblico</h2>
            <p>{sermon.bible_text}</p>
          </section>
        )}
        
        {sermon.introduction && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Introdução</h2>
            <p>{sermon.introduction}</p>
          </section>
        )}

        {sermon.points && sermon.points.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Desenvolvimento</h2>
            <div className="space-y-4">
              {sermon.points.map((point, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium">{point.title}</h3>
                  <p className="mt-2">{point.content}</p>
                  {point.illustrations && point.illustrations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">Ilustrações:</h4>
                      <ul className="list-disc list-inside mt-2 space-y-2">
                        {point.illustrations.map((illustration, i) => (
                          <li key={i} className="text-gray-600">{illustration.content}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {sermon.conclusion && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Conclusão</h2>
            <p>{sermon.conclusion}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PreachingMode;