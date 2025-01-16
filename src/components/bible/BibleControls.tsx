import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Book, StickyNote, ArrowUp, ArrowDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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
  fontSize: number;
  onFontSizeChange: (size: number) => void;
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
  fontSize,
  onFontSizeChange,
}: BibleControlsProps) => {
  const { toast } = useToast();
  const MIN_FONT_SIZE = 14;
  const MAX_FONT_SIZE = 24;

  const handleIncreaseFontSize = () => {
    if (fontSize < MAX_FONT_SIZE) {
      onFontSizeChange(fontSize + 1);
      toast({
        description: "Tamanho da fonte aumentado",
      });
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > MIN_FONT_SIZE) {
      onFontSizeChange(fontSize - 1);
      toast({
        description: "Tamanho da fonte diminuído",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex gap-4 flex-1">
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

      <div className="flex gap-2 ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseFontSize}
                disabled={fontSize >= MAX_FONT_SIZE}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aumentar fonte</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseFontSize}
                disabled={fontSize <= MIN_FONT_SIZE}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Diminuir fonte</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default BibleControls;