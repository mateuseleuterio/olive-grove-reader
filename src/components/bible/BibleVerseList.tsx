import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import WordDetails from "../WordDetails";

interface BibleVerseListProps {
  verses: Array<{
    id: number;
    verse_number: number;
    text: string;
  }>;
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
  const processText = (text: string, verseNumber: number) => {
    return text.split(/\s+/).map((word, index) => (
      <WordDetails
        key={`${verseNumber}-${index}`}
        word={word}
        book={bookName || ""}
        chapter={chapter}
        verse={verseNumber.toString()}
        version={version}
      />
    ));
  };

  return (
    <div className="space-y-2">
      {verses.map((verse) => (
        <div
          key={verse.id}
          className={`p-2 rounded cursor-pointer ${
            selectedVerses.includes(verse.id) ? "bg-bible-highlight" : ""
          }`}
          onClick={() => onVerseSelect(verse.id)}
          data-verse={verse.verse_number}
        >
          <span className="text-bible-navy font-semibold mr-2">
            {verse.verse_number}
          </span>
          <span className="text-bible-text">
            {processText(verse.text, verse.verse_number)}
          </span>
        </div>
      ))}
    </div>
  );
};