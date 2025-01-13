import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BlankSermonContainer from "@/components/sermon/BlankSermonContainer";
import StructuredSermonContainer from "@/components/sermon/StructuredSermonContainer";
import AISermonContainer from "@/components/sermon/AISermonContainer";

const SermonEditor = () => {
  const location = useLocation();
  const { id } = useParams();
  const type = location.pathname.split("/").pop();

  // Only fetch if id is a valid UUID
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: existingSermon, isLoading } = useQuery({
    queryKey: ["sermon", id],
    queryFn: async () => {
      if (!isValidUUID) return null;
      
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isValidUUID,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto">
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-bible-navy">
            {isValidUUID ? "Editar Sermão" : (
              <>
                {type === "blank" && "Começar do Zero"}
                {type === "structure" && "Estrutura Comprovada"}
                {type === "ai" && "Sermão com IA"}
              </>
            )}
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {(type === "blank" || (existingSermon && existingSermon.bible_text)) && (
            <BlankSermonContainer
              id={id}
              initialTitle={existingSermon?.title || ""}
              initialContent={existingSermon?.bible_text || ""}
            />
          )}
          {(type === "structure" || (existingSermon && !existingSermon.bible_text)) && (
            <StructuredSermonContainer
              id={id}
              initialTitle={existingSermon?.title || ""}
              initialIntroduction={existingSermon?.introduction || ""}
              initialPoints={existingSermon?.points || [{ title: "", content: "", illustrations: [] }]}
              initialConclusion={existingSermon?.conclusion || ""}
            />
          )}
          {type === "ai" && (
            <AISermonContainer />
          )}
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;