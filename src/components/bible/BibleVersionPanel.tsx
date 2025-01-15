import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BibleVerse from "../BibleVerse";
import { BibleVersion, BIBLE_VERSIONS } from "@/hooks/useBibleReader";

interface BibleVersionPanelProps {
  version: { id: BibleVersion; name: string };
  onVersionChange: (newVersion: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  selectedBook: number;
  chapter: string;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  hasNextChapter: boolean;
  hasPreviousChapter: boolean;
  onVerseSelect: (verses: number[]) => void;
  selectedVerses: number[];
}

const BibleVersionPanel = ({
  version,
  onVersionChange,
  onRemove,
  canRemove,
  selectedBook,
  chapter,
  onPreviousChapter,
  onNextChapter,
  hasNextChapter,
  hasPreviousChapter,
  onVerseSelect,
  selectedVerses,
}: BibleVersionPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Select 
            value={version.id} 
            onValueChange={onVersionChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione a versão" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BIBLE_VERSIONS).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousChapter}
            disabled={!hasPreviousChapter}
            title="Capítulo anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextChapter}
            disabled={!hasNextChapter}
            title="Próximo capítulo"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bible-text space-y-6 bg-white p-4 md:p-8 flex-1 overflow-y-auto">
        <BibleVerse 
          bookId={selectedBook}
          chapter={chapter}
          version={version.id}
          onVerseSelect={onVerseSelect}
          selectedVerses={selectedVerses}
        />
      </div>
      <div className="flex justify-center gap-4 py-4 bg-white border-t">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousChapter}
          disabled={!hasPreviousChapter}
          title="Capítulo anterior"
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextChapter}
          disabled={!hasNextChapter}
          title="Próximo capítulo"
          className="hover:bg-gray-100"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BibleVersionPanel;