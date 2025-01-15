import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BibleOriginalTextProps {
  verseId: number;
  isOpen: boolean;
  onClose: () => void;
}

const BibleOriginalText = ({ verseId, isOpen, onClose }: BibleOriginalTextProps) => {
  const { data: originalText, isLoading } = useQuery({
    queryKey: ['verse-original', verseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_verse_originals')
        .select('*')
        .eq('verse_id', verseId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching original text:', error);
        return null;
      }

      return data;
    },
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Texto Original</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : originalText ? (
            <div className="space-y-4">
              <div className="text-right text-xl font-hebrew leading-loose">
                {originalText.original_text}
              </div>
              <p className="text-sm text-muted-foreground">
                Idioma: {originalText.language === 'hebrew' ? 'Hebraico' : originalText.language}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Texto original não disponível para este versículo.
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BibleOriginalText;