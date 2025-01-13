import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus as PlusIcon, Trash as TrashIcon } from "lucide-react";
import type { SermonType, SermonPoint, Illustration } from "@/types/sermon";

const SermonEditor = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sermon, setSermon] = useState<SermonType>({
    title: "",
    bible_text: "",
    introduction: "",
    points: [],
    conclusion: "",
    user_id: "user123" // TODO: Get from auth
  });

  const { data: existingSermon } = useQuery({
    queryKey: ['sermon', id],
    queryFn: async () => {
      if (!id || type === 'new') return null;
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
    },
    enabled: !!id && type !== 'new'
  });

  useEffect(() => {
    if (existingSermon) {
      setSermon(existingSermon);
    }
  }, [existingSermon]);

  const saveSermonMutation = useMutation({
    mutationFn: async (newSermon: SermonType) => {
      const dataToSave = {
        ...newSermon,
        id: id || crypto.randomUUID(),
        points: newSermon.points as unknown as Json
      };

      if (id && type !== 'new') {
        const { data, error } = await supabase
          .from('sermons')
          .update(dataToSave)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('sermons')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermon'] });
      navigate('/sermon-builder');
    }
  });

  const handleAddPoint = () => {
    setSermon(prev => ({
      ...prev,
      points: [
        ...prev.points,
        { title: "", content: "", illustrations: [] }
      ]
    }));
  };

  const handleRemovePoint = (index: number) => {
    setSermon(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const handleAddIllustration = (pointIndex: number) => {
    setSermon(prev => ({
      ...prev,
      points: prev.points.map((point, i) => {
        if (i === pointIndex) {
          return {
            ...point,
            illustrations: [
              ...point.illustrations,
              { content: "", type: "text" } as Illustration
            ]
          };
        }
        return point;
      })
    }));
  };

  const handleRemoveIllustration = (pointIndex: number, illustrationIndex: number) => {
    setSermon(prev => ({
      ...prev,
      points: prev.points.map((point, i) => {
        if (i === pointIndex) {
          return {
            ...point,
            illustrations: point.illustrations.filter((_, j) => j !== illustrationIndex)
          };
        }
        return point;
      })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSermonMutation.mutate(sermon);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {id && type !== 'new' ? 'Editar Sermão' : 'Novo Sermão'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={sermon.title}
            onChange={e => setSermon(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="bible_text">Texto Bíblico</Label>
          <Textarea
            id="bible_text"
            value={sermon.bible_text}
            onChange={e => setSermon(prev => ({ ...prev, bible_text: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="introduction">Introdução</Label>
          <Textarea
            id="introduction"
            value={sermon.introduction}
            onChange={e => setSermon(prev => ({ ...prev, introduction: e.target.value }))}
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Pontos</Label>
            <Button type="button" onClick={handleAddPoint} variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Ponto
            </Button>
          </div>

          <div className="space-y-4">
            {sermon.points.map((point, pointIndex) => (
              <div key={pointIndex} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Título do ponto"
                      value={point.title}
                      onChange={e => setSermon(prev => ({
                        ...prev,
                        points: prev.points.map((p, i) =>
                          i === pointIndex ? { ...p, title: e.target.value } : p
                        )
                      }))}
                    />
                    <Textarea
                      placeholder="Conteúdo do ponto"
                      value={point.content}
                      onChange={e => setSermon(prev => ({
                        ...prev,
                        points: prev.points.map((p, i) =>
                          i === pointIndex ? { ...p, content: e.target.value } : p
                        )
                      }))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePoint(pointIndex)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Ilustrações</Label>
                    <Button
                      type="button"
                      onClick={() => handleAddIllustration(pointIndex)}
                      variant="outline"
                      size="sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Adicionar Ilustração
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {point.illustrations.map((illustration, illustrationIndex) => (
                      <div key={illustrationIndex} className="flex gap-2">
                        <Input
                          placeholder="Ilustração"
                          value={illustration.content}
                          onChange={e => setSermon(prev => ({
                            ...prev,
                            points: prev.points.map((p, i) => {
                              if (i === pointIndex) {
                                const newIllustrations = [...p.illustrations];
                                newIllustrations[illustrationIndex] = { ...newIllustrations[illustrationIndex], content: e.target.value };
                                return { ...p, illustrations: newIllustrations };
                              }
                              return p;
                            })
                          }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveIllustration(pointIndex, illustrationIndex)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="conclusion">Conclusão</Label>
          <Textarea
            id="conclusion"
            value={sermon.conclusion}
            onChange={e => setSermon(prev => ({ ...prev, conclusion: e.target.value }))}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/sermon-builder')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            {id && type !== 'new' ? 'Salvar Alterações' : 'Criar Sermão'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SermonEditor;