import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AISermonFormProps {
  prompt: string;
  generatedSermon: string;
  isLoading: boolean;
  isEditing: boolean;
  onPromptChange: (value: string) => void;
  onGeneratedSermonChange: (value: string) => void;
  onEditToggle: () => void;
  onGenerate: () => void;
}

const AISermonForm = ({
  prompt,
  generatedSermon,
  isLoading,
  isEditing,
  onPromptChange,
  onGeneratedSermonChange,
  onEditToggle,
  onGenerate,
}: AISermonFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Textarea
          placeholder="Descreva a ideia do seu sermão..."
          className="min-h-[150px]"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </div>
      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-bible-navy hover:bg-bible-accent"
      >
        {isLoading ? "Gerando..." : "Gerar Sermão"}
      </Button>
      {generatedSermon && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onEditToggle}
              className="text-bible-navy hover:bg-bible-gray/10"
            >
              {isEditing ? "Visualizar" : "Editar"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={generatedSermon}
              onChange={(e) => onGeneratedSermonChange(e.target.value)}
              className="min-h-[500px] font-serif"
            />
          ) : (
            <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
              <div 
                className="space-y-4 font-serif"
                dangerouslySetInnerHTML={{ 
                  __html: generatedSermon
                    .split('\n')
                    .map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1 class="text-2xl font-bold text-bible-navy">${line.slice(2)}</h1>`;
                      } else if (line.startsWith('## ')) {
                        return `<h2 class="text-xl font-semibold text-bible-navy mt-6">${line.slice(3)}</h2>`;
                      } else if (line.startsWith('### ')) {
                        return `<h3 class="text-lg font-medium text-bible-navy mt-4">${line.slice(4)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li class="ml-4">${line.slice(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '<br>';
                      } else {
                        return `<p class="text-gray-700">${line}</p>`;
                      }
                    })
                    .join('\n')
                }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISermonForm;