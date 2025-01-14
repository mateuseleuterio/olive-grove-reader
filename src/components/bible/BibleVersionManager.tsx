import React from "react";
import { BibleVersion, BIBLE_VERSIONS } from "@/hooks/useBibleData";
import BibleVersionPanel from "./BibleVersionPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface BibleVersionManagerProps {
  versions: BibleVersion[];
  onVersionChange: (index: number, newVersion: string) => void;
  onRemoveVersion: (index: number) => void;
  selectedBook: number;
  chapter: string;
  isMobile: boolean;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  hasNextChapter: boolean;
  hasPreviousChapter: boolean;
}

const BibleVersionManager: React.FC<BibleVersionManagerProps> = ({
  versions,
  onVersionChange,
  onRemoveVersion,
  selectedBook,
  chapter,
  isMobile,
  onNextChapter,
  onPreviousChapter,
  hasNextChapter,
  hasPreviousChapter
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {versions.map((version, index) => (
          <div key={`mobile-version-${version.id}-${index}`} className="border rounded-lg bg-white">
            <BibleVersionPanel
              version={version}
              onVersionChange={(newVersion) => onVersionChange(index, newVersion)}
              onRemove={() => onRemoveVersion(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
              versions={BIBLE_VERSIONS}
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
              onRemove={() => onRemoveVersion(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
              versions={BIBLE_VERSIONS}
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

export default BibleVersionManager;