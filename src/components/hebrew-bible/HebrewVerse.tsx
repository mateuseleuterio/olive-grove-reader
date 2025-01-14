import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HebrewWordParsing {
  hebrew_word: string;
  transliteration: string | null;
  morphology: string | null;
  strong_number: string | null;
  lexeme: string | null;
  part_of_speech: string | null;
  person: string | null;
  gender: string | null;
  number: string | null;
  state: string | null;
  stem: string | null;
  tense: string | null;
}

interface HebrewVerseProps {
  verse: {
    id: number;
    verse_number: number;
    hebrew_text: string;
    transliteration: string | null;
    hebrew_word_parsing: HebrewWordParsing[];
  };
}

const HebrewVerse = ({ verse }: HebrewVerseProps) => {
  const [selectedWord, setSelectedWord] = useState<HebrewWordParsing | null>(null);

  const renderWordDetails = (word: HebrewWordParsing) => (
    <div className="space-y-2">
      <div className="text-lg font-bold">{word.hebrew_word}</div>
      {word.transliteration && (
        <div>
          <span className="font-semibold">Transliteração:</span> {word.transliteration}
        </div>
      )}
      {word.lexeme && (
        <div>
          <span className="font-semibold">Lexema:</span> {word.lexeme}
        </div>
      )}
      {word.strong_number && (
        <div>
          <span className="font-semibold">Strong:</span> {word.strong_number}
        </div>
      )}
      {word.part_of_speech && (
        <div>
          <span className="font-semibold">Classe:</span> {word.part_of_speech}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {word.person && (
          <div>
            <span className="font-semibold">Pessoa:</span> {word.person}
          </div>
        )}
        {word.gender && (
          <div>
            <span className="font-semibold">Gênero:</span> {word.gender}
          </div>
        )}
        {word.number && (
          <div>
            <span className="font-semibold">Número:</span> {word.number}
          </div>
        )}
        {word.state && (
          <div>
            <span className="font-semibold">Estado:</span> {word.state}
          </div>
        )}
        {word.stem && (
          <div>
            <span className="font-semibold">Stem:</span> {word.stem}
          </div>
        )}
        {word.tense && (
          <div>
            <span className="font-semibold">Tempo:</span> {word.tense}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">{verse.verse_number}.</span>
      </div>
      
      <div className="space-y-4">
        <div className="text-right text-2xl leading-loose" style={{ fontFamily: 'Times New Roman' }}>
          {verse.hebrew_word_parsing.map((word, index) => (
            <HoverCard key={`${word.hebrew_word}-${index}`}>
              <HoverCardTrigger asChild>
                <span 
                  className="cursor-pointer hover:bg-bible-accent/10 px-1 py-0.5 rounded"
                  onClick={() => setSelectedWord(word)}
                >
                  {word.hebrew_word}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <ScrollArea className="h-[300px]">
                  {renderWordDetails(word)}
                </ScrollArea>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
        
        {verse.transliteration && (
          <div className="text-sm text-gray-600">
            {verse.transliteration}
          </div>
        )}
      </div>
    </div>
  );
};

export default HebrewVerse;