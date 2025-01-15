import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import AuthModal from "@/components/Auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus } from "lucide-react";

interface BibleNotesProps {
  bookId: number;
  chapter: string;
  selectedVerses: number[];
  onClose: () => void;
}

interface Note {
  id: string;
  note_text: string;
  created_at: string;
  verse_id?: number;
  bible_verses?: {
    verse_number: number;
    text: string;
  };
}

export const BibleNotes = ({ bookId, chapter, selectedVerses, onClose }: BibleNotesProps) => {
  const [noteText, setNoteText] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapterNotes, setChapterNotes] = useState<Note[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookName = async () => {
      const { data } = await supabase
        .from('bible_books')
        .select('name')
        .eq('id', bookId)
        .single();
      
      if (data) {
        setBookName(data.name);
      }
    };

    const fetchChapterNotes = async () => {
      if (!session?.user) return;

      const { data: chapterData } = await supabase
        .from('bible_chapters')
        .select('id')
        .eq('book_id', bookId)
        .eq('chapter_number', parseInt(chapter))
        .single();

      if (chapterData) {
        const { data: verseIds } = await supabase
          .from('bible_verses')
          .select('id')
          .eq('chapter_id', chapterData.id);

        if (verseIds) {
          const verseIdArray = verseIds.map(v => v.id);
          const { data: notes } = await supabase
            .from('bible_verse_notes')
            .select(`
              id,
              note_text,
              verse_id,
              created_at,
              bible_verses (
                verse_number,
                text
              )
            `)
            .eq('user_id', session.user.id)
            .in('verse_id', verseIdArray)
            .order('created_at', { ascending: false });

          // Sort notes: verse-linked notes first, then notes without verses
          const sortedNotes = (notes || []).sort((a, b) => {
            if (a.verse_id && !b.verse_id) return -1;
            if (!a.verse_id && b.verse_id) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });

          setChapterNotes(sortedNotes);
        }
      }
    };

    fetchBookName();
    fetchChapterNotes();
  }, [bookId, chapter, session?.user]);

  const handleSaveNote = async () => {
    if (!session?.user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (selectedVerses.length > 0) {
        // Save notes for selected verses
        const promises = selectedVerses.map(verseId =>
          supabase
            .from('bible_verse_notes')
            .insert({
              verse_id: verseId,
              note_text: noteText,
              user_id: session.user.id,
            })
        );

        await Promise.all(promises);
      } else {
        // Save note without verse reference
        await supabase
          .from('bible_verse_notes')
          .insert({
            note_text: noteText,
            user_id: session.user.id,
          });
      }

      toast({
        title: "Sucesso",
        description: "Anotação salva com sucesso!",
      });

      setNoteText("");
      setIsAddingNote(false);
      
      // Refresh notes after saving
      const { data: chapterData } = await supabase
        .from('bible_chapters')
        .select('id')
        .eq('book_id', bookId)
        .eq('chapter_number', parseInt(chapter))
        .single();

      if (chapterData) {
        const { data: verseIds } = await supabase
          .from('bible_verses')
          .select('id')
          .eq('chapter_id', chapterData.id);

        if (verseIds) {
          const verseIdArray = verseIds.map(v => v.id);
          const { data: notes } = await supabase
            .from('bible_verse_notes')
            .select(`
              id,
              note_text,
              verse_id,
              created_at,
              bible_verses (
                verse_number,
                text
              )
            `)
            .eq('user_id', session.user.id)
            .in('verse_id', verseIdArray)
            .order('created_at', { ascending: false });

          setChapterNotes(notes || []);
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anotação.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[40vh] flex flex-col" onPointerDownOutside={onClose} onInteractOutside={onClose}>
        <SheetHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <SheetTitle>Anotações - {bookName} {chapter}</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden py-4">
          {!isAddingNote ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  onClick={() => setIsAddingNote(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Anotação
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {chapterNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                      draggable="true"
                    >
                      {note.bible_verses && (
                        <div className="text-sm text-gray-600 mb-2">
                          Versículo {note.bible_verses.verse_number}
                        </div>
                      )}
                      {note.bible_verses && (
                        <div className="text-sm italic text-gray-700 mb-2">
                          {note.bible_verses.text}
                        </div>
                      )}
                      <div className="text-sm">
                        {note.note_text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              <Textarea
                placeholder="Digite sua anotação aqui..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 min-h-0 resize-none"
              />
              <div className="flex justify-end gap-2 mt-auto">
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNote}>
                  Salvar Anotação
                </Button>
              </div>
            </div>
          )}
        </div>

        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
