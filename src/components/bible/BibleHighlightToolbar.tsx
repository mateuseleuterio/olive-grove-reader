import { Button } from "@/components/ui/button";
import { StickyNote, Share, Eye, X } from "lucide-react";

export const HIGHLIGHT_COLORS = {
  yellow: "bg-[#FFF3B0]",
  blue: "bg-[#C1E3FF]",
  red: "bg-[#FFD6DB]",
  purple: "bg-[#DED4FF]",
  green: "bg-[#E8FAD5]",
  orange: "bg-[#FFE4D3]",
};

interface BibleHighlightToolbarProps {
  selectedVerses: number[];
  hasHighlightedVerses: boolean;
  onRemoveHighlights: () => Promise<void>;
  onHighlight: (color: string) => Promise<void>;
  onClose: () => void;
}

export const BibleHighlightToolbar = ({
  selectedVerses,
  hasHighlightedVerses,
  onRemoveHighlights,
  onHighlight,
  onClose,
}: BibleHighlightToolbarProps) => {
  if (selectedVerses.length === 0) return null;

  const handleHighlight = async (color: string) => {
    await onHighlight(color);
    onClose(); // Close the toolbar after highlighting
  };

  const handleRemoveHighlights = async () => {
    await onRemoveHighlights();
    onClose(); // Close the toolbar after removing highlights
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg z-50 w-[95%] max-w-[360px] overflow-hidden">
      <div className="p-2.5 border-b flex items-center justify-between">
        {hasHighlightedVerses ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveHighlights}
            className="text-sm text-red-500 hover:text-red-700"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            <span>Remover destaque</span>
          </Button>
        ) : (
          <span className="text-sm font-medium text-gray-700">Destacar texto</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-2.5">
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-md ${className} hover:opacity-80 transition-opacity`}
              onClick={() => handleHighlight(color)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-sm flex items-center gap-1.5"
          >
            <StickyNote className="h-3.5 w-3.5" />
            <span>Anotar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-sm flex items-center gap-1.5"
          >
            <Share className="h-3.5 w-3.5" />
            <span>Compartilhar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-sm flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Original</span>
          </Button>
        </div>
      </div>
    </div>
  );
};