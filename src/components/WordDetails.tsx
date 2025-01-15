<lov-code>
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
        .eq('verse_number', verse)
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
        .eq('verse',