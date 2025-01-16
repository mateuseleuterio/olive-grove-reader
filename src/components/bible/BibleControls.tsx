import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Book, StickyNote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BibleControlsProps {
  books: { id: number; name: string }[];
  selectedBook: number;
  chapter: string;
  maxChapters: number;
  onBookChange: (bookId: number) => void;
  onChapterChange: (chapter: string) => void;
  onAddVersion: () => void;
  onCommentaryOpen: () => void;
  onNotesOpen: () => void;
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
  onNotesOpen,
  versionsCount,
}: BibleControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <Select
        value={selectedBook.toString()}
        onValueChange={(value) => onBookChange(parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o livro" />
        </SelectTrigger>
        <SelectContent>
          {books.map((book) => (
            <SelectItem key={book.id} value={book.id.toString()}>
              {book.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={chapter}
        onValueChange={onChapterChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Capítulo" />
        </SelectTrigger>
        <SelectContent>
          {[...Array(maxChapters)].map((_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString()}>
              Capítulo {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onAddVersion}
                disabled={versionsCount >= 3}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar versão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onCommentaryOpen}
              >
                <Book className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir comentário</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onNotesOpen}
              >
                <StickyNote className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Minhas anotações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default BibleControls;