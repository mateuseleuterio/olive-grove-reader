import React from "react";
import { SermonType } from "@/types/sermon";

interface SermonContentProps {
  sermon: SermonType;
}

const SermonContent: React.FC<SermonContentProps> = ({ sermon }) => {
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

        {sermon.points && Array.isArray(sermon.points) && sermon.points.map((point: any, index: number) => (
          <div key={index} className="space-y-4">
            <h2 className="text-2xl font-serif text-bible-navy">{point.title}</h2>
            <div className="text-lg leading-relaxed font-serif">{point.content}</div>
            {point.illustrations && Array.isArray(point.illustrations) && point.illustrations.map((ill: any, illIndex: number) => (
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

export default SermonContent;