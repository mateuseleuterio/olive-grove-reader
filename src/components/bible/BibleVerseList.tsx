import { useState } from "react";
import { BibleVerseActions } from "./BibleVerseActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Verse {
  id: number;
  verse_number: number;
  text: string;
}

interface BibleVerseListProps {
  verses: Verse[];
  selectedVerses: number[];
  onVerseSelect: (verseId: number) => void;
}

export const BibleVerseList = ({ verses, selectedVerses, onVerseSelect }: BibleVerseListProps) => {
  const [expandedVerses, setExpandedVerses] = useState<number[]>([]);

  const { data: originalTexts } = useQuery({
    queryKey: ['verse-originals', expandedVerses],
    queryFn: async () => {
      if (expandedVerses.length === 0) return {};
      
      const { data, error } = await supabase
        .from('bible_verse_originals')
        .select('*')
        .in('verse_id', expandedVerses);

      if (error) throw error;

      return data.reduce((acc: Record<number, string>, curr) => {
        acc[curr.verse_id] = curr.original_text;
        return acc;
      }, {});
    },
    enabled: expandedVerses.length > 0
  });

  const toggleOriginalText = (verseId: number) => {
    setExpandedVerses(prev => 
      prev.includes(verseId) 
        ? prev.filter(id => id !== verseId)
        : [...prev, verseId]
    );
  };

  return (
    <div className="space-y-2">
      {verses?.map((verse) => (
        <div key={verse.id} className="space-y-1">
          <div className="flex items-start gap-2">
            <div className="flex-1 rounded">
              <BibleVerseActions
                verseId={verse.id}
                text={`${verse.verse_number} ${verse.text}`}
                isSelected={selectedVerses.includes(verse.id)}
                onSelect={onVerseSelect}
                onOriginalTextToggle={() => toggleOriginalText(verse.id)}
                showOriginalText={expandedVerses.includes(verse.id)}
              />
            </div>
          </div>
          {expandedVerses.includes(verse.id) && originalTexts?.[verse.id] && (
            <div className="pl-6 pr-4 py-2 bg-bible-gray/50 rounded font-hebrew text-right text-lg">
              {originalTexts[verse.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};