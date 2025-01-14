import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import { Card } from "@/components/ui/card";

const SermonEditor = () => {
  const navigate = useNavigate();
  const { handleSaveSermon, isLoading } = useSermonManagement();
  const [sermon, setSermon] = useState({
    title: "",
    introduction: "",
    points: [{ title: "Desenvolvimento", content: "" }],
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

          <div>
            <Label htmlFor="development">Desenvolvimento</Label>
            <Textarea
              id="development"
              value={sermon.points[0].content}
              onChange={e => setSermon(prev => ({
                ...prev,
                points: [{ ...prev.points[0], content: e.target.value }]
              }))}
              placeholder="Digite o desenvolvimento do sermão"
              className="min-h-[200px]"
            />
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