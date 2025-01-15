import { useState, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

export const BibleVerseActions = ({ verseId, text, onNoteClick }: BibleVerseActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isOriginalTextOpen, setIsOriginalTextOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Check and set session on mount and auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch highlight for this verse with proper session handling
  const { data: highlight } = useQuery({
    queryKey: ['verse-highlight', verseId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('bible_verse_highlights')
        .select('*')
        .eq('verse_id', verseId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching highlight:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleSaveNote = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar notas.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bible_verse_notes')
        .insert({
          verse_id: verseId,
          note_text: noteText,
          user_id: session.user.id
        });

      if (error) throw error;

      setIsNoteOpen(false);
      setNoteText("");
      
      toast({
        title: "Nota salva",
        description: "Nota adicionada ao versículo.",
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
        text: text,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      navigator.clipboard.writeText(text);
      toast({
        title: "Texto copiado",
        description: "O versículo foi copiado para a área de transferência.",
      });
    }
  };

  const handleHighlight = async (color: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para destacar versículos.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (highlight) {
        // If same color, remove highlight
        if (highlight.color === color) {
          const { error } = await supabase
            .from('bible_verse_highlights')
            .delete()
            .eq('id', highlight.id);

          if (error) throw error;
        } else {
          // Update color
          const { error } = await supabase
            .from('bible_verse_highlights')
            .update({ color })
            .eq('id', highlight.id);

          if (error) throw error;
        }
      } else {
        // Create new highlight
        const { error } = await supabase
          .from('bible_verse_highlights')
          .insert({
            verse_id: verseId,
            color,
            user_id: session.user.id
          });

        if (error) throw error;
      }

      // Invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['verse-highlight', verseId] });
      setIsColorPickerOpen(false);
    } catch (error) {
      console.error('Erro ao destacar versículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível destacar o versículo.",
        variant: "destructive",
      });
    }
  };

  const handleVerseClick = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div 
      onClick={handleVerseClick}
      className={`cursor-pointer rounded p-2 transition-colors ${
        isSelected ? 'bg-gray-100' : ''
      } ${highlight ? HIGHLIGHT_COLORS[highlight.color as keyof typeof HIGHLIGHT_COLORS] : ''}`}
    >
      <div className="flex items-start gap-2">
        <span>{text}</span>
      </div>
      
      <Popover open={isSelected}>
        <PopoverTrigger asChild>
          <div className={`${isSelected ? 'block' : 'hidden'} mt-2`}>
            <div className="flex gap-1 justify-start">
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
          </div>
        </PopoverTrigger>
      </Popover>

      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nota ao versículo {verseNumber}</DialogTitle>
            <DialogDescription>
              Escreva sua nota para este versículo.
            </DialogDescription>
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
                onClick={() => handleHighlight(color)}
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