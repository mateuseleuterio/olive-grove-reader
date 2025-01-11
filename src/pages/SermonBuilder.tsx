import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Sermon = Database['public']['Tables']['sermons']['Row'];

const SermonBuilder = () => {
  const navigate = useNavigate();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("sermons").select("*");
      if (error) {
        console.error("Error fetching sermons:", error);
      } else {
        setSermons(data);
      }
      setLoading(false);
    };

    fetchSermons();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif font-bold text-bible-navy">
          Meus Sermões
        </h1>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/sermon-editor/blank")}
            className="bg-bible-navy hover:bg-bible-accent"
          >
            Novo Sermão
          </Button>
        </div>
      </div>
      
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {sermons.map((sermon) => (
            <li key={sermon.id} className="border-b py-4">
              <h2 className="text-lg font-semibold">{sermon.title}</h2>
              <p>{sermon.introduction}</p>
              <Button
                onClick={() => navigate(`/sermon-editor/structure?id=${sermon.id}`)}
                className="mt-2"
              >
                Editar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SermonBuilder;
