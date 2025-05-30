import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: number;
  name: string;
}

interface BibleControlsProps {
  books: Book[];
  selectedBook: number;
  chapter: string;
  maxChapters: number;
  onBookChange: (bookId: number) => void;
  onChapterChange: (chapter: string) => void;
  onAddVersion: () => void;
  onCommentaryOpen: () => void;
  versionsCount: number;
}

const BibleControls = ({
  books,
  selectedBook,
  chapter,
  maxChapters,
  onBookChange,
  onChapterChange,
  onAddVersion,
  onCommentaryOpen,
  versionsCount
}: BibleControlsProps) => {
  const { toast } = useToast();
  const chapters = Array.from({ length: maxChapters }, (_, i) => (i + 1).toString());

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <Select 
          value={selectedBook.toString()} 
          onValueChange={(value) => onBookChange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o livro" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-72">
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id.toString()}>
                  {book.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Select value={chapter} onValueChange={onChapterChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-72">
              {chapters.map((c) => (
                <SelectItem key={c} value={c}>
                  Capítulo {c}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onAddVersion}
          disabled={versionsCount >= 4}
          className="relative"
          title="Adicionar versão"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCommentaryOpen}
          className="relative"
          title="Abrir comentários"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BibleControls;