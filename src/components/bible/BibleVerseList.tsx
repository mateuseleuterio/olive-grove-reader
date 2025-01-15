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
    <div className="space-y-4">
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start gap-2">
          <div className="flex-1 rounded p-1">
            <BibleVerseActions
              verseId={verse.id}
              text={
                <div className="flex items-start">
                  <span className="text-[10px] opacity-40 font-medium mr-0.5 mt-1">
                    {verse.verse_number}
                  </span>
                  <div className="flex-1 flex flex-wrap">
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