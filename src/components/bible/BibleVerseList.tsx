import React from 'react';
import WordDetails from "@/components/WordDetails";

interface BibleVerseListProps {
  verses: {
    id: number;
    verse_number: number;
    text: string;
  }[];
  selectedVerses: number[];
  onVerseSelect: (verseId: number) => void;
  bookName?: string;
  chapter: string;
  version: string;
}

export const BibleVerseList = ({ 
  verses, 
  selectedVerses, 
  onVerseSelect, 
  bookName, 
  chapter,
  version 
}: BibleVerseListProps) => {
  const renderWord = (word: string, verseNumber: string) => {
    return (
      <WordDetails
        key={`${word}-${verseNumber}`}
        word={word}
        book={bookName || ""}
        chapter={chapter}
        verse={verseNumber}
        version={version}
      />
    );
  };

  return (
    <div className="space-y-4">
      {verses.map((verse) => {
        const isSelected = selectedVerses.includes(verse.verse_number);
        const words = verse.text.split(/\s+/);

        return (
          <div
            key={verse.id}
            className={`flex items-start space-x-2 p-2 rounded cursor-pointer ${
              isSelected ? "bg-bible-highlight" : ""
            }`}
            onClick={() => onVerseSelect(verse.verse_number)}
            data-verse={verse.verse_number}
          >
            <span className="text-bible-navy font-semibold min-w-[1.5rem]">
              {verse.verse_number}
            </span>
            <div className="flex-1 text-bible-text flex flex-wrap items-center">
              {words.map((word, index) => (
                <React.Fragment key={`${word}-${index}`}>
                  {renderWord(word, verse.verse_number.toString())}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};