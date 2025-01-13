import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonPoint } from "@/types/sermon";

const PreachingMode = () => {
  const { id } = useParams<{ id: string }>();

  const { data: sermon } = useQuery({
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

  if (!sermon) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{sermon.title}</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Texto Bíblico</h2>
          <p>{sermon.bible_text}</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-2">Introdução</h2>
          <p>{sermon.introduction}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Pontos</h2>
          <div className="space-y-4">
            {sermon.points.map((point, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium">{point.title}</h3>
                <p>{point.content}</p>
                {point.illustrations.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-medium">Ilustrações:</h4>
                    <ul className="list-disc list-inside">
                      {point.illustrations.map((illustration, i) => (
                        <li key={i}>{illustration.content}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Conclusão</h2>
          <p>{sermon.conclusion}</p>
        </section>
      </div>
    </div>
  );
};

export default PreachingMode;