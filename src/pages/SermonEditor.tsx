import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const SermonEditor = () => {
  const navigate = useNavigate();
  const { handleSaveSermon, isLoading } = useSermonManagement();
  const [sermon, setSermon] = useState({
    title: "",
    introduction: "",
    points: [{
      title: "Ponto 1",
      content: "",
      illustrations: []
    }],
    conclusion: "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSaveSermon(sermon);
      navigate('/sermon-builder');
    } catch (error) {
      console.error('Error saving sermon:', error);
    }
  };

  const addPoint = () => {
    setSermon(prev => ({
      ...prev,
      points: [
        ...prev.points,
        {
          title: `Ponto ${prev.points.length + 1}`,
          content: "",
          illustrations: []
        }
      ]
    }));
  };

  const removePoint = (index: number) => {
    setSermon(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <Label htmlFor="title">Título do Sermão</Label>
            <Input
              id="title"
              value={sermon.title}
              onChange={e => setSermon(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Digite o título do sermão"
            />
          </div>

          <div>
            <Label htmlFor="introduction">Introdução</Label>
            <Textarea
              id="introduction"
              value={sermon.introduction}
              onChange={e => setSermon(prev => ({ ...prev, introduction: e.target.value }))}
              placeholder="Digite a introdução do sermão"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Desenvolvimento</Label>
              <Button
                type="button"
                onClick={addPoint}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Ponto
              </Button>
            </div>
            
            {sermon.points.map((point, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <div className="flex items-center justify-between mb-2">
                  <Label>{point.title}</Label>
                  {sermon.points.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePoint(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={point.content}
                  onChange={e => setSermon(prev => ({
                    ...prev,
                    points: prev.points.map((p, i) =>
                      i === index ? { ...p, content: e.target.value } : p
                    )
                  }))}
                  placeholder={`Digite o conteúdo do ${point.title.toLowerCase()}`}
                  className="min-h-[100px]"
                />
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="conclusion">Conclusão</Label>
            <Textarea
              id="conclusion"
              value={sermon.conclusion}
              onChange={e => setSermon(prev => ({ ...prev, conclusion: e.target.value }))}
              placeholder="Digite a conclusão do sermão"
              className="min-h-[100px]"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Sermão"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SermonEditor;