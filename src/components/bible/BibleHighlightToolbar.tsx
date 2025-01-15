import { Button } from "@/components/ui/button";
import { StickyNote, Share, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50 min-w-[600px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          {hasHighlightedVerses && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveHighlights}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              <X className="h-3 w-3 mr-1" />
              <span>Remover destaque</span>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-6 gap-4">
          {Object.entries(HIGHLIGHT_COLORS).map(([color, className]) => (
            <button
              key={color}
              className={`h-12 rounded-md ${className} hover:opacity-80 transition-opacity`}
              onClick={() => onHighlight(color)}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <StickyNote className="h-4 w-4" />
            <span>Anotar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            <span>Compartilhar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            <span>Original</span>
          </Button>
        </div>
      </div>
    </div>
  );
};