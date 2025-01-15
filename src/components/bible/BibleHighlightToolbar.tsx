import { Button } from "@/components/ui/button";
import { StickyNote, Share, Eye, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  if (selectedVerses.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg z-50 w-[95%] max-w-[600px] mx-auto">
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-3 w-3" />
          </Button>
          {hasHighlightedVerses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveHighlights}
              className="text-xs text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-3 w-3 mr-1" />
              <span>Remover destaque</span>
            </Button>
          )}
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} gap-2`}>
          {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
            <button
              key={color}
              className={`h-8 rounded-md ${className} hover:opacity-80 transition-opacity`}
              onClick={() => onHighlight(color)}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8 text-xs"
          >
            <StickyNote className="h-3 w-3" />
            <span>Anotar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8 text-xs"
          >
            <Share className="h-3 w-3" />
            <span>Compartilhar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8 text-xs"
          >
            <Eye className="h-3 w-3" />
            <span>Original</span>
          </Button>
        </div>
      </div>
    </div>
  );
};