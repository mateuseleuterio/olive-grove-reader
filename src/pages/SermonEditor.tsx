import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";

const SermonEditor = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [points, setPoints] = useState<string[]>([]);

  const handleAddPoint = () => {
    setPoints([...points, ""]);
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleDeletePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  if (type === "structure") {
    return (
      <div className="min-h-screen bg-bible-gray p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                1. Título - Texto Base
              </label>
              <Input placeholder="Digite o título e o texto base do sermão (ex: A Criação - Gênesis 1:1)" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                2. Introdução
              </label>
              <Textarea placeholder="Digite a introdução do sermão" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                3. Desenvolvimento
              </label>
              <div className="space-y-4">
                {points.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Ponto {index + 1}
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          value={point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          placeholder={`Digite o ponto ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePoint(index)}
                          className="self-start"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPoint}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ponto
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                4. Conclusão
              </label>
              <Textarea placeholder="Digite a conclusão do sermão" />
            </div>

            <Button className="w-full">
              Salvar Sermão
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bible-gray p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-serif mb-6">
            {type === 'blank' && 'Sermão em Branco'}
            {type === 'ai' && 'Sermão com IA'}
          </h1>

          {type === 'blank' && (
            <Textarea
              className="min-h-[500px]"
              placeholder="Digite seu sermão aqui..."
            />
          )}

          {type === 'ai' && (
            <div className="space-y-4">
              <Input placeholder="Digite o tema ou texto base do seu sermão" />
              <Button className="w-full">
                Gerar Sugestões
              </Button>
              <Textarea
                className="min-h-[400px]"
                placeholder="As sugestões da IA aparecerão aqui..."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SermonEditor;