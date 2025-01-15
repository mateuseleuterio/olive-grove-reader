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
    <div className="space-y-1.5">
      {verses?.map((verse) => (
        <div key={verse.id} className="flex items-start">
          <div className="flex-1 hover:bg-bible-gray/50 rounded transition-colors">
            <BibleVerseActions
              verseId={verse.id}
              text={verse.text}
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={onVerseSelect}
            >
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] opacity-40 font-medium mt-1">
                  {verse.verse_number}
                </span>
                <div className="flex-1 flex flex-wrap gap-x-1">
                  {renderText(verse.text, verse.verse_number)}
                </div>
              </div>
            </BibleVerseActions>
          </div>
        </div>
      ))}
    </div>
  );
};