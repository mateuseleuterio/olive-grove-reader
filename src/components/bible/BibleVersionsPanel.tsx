import React from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import BibleVersionPanel from "./BibleVersionPanel";

interface BibleVersionsPanelProps {
  versions: Array<{ id: string; name: string }>;
  onVersionChange: (index: number, newVersion: string) => void;
  onRemove: (index: number) => void;
  selectedBook: number;
  chapter: string;
  versions_dict: Record<string, string>;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  hasNextChapter: boolean;
  hasPreviousChapter: boolean;
  isMobile: boolean;
}

const BibleVersionsPanel = ({
  versions,
  onVersionChange,
  onRemove,
  selectedBook,
  chapter,
  versions_dict,
  onNextChapter,
  onPreviousChapter,
  hasNextChapter,
  hasPreviousChapter,
  isMobile,
}: BibleVersionsPanelProps) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {versions.map((version, index) => (
          <div key={`mobile-version-${version.id}-${index}`} className="border rounded-lg bg-white">
            <BibleVersionPanel
              version={version}
              onVersionChange={(newVersion) => onVersionChange(index, newVersion)}
              onRemove={() => onRemove(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
              versions={versions_dict}
              onNextChapter={onNextChapter}
              onPreviousChapter={onPreviousChapter}
              hasNextChapter={hasNextChapter}
              hasPreviousChapter={hasPreviousChapter}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="min-h-[400px] w-full rounded-lg border"
    >
      {versions.map((version, index) => (
        <React.Fragment key={`panel-${version.id}-${index}`}>
          <ResizablePanel defaultSize={100 / versions.length}>
            <BibleVersionPanel
              version={version}
              onVersionChange={(newVersion) => onVersionChange(index, newVersion)}
              onRemove={() => onRemove(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
              versions={versions_dict}
              onNextChapter={onNextChapter}
              onPreviousChapter={onPreviousChapter}
              hasNextChapter={hasNextChapter}
              hasPreviousChapter={hasPreviousChapter}
            />
          </ResizablePanel>
          {index < versions.length - 1 && (
            <ResizableHandle withHandle />
          )}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
};

export default BibleVersionsPanel;