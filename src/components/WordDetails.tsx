import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WordDetailsProps {
  word: string;
  book: string;
  chapter: string;
  verse: string;
  version: string;
}

interface WordGroup {
  id: string;
  words: string[];
  original_word: string;
  language: string;
  strong_number: string;
  transliteration: string;
  primary_meaning: string;
  secondary_meanings: string[];
}

const WordDetails = ({ word, book, chapter, verse, version }: WordDetailsProps) => {
  const [details, setDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wordGroup, setWordGroup] = useState<WordGroup | null>(null);
  const { toast } = useToast();

  const formatResponse = (text: string) => {
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const lines = formattedText.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      if (!line.trim()) return null;
      const isNumberedLine = /^\d+\s*-/.test(line);
      if (isNumberedLine) {
        const [number, ...rest] = line.split('-');
        return (
          <div key={index} className="mb-3">
            <span className="text-bible-navy font-semibold mr-2">{number.trim()}-</span>
            <span dangerouslySetInnerHTML={{ 
              __html: rest.join('-').trim() 
            }} className="text-bible-text" />
          </div>
        );
      }
      return (
        <p key={index} className="mb-2" dangerouslySetInnerHTML={{ 
          __html: line 
        }} />
      );
    });
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === '5e475092-3de0-47b8-8543-c62450e07bbd') {
      setIsAdmin(true);
    }
  };

  const saveToDatabase = async () => {
    if (!details) return;

    try {
      const { error } = await supabase
        .from('word_meanings')
        .insert({
          word,
          book,
          chapter,
          verse,
          meaning_details: details
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Significado salvo no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const getWordContext = () => {
    const verseElement = document.querySelector(`[data-verse="${verse}"]`);
    if (!verseElement) return { before: "", after: "" };

    const text = verseElement.textContent || "";
    const words = text.split(/\s+/);
    const wordIndex = words.findIndex(w => w === word);
    
    if (wordIndex === -1) return { before: "", after: "" };

    const beforeWords = words.slice(Math.max(0, wordIndex - 3), wordIndex);
    const afterWords = words.slice(wordIndex + 1, wordIndex + 4);

    return {
      before: beforeWords.join(" "),
      after: afterWords.join(" ")
    };
  };

  const fetchWordGroup = async (verseId: number) => {
    try {
      const { data, error } = await supabase
        .from('bible_word_groups')
        .select('*')
        .eq('verse_id', verseId)
        .filter('words', 'cs', `{${word}}`);

      if (error) throw error;
      if (data && data.length > 0) {
        setWordGroup(data[0]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao buscar grupo de palavras:', error);
      return false;
    }
  };

  const fetchWordDetails = async () => {
    try {
      setLoading(true);

      const { data: verseData, error: verseError } = await supabase
        .from('bible_verses')
        .select('id')
        .eq('verse_number', parseInt(verse))
        .single();

      if (verseError) throw verseError;

      const hasWordGroup = await fetchWordGroup(verseData.id);
      
      if (hasWordGroup) {
        setDetails(null);
        setLoading(false);
        return;
      }

      const { data: existingMeaning, error: searchError } = await supabase
        .from('word_meanings')
        .select('meaning_details')
        .eq('word', word)
        .eq('book', book)
        .eq('chapter', chapter)
        .eq('verse', verse)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existingMeaning) {
        setDetails(existingMeaning.meaning_details);
        setLoading(false);
        return;
      }

      const context = getWordContext();
      
      const response = await fetch('/api/analyze-verse-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          book,
          chapter,
          verse,
          context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch word details');
      }

      const data = await response.json();
      setDetails(data.meaning);
    } catch (error) {
      console.error('Error fetching word details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter os detalhes da palavra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 font-normal h-auto"
        >
          {word}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : wordGroup ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Palavra Original:</span>
              <span className="text-sm">{wordGroup.original_word}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Transliteração:</span>
              <span className="text-sm">{wordGroup.transliteration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Strong:</span>
              <span className="text-sm">{wordGroup.strong_number}</span>
            </div>
            <div>
              <span className="text-sm font-semibold block mb-1">Significado Principal:</span>
              <p className="text-sm">{wordGroup.primary_meaning}</p>
            </div>
            {wordGroup.secondary_meanings.length > 0 && (
              <div>
                <span className="text-sm font-semibold block mb-1">Significados Secundários:</span>
                <ul className="list-disc pl-4">
                  {wordGroup.secondary_meanings.map((meaning, index) => (
                    <li key={index} className="text-sm">{meaning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : details ? (
          <div className="space-y-4">
            <div>{formatResponse(details)}</div>
            {isAdmin && (
              <Button
                className="w-full mt-4"
                onClick={saveToDatabase}
              >
                Salvar no Banco de Dados
              </Button>
            )}
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={fetchWordDetails}
          >
            Analisar Palavra
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default WordDetails;