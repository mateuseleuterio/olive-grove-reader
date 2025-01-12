import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Timer from "@/components/Timer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data;
    },
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

  if (!sermon) {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto">
          <div>Sermão não encontrado</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (sermon.bible_text) {
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-serif text-bible-navy mb-8">{sermon.title}</h1>
          <div className="text-lg leading-relaxed font-serif">{sermon.bible_text}</div>
        </div>
      );
    }

    return (
      <div className="prose max-w-none">
        <h1 className="text-3xl font-serif text-bible-navy mb-8">{sermon.title}</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-bible-navy">Introdução</h2>
            <div className="text-lg leading-relaxed font-serif">{sermon.introduction}</div>
          </div>

          {sermon.points && sermon.points.map((point: any, index: number) => (
            <div key={index} className="space-y-4">
              <h2 className="text-2xl font-serif text-bible-navy">{point.title}</h2>
              <div className="text-lg leading-relaxed font-serif">{point.content}</div>
              {point.illustrations && point.illustrations.map((ill: any, illIndex: number) => (
                <div key={illIndex} className="ml-6 p-4 bg-bible-gray/20 rounded-lg">
                  <div className="text-lg leading-relaxed font-serif">{ill.content}</div>
                </div>
              ))}
            </div>
          ))}

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-bible-navy">Conclusão</h2>
            <div className="text-lg leading-relaxed font-serif">{sermon.conclusion}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bible-gray">
      <div className="fixed top-16 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <Timer />
            <Button
              variant="ghost"
              onClick={() => navigate(`/sermon-editor/${id}`)}
              className="text-bible-navy hover:bg-bible-gray/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PreachingMode;