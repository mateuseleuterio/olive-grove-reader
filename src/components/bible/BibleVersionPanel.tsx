import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BibleVerse from "../BibleVerse";

interface BibleVersionPanelProps {
  version: { id: string; name: string };
  onVersionChange: (newVersion: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  selectedBook: number;
  chapter: string;
  versions: Record<string, string>;
}

const BibleVersionPanel = ({
  version,
  onVersionChange,
  onRemove,
  canRemove,
  selectedBook,
  chapter,
  versions
}: BibleVersionPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <Select 
          value={version.id} 
          onValueChange={onVersionChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione a versão" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(versions).map(([id, name]) => (
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
      <div className="bible-text space-y-6 bg-white p-4 md:p-8 flex-1 overflow-y-auto">
        <BibleVerse 
          bookId={selectedBook}
          chapter={chapter}
          version={version.id}
        />
      </div>
    </div>
  );
};

export default BibleVersionPanel;