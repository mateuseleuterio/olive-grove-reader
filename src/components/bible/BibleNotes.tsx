import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import AuthModal from "@/components/Auth";

interface BibleNotesProps {
  bookId: number;
  chapter: string;
  selectedVerses: number[];
  onClose: () => void;
}

export const BibleNotes = ({ bookId, chapter, selectedVerses, onClose }: BibleNotesProps) => {
  const [noteText, setNoteText] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapterNotes, setChapterNotes] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();

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
      const { data: { session } } = await supabase.auth.getSession();
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
              bible_verses (
                verse_number,
                text
              )
            `)
            .in('verse_id', verseIdArray)
            .order('created_at', { ascending: false });

          setChapterNotes(notes || []);
        }
      }
    };

    fetchBookName();
    fetchChapterNotes();
  }, [bookId, chapter]);

  const handleSaveNote = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
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

      toast({
        title: "Sucesso",
        description: "Anotação salva com sucesso!",
      });

      setNoteText("");
      onClose();
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
    <div className="flex flex-col h-full bg-white p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Anotações</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {selectedVerses.length > 0 ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            {bookName} {chapter}
          </div>
          <Textarea
            placeholder="Digite sua anotação aqui..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSaveNote}>
            Salvar Anotação
          </Button>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {chapterNotes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">
                  Versículo {note.bible_verses.verse_number}
                </div>
                <div className="text-sm italic text-gray-700 mb-2">
                  {note.bible_verses.text}
                </div>
                <div className="text-sm">
                  {note.note_text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};