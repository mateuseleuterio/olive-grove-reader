import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Highlighter, MessageSquare, Share } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BibleVerseActionsProps {
  verseId: number;
  verseNumber: number;
  text: string;
  onNoteClick?: () => void;
}

const HIGHLIGHT_COLORS = {
  yellow: {
    label: "Amarelo",
    class: "bg-yellow-200 hover:bg-yellow-300",
    border: "border-yellow-400"
  },
  red: {
    label: "Vermelho",
    class: "bg-red-200 hover:bg-red-300",
    border: "border-red-400"
  },
  blue: {
    label: "Azul",
    class: "bg-blue-200 hover:bg-blue-300",
    border: "border-blue-400"
  },
  green: {
    label: "Verde",
    class: "bg-green-200 hover:bg-green-300",
    border: "border-green-400"
  },
  purple: {
    label: "Roxo",
    class: "bg-purple-200 hover:bg-purple-300",
    border: "border-purple-400"
  }
};

export const BibleVerseActions = ({ verseId, verseNumber, text, onNoteClick }: BibleVerseActionsProps) => {
  const { toast } = useToast();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectionMenuPosition, setSelectionMenuPosition] = useState({ x: 0, y: 0 });
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);

  const handleHighlight = async (color: keyof typeof HIGHLIGHT_COLORS) => {
    try {
      const { error } = await supabase
        .from('bible_verse_highlights')
        .insert({
          verse_id: verseId,
          highlight_color: color,
        });

      if (error) throw error;

      toast({
        title: "Versículo destacado",
        description: `Versículo ${verseNumber} destacado em ${HIGHLIGHT_COLORS[color].label.toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Erro ao destacar versículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível destacar o versículo.",
        variant: "destructive",
      });
    }
    setIsSelectionMenuOpen(false);
  };

  const handleSaveNote = async () => {
    try {
      const { error } = await supabase
        .from('bible_verse_notes')
        .insert({
          verse_id: verseId,
          note_text: noteText,
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

  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionMenuPosition({
        x: e.clientX,
        y: rect.top - 10
      });
      setIsSelectionMenuOpen(true);
      e.preventDefault();
    } else {
      setIsSelectionMenuOpen(false);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger 
          className="flex-1 cursor-text select-text" 
          onMouseUp={handleTextSelection}
        >
          <div className="cursor-text">
            {text}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => handleShare()}
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            Compartilhar
          </ContextMenuItem>
          
          <ContextMenuSeparator />
          
          <Popover>
            <PopoverTrigger asChild>
              <ContextMenuItem
                className="gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <Highlighter className="h-4 w-4" />
                Destacar
              </ContextMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(HIGHLIGHT_COLORS).map(([color, { label, class: className, border }]) => (
                  <Button
                    key={color}
                    variant="outline"
                    className={`h-8 w-full ${className} ${border} transition-colors`}
                    onClick={() => handleHighlight(color as keyof typeof HIGHLIGHT_COLORS)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ContextMenuItem
            onClick={() => setIsNoteOpen(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Adicionar nota
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Menu de seleção flutuante */}
      {isSelectionMenuOpen && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]"
          style={{
            left: `${selectionMenuPosition.x}px`,
            top: `${selectionMenuPosition.y}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(HIGHLIGHT_COLORS).map(([color, { label, class: className, border }]) => (
                <Button
                  key={color}
                  variant="outline"
                  className={`h-8 w-full ${className} ${border} transition-colors`}
                  onClick={() => handleHighlight(color as keyof typeof HIGHLIGHT_COLORS)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-2 border-t pt-2">
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
    </>
  );
};