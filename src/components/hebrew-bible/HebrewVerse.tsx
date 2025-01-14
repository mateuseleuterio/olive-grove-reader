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
      lexeme?: string;
      part_of_speech?: string;
      person?: string;
      gender?: string;
      number?: string;
      state?: string;
      stem?: string;
      tense?: string;
    }>;
  };
}

const HebrewVerse = ({ verse }: HebrewVerseProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="verse-number text-sm text-gray-500">{verse.verse_number}</span>
        <div className="flex-1">
          <p className="text-right font-serif text-2xl leading-loose" dir="rtl" lang="he">
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
        <div className="flex flex-wrap gap-2 mt-2 justify-end">
          {verse.hebrew_word_parsing.map((word, index) => (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <button className="px-2 py-1 text-lg bg-bible-gray rounded hover:bg-gray-200 transition-colors font-serif" dir="rtl" lang="he">
                  {word.hebrew_word}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  {word.transliteration && (
                    <p><strong>Transliteração:</strong> {word.transliteration}</p>
                  )}
                  {word.lexeme && (
                    <p><strong>Lexema:</strong> {word.lexeme}</p>
                  )}
                  {word.part_of_speech && (
                    <p><strong>Classe Gramatical:</strong> {word.part_of_speech}</p>
                  )}
                  {word.morphology && (
                    <p><strong>Morfologia:</strong> {word.morphology}</p>
                  )}
                  {word.person && (
                    <p><strong>Pessoa:</strong> {word.person}</p>
                  )}
                  {word.gender && (
                    <p><strong>Gênero:</strong> {word.gender}</p>
                  )}
                  {word.number && (
                    <p><strong>Número:</strong> {word.number}</p>
                  )}
                  {word.state && (
                    <p><strong>Estado:</strong> {word.state}</p>
                  )}
                  {word.stem && (
                    <p><strong>Raiz:</strong> {word.stem}</p>
                  )}
                  {word.tense && (
                    <p><strong>Tempo:</strong> {word.tense}</p>
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