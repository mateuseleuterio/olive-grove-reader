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
}

export const BibleVerseList = ({ verses, selectedVerses, onVerseSelect }: BibleVerseListProps) => {
  return (
    <div className="space-y-4">
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start gap-2">
          <div className="flex-1 rounded p-1">
            <BibleVerseActions
              verseId={verse.id}
              text={`${verse.verse_number} ${verse.text}`}
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={onVerseSelect}
            />
          </div>
        </div>
      ))}
    </div>
  );
};