import { BibleVerseActions } from "./BibleVerseActions";
import WordDetails from "../WordDetails";

interface Verse {
  id: number;
  verse_number: number;
  text: string;
}

interface BibleVerseListProps {
  verses: Verse[];
  selectedVerses: number[];
  onVerseSelect: (verseId: number) => void;
  bookName?: string;
  chapter?: string;
}

export const BibleVerseList = ({ 
  verses, 
  selectedVerses, 
  onVerseSelect,
  bookName = "",
  chapter = ""
}: BibleVerseListProps) => {
  const renderText = (text: string, verseNumber: number) => {
    const words = text.split(' ');
    return words.map((word, index) => (
      <WordDetails
        key={`${verseNumber}-${index}`}
        word={word}
        book={bookName}
        chapter={chapter}
        verse={verseNumber.toString()}
      />
    ));
  };

  return (
    <div className="space-y-4 px-2">
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start gap-2">
          <div className="flex-1 hover:bg-bible-gray/50 rounded transition-colors">
            <BibleVerseActions
              verseId={verse.id}
              text={
                <div className="flex items-start gap-2">
                  <span className="text-xs text-bible-verse/60 font-medium mt-1.5">
                    {verse.verse_number}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-x-1">
                    {renderText(verse.text, verse.verse_number)}
                  </div>
                </div>
              }
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={onVerseSelect}
            />
          </div>
        </div>
      ))}
    </div>
  );
};