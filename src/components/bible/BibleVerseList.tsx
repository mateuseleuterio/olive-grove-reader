import { useEffect, useState } from "react";
import { BibleVerseActions } from "./BibleVerseActions";
import WordDetails from "../WordDetails";
import { supabase } from "@/integrations/supabase/client";

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

export const HIGHLIGHT_COLORS = {
  yellow: "bg-yellow-100",
  blue: "bg-blue-100",
  red: "bg-red-100",
  purple: "bg-purple-100",
  green: "bg-green-100",
  orange: "bg-orange-100",
} as const;

export const BibleVerseList = ({ 
  verses, 
  selectedVerses, 
  onVerseSelect,
  bookName = "",
  chapter = ""
}: BibleVerseListProps) => {
  const [highlights, setHighlights] = useState<Record<number, string>>({});
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    const getAnonymousId = async () => {
      try {
        const response = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const data = await response.text();
        const ipMatch = data.match(/ip=(.+)/);
        if (ipMatch && ipMatch[1]) {
          setAnonymousId(ipMatch[1]);
        }
      } catch (error) {
        console.error('Error getting anonymous ID:', error);
        setAnonymousId(crypto.randomUUID());
      }
    };

    getAnonymousId();
  }, []);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const verseIds = verses.map(v => v.id);
        const highlightMap: Record<number, string> = {};

        if (user) {
          // Fetch authenticated user highlights
          const { data: authHighlights } = await supabase
            .from('bible_verse_highlights')
            .select('verse_id, color')
            .eq('user_id', user.id)
            .in('verse_id', verseIds);

          if (authHighlights) {
            authHighlights.forEach(h => {
              highlightMap[h.verse_id] = h.color;
            });
          }
        } else if (anonymousId) {
          // Fetch anonymous user highlights
          const { data: anonHighlights } = await supabase
            .from('anonymous_bible_verse_highlights')
            .select('verse_id, color')
            .eq('anonymous_id', anonymousId)
            .in('verse_id', verseIds);

          if (anonHighlights) {
            anonHighlights.forEach(h => {
              highlightMap[h.verse_id] = h.color;
            });
          }
        }

        setHighlights(highlightMap);
      } catch (error) {
        console.error('Error fetching highlights:', error);
      }
    };

    if (verses.length > 0) {
      fetchHighlights();
    }
  }, [verses, anonymousId]);

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
        <div key={verse.id} className="flex items-start">
          <div className="flex-1 hover:bg-bible-gray/50 rounded transition-colors">
            <BibleVerseActions
              verseId={verse.id}
              text={verse.text}
              isSelected={selectedVerses.includes(verse.id)}
              onSelect={onVerseSelect}
            >
              <div 
                className={`flex items-start gap-3 rounded p-4 ${
                  highlights[verse.id] ? HIGHLIGHT_COLORS[highlights[verse.id] as keyof typeof HIGHLIGHT_COLORS] : ''
                }`}
              >
                <span className="verse-number text-[12px] opacity-50 font-medium mt-1 min-w-[1.5rem] text-right">
                  {verse.verse_number}
                </span>
                <div className="flex-1 flex flex-wrap gap-x-1.5 leading-relaxed">
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