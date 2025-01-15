interface BibleVerseActionsProps {
  verseId: number;
  text: string;
  isSelected: boolean;
  onSelect: (verseId: number) => void;
  onOriginalTextToggle: () => void;
  showOriginalText: boolean;
}

export const BibleVerseActions = ({ 
  verseId, 
  text, 
  isSelected,
  onSelect,
  onOriginalTextToggle,
  showOriginalText,
}: BibleVerseActionsProps) => {
  const handleVerseClick = () => {
    onSelect(verseId);
  };

  return (
    <div 
      onClick={handleVerseClick}
      className={`cursor-pointer rounded p-2 transition-colors ${
        isSelected ? 'bg-gray-100' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <span>{text}</span>
      </div>
    </div>
  );
};