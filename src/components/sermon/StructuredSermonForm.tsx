import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import type { SermonType, SermonPoint } from "@/types/sermon";

interface StructuredSermonFormProps {
  title: string;
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
  onTitleChange: (value: string) => void;
  onIntroductionChange: (value: string) => void;
  onPointsChange: (points: SermonPoint[]) => void;
  onConclusionChange: (value: string) => void;
}

const StructuredSermonForm = ({
  title,
  introduction,
  points,
  conclusion,
  onTitleChange,
  onIntroductionChange,
  onPointsChange,
  onConclusionChange,
}: StructuredSermonFormProps) => {
  const addIllustration = (pointIndex: number) => {
    const newPoints = [...points];
    newPoints[pointIndex].illustrations.push({
      content: "",
      type: "text",
    });
    onPointsChange(newPoints);
  };

  const updateIllustration = (pointIndex: number, illIndex: number, content: string) => {
    const newPoints = [...points];
    newPoints[pointIndex].illustrations[illIndex].content = content;
    onPointsChange(newPoints);
  };

  const addPoint = () => {
    onPointsChange([...points, { title: "", content: "", illustrations: [] }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Título do sermão"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div>
        <h3 className="text-lg font-serif mb-2 text-bible-navy">Introdução</h3>
        <Textarea
          placeholder="Introdução do sermão"
          className="min-h-[150px]"
          value={introduction}
          onChange={(e) => onIntroductionChange(e.target.value)}
        />
      </div>
      <div className="space-y-6">
        <h3 className="text-lg font-serif text-bible-navy">Desenvolvimento</h3>
        {points.map((point, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg bg-white">
            <Input
              placeholder={`Título do ponto ${index + 1}`}
              value={point.title}
              onChange={(e) => {
                const newPoints = [...points];
                newPoints[index].title = e.target.value;
                onPointsChange(newPoints);
              }}
            />
            <div className="flex items-center gap-2">
              <Textarea
                placeholder={`Conteúdo do ponto ${index + 1}`}
                className="min-h-[100px]"
                value={point.content}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[index].content = e.target.value;
                  onPointsChange(newPoints);
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => addIllustration(index)}
                className="flex-shrink-0"
              >
                <ImagePlus className="h-4 w-4 text-bible-navy" />
              </Button>
            </div>
            {point.illustrations.map((ill, illIndex) => (
              <div key={illIndex} className="ml-6 p-3 bg-bible-gray rounded-md">
                <Textarea
                  placeholder="Digite sua ilustração aqui..."
                  className="min-h-[80px]"
                  value={ill.content}
                  onChange={(e) => updateIllustration(index, illIndex, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addPoint}
          className="w-full text-bible-navy hover:bg-bible-gray/10"
        >
          Adicionar Ponto
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-serif mb-2 text-bible-navy">Conclusão</h3>
        <Textarea
          placeholder="Conclusão do sermão"
          className="min-h-[150px]"
          value={conclusion}
          onChange={(e) => onConclusionChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StructuredSermonForm;