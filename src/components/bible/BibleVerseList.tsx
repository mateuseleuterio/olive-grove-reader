import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BibleVerseActions } from "./BibleVerseActions";

interface Verse {
  id: number;
  verse_number: number;
  text: string;
}

interface BibleVerseListProps {
  verses: Verse[];
  selectedVerses: number[];
  onVerseSelect: (verseId: number) => void;
  showOriginal?: boolean;
}

export const BibleVerseList = ({ verses, selectedVerses, onVerseSelect, showOriginal }: BibleVerseListProps) => {
  const { data: originals } = useQuery({
    queryKey: ['verse-originals', selectedVerses],
    queryFn: async () => {
      if (selectedVerses.length === 0) return {};
      
      const { data, error } = await supabase
        .from('bible_verse_originals')
        .select('*')
        .in('verse_id', selectedVerses);
        
      if (error) {
        console.error('Error fetching originals:', error);
        return {};
      }

      return data.reduce((acc: Record<number, string>, curr) => {
        acc[curr.verse_id] = curr.original_text;
        return acc;
      }, {});
    },
    enabled: selectedVerses.length > 0 && showOriginal,
  });

  return (
    <div className="space-y-2">
      {verses?.map((verse) => (
        <div key={verse.id} className="flex flex-col gap-2">
          <div className="flex-1 rounded">
            <BibleVerseActions
              verseId={verse.id}
              text={`${verse.verse_number} ${verse.text}`}
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={onVerseSelect}
            />
          </div>
          {showOriginal && selectedVerses.includes(verse.id) && (
            <div 
              className="pl-6 text-right font-hebrew text-lg animate-accordion-down overflow-hidden"
              style={{ direction: 'rtl' }}
            >
              {originals?.[verse.id] || (
                <span className="text-muted-foreground text-sm italic" style={{ direction: 'ltr' }}>
                  Texto original não disponível
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};