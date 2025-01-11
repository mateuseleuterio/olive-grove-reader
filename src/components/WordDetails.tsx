import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WordDetailsProps {
  word: string;
  hebrew?: string;
  transliteration?: string;
  meaning?: string;
}

// This is a mock database of Hebrew words - in a real app, this would come from an API
const hebrewWords: Record<string, { hebrew: string; transliteration: string; meaning: string }> = {
  "princípio": {
    hebrew: "בְּרֵאשִׁית",
    transliteration: "bereshit",
    meaning: "no princípio, começo, início"
  },
  "criou": {
    hebrew: "בָּרָא",
    transliteration: "bara",
    meaning: "criar, formar, dar existência"
  },
  "Deus": {
    hebrew: "אֱלֹהִים",
    transliteration: "Elohim",
    meaning: "Deus, divindade, ser divino"
  },
  "céus": {
    hebrew: "שָׁמַיִם",
    transliteration: "shamayim",
    meaning: "céus, firmamento, região celestial"
  },
  "terra": {
    hebrew: "אֶרֶץ",
    transliteration: "erets",
    meaning: "terra, mundo, solo, território"
  }
};

const WordDetails = ({ word }: WordDetailsProps) => {
  const details = hebrewWords[word.toLowerCase()];
  
  if (!details) {
    return <span>{word} </span>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-bible-navy hover:underline">
          {word}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-bible-navy">{details.hebrew}</p>
          <p className="text-sm text-gray-500 italic">{details.transliteration}</p>
          <p className="text-sm text-gray-700">{details.meaning}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default WordDetails;