import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PreachingToolbar from "@/components/sermon/PreachingToolbar";
import SermonContent from "@/components/sermon/SermonContent";
import type { SermonType, SermonPoint } from "@/types/sermon";

const PreachingMode = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: sermon, isLoading } = useQuery({
    queryKey: ["sermon", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      // Ensure points is properly typed when coming from the database
      const typedSermon: SermonType = {
        ...data,
        points: data?.points ? data.points as SermonPoint[] : null
      };
      
      return typedSermon;
    },
  });

  const handleEditClick = () => {
    navigate(`/sermon-editor/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto">
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto">
          <div>Sermão não encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bible-gray">
      <PreachingToolbar onEdit={handleEditClick} />
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <SermonContent sermon={sermon} />
        </div>
      </div>
    </div>
  );
};

export default PreachingMode;