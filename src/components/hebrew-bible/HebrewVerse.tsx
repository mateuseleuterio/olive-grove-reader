import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HebrewVerseProps {
  verse: {
    verse_number: number;
    hebrew_text: string;
    transliteration?: string;
    hebrew_word_parsing?: Array<{
      hebrew_word: string;
      transliteration?: string;
      morphology?: string;
      strong_number?: string;
    }>;
  };
}

const HebrewVerse = ({ verse }: HebrewVerseProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="verse-number">{verse.verse_number}</span>
        <div className="flex-1">
          <p className="text-right font-serif text-xl leading-loose" dir="rtl" lang="he">
            {verse.hebrew_text}
          </p>
          {verse.transliteration && (
            <p className="text-sm text-bible-verse mt-1">
              {verse.transliteration}
            </p>
          )}
        </div>
      </div>
      
      {verse.hebrew_word_parsing && verse.hebrew_word_parsing.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {verse.hebrew_word_parsing.map((word, index) => (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <button className="px-2 py-1 text-sm bg-bible-gray rounded hover:bg-gray-200 transition-colors">
                  {word.hebrew_word}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  {word.transliteration && (
                    <p><strong>Transliteração:</strong> {word.transliteration}</p>
                  )}
                  {word.morphology && (
                    <p><strong>Morfologia:</strong> {word.morphology}</p>
                  )}
                  {word.strong_number && (
                    <p><strong>Strong:</strong> {word.strong_number}</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      )}
    </div>
  );
};

export default HebrewVerse;