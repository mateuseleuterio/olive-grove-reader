import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg z-50 w-[95%] max-w-[600px] mx-auto">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {hasHighlightedVerses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveHighlights}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              <X className="h-3 w-3 mr-1" />
              <span>Remover</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
            <button
              key={color}
              className={`h-8 sm:h-10 rounded-md ${className} hover:opacity-80 transition-opacity`}
              onClick={() => onHighlight(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};