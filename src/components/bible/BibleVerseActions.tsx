import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageSquare, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BibleVerseActionsProps {
  verseId: number;
  verseNumber: number;
  text: string;
  onNoteClick?: () => void;
}

export const BibleVerseActions = ({ verseId, verseNumber, text, onNoteClick }: BibleVerseActionsProps) => {
  const { toast } = useToast();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({ x: 0, y: 0 });
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);

  const handleSaveNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar notas.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('bible_verse_notes')
        .insert({
          verse_id: verseId,
          note_text: noteText,
          user_id: user.id
        });

      if (error) throw error;

      setIsNoteOpen(false);
      setNoteText("");
      
      toast({
        title: "Nota salva",
        description: `Nota adicionada ao versículo ${verseNumber}.`,
      });
      
      if (onNoteClick) {
        onNoteClick();
      }
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a nota.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        text: `${text} (Versículo ${verseNumber})`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      navigator.clipboard.writeText(`${text} (Versículo ${verseNumber})`);
      toast({
        title: "Texto copiado",
        description: "O versículo foi copiado para a área de transferência.",
      });
    }
    setIsSelectionMenuOpen(false);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionMenuPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
      setIsSelectionMenuOpen(true);
    } else {
      setIsSelectionMenuOpen(false);
    }
  };

  return (
    <div 
      className="relative cursor-text select-text" 
      onMouseUp={handleTextSelection}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="cursor-text">
        {text}
      </div>

      {isSelectionMenuOpen && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]"
          style={{
            left: `${selectionMenuPosition.x}px`,
            top: `${selectionMenuPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsNoteOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Nota
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Popover open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Adicionar nota ao versículo {verseNumber}</h4>
            <Textarea
              placeholder="Digite sua nota..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNoteOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveNote}>
                Salvar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};