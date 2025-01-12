import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MentalMap {
  id: string;
  title: string;
  content: any;
  type: 'note' | 'mindmap';
  created_at: string;
  updated_at: string;
}

const MentalMaps = () => {
  const [maps, setMaps] = useState<MentalMap[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaps = async () => {
      const { data, error } = await supabase
        .from('mental_maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os mapas mentais.",
        });
        return;
      }

      setMaps(data || []);
    };

    fetchMaps();
  }, [toast]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Mapas Mentais</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maps.map((map) => (
          <div
            key={map.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold">{map.title}</h2>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(map.created_at).toLocaleDateString()}
            </p>
            <div className="mt-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-bible-navy rounded">
                {map.type === 'note' ? 'Nota' : 'Mapa Mental'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentalMaps;