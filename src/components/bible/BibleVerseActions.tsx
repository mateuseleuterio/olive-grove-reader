import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, Share, StickyNote, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BibleVerseActionsProps {
  verseId: number;
  verseNumber: number;
  text: string;
  onNoteClick?: () => void;
}

const HIGHLIGHT_COLORS = {
  yellow: "bg-[#FEF7CD]",
  green: "bg-[#F2FCE2]",
  blue: "bg-[#D3E4FD]",
  purple: "bg-[#E5DEFF]",
  pink: "bg-[#FFDEE2]",
  orange: "bg-[#FEC6A1]",
};

export const BibleVerseActions = ({ verseId, verseNumber, text, onNoteClick }: BibleVerseActionsProps) => {
  const { toast } = useToast();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isOriginalTextOpen, setIsOriginalTextOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

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
  };

  const handleVerseClick = () => {
    if (selectedVerses.includes(verseNumber)) {
      setSelectedVerses(selectedVerses.filter(v => v !== verseNumber));
    } else {
      setSelectedVerses([...selectedVerses, verseNumber]);
    }
  };

  return (
    <div className="group relative">
      <div 
        onClick={handleVerseClick}
        className={`cursor-pointer rounded p-1 transition-colors ${
          selectedVerses.includes(verseNumber) ? 'bg-gray-100' : ''
        }`}
      >
        <span className="verse-number font-semibold text-bible-verse min-w-[1.5rem]">
          {verseNumber}
        </span>
        <span className="ml-2">{text}</span>
      </div>

      {selectedVerses.includes(verseNumber) && (
        <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsColorPickerOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Palette className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsNoteOpen(true)}
            className="h-8 w-8 p-0"
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8 w-8 p-0"
          >
            <Share className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOriginalTextOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nota ao versículo {verseNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
        </DialogContent>
      </Dialog>

      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolha uma cor para destacar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
              <button
                key={color}
                className={`h-12 rounded-md ${className} hover:opacity-80 transition-opacity`}
                onClick={() => {
                  // Implementar lógica de destaque aqui
                  setIsColorPickerOpen(false);
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOriginalTextOpen} onOpenChange={setIsOriginalTextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Texto Original</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-lg font-semibold">Em desenvolvimento</p>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade estará disponível em breve.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};