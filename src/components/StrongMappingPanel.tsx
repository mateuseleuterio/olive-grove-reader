import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StrongSuggestion } from "@/types/strong";

interface Suggestion {
  word: string;
  strongNumber: string;
  confidence: number;
}

export default function StrongMappingPanel() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const { toast } = useToast();

  const getUnmappedWord = async () => {
    try {
      const { data: verses } = await supabase
        .from('bible_verses')
        .select('text')
        .eq('version', 'ARA')
        .limit(1);

      if (verses && verses[0]) {
        const words = verses[0].text.split(" ");
        const randomWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
        
        // Verificar se a palavra já está mapeada
        const { data: existing } = await supabase
          .from('bible_word_strongs_mapping')
          .select()
          .eq('word', randomWord)
          .maybeSingle();

        if (existing) {
          // Se já estiver mapeada, buscar outra palavra
          return getUnmappedWord();
        }

        setCurrentWord(randomWord);
        return randomWord;
      }
    } catch (error) {
      console.error('Erro ao buscar palavra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar uma nova palavra",
        variant: "destructive",
      });
    }
  };

  const getSuggestions = async (word: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('suggest-strong-mapping', {
        body: { word }
      });

      if (error) throw error;

      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter sugestões para esta palavra",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveMapping = async (strongNumber: string) => {
    try {
      const { error } = await supabase
        .from('bible_word_strongs_mapping')
        .insert({
          word: currentWord,
          strong_number: strongNumber
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mapeamento aprovado com sucesso",
      });

      // Limpar e buscar próxima palavra
      setSuggestions([]);
      await getUnmappedWord();
    } catch (error) {
      console.error('Erro ao aprovar mapeamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o mapeamento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => getUnmappedWord()}
          disabled={loading}
        >
          Buscar Palavra
        </Button>
        {currentWord && (
          <Button 
            onClick={() => getSuggestions(currentWord)}
            disabled={loading}
          >
            Analisar "{currentWord}"
          </Button>
        )}
      </div>

      {loading && <div>Analisando palavra...</div>}

      {suggestions.length > 0 && (
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{suggestion.strongNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Confiança: {(suggestion.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <Button
                  onClick={() => approveMapping(suggestion.strongNumber)}
                  variant="outline"
                >
                  Aprovar
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}