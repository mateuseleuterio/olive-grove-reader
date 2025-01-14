import React, { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { BibleVersion } from "@/hooks/useBibleReader";
import BibleVersionPanel from "./BibleVersionPanel";

interface BibleLayoutProps {
  versions: Array<{ id: BibleVersion; name: string }>;
  selectedBook: number;
  chapter: string;
  onVersionChange: (index: number, newVersion: BibleVersion) => void;
  onRemoveVersion: (index: number) => void;
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  hasNextChapter: boolean;
  hasPreviousChapter: boolean;
}

const BibleLayout = ({
  versions,
  selectedBook,
  chapter,
  onVersionChange,
  onRemoveVersion,
  onNextChapter,
  onPreviousChapter,
  hasNextChapter,
  hasPreviousChapter,
}: BibleLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {versions.map((version, index) => (
          <div key={`mobile-version-${version.id}-${index}`} className="border rounded-lg bg-white">
            <BibleVersionPanel
              version={version}
              onVersionChange={(newVersion) => onVersionChange(index, newVersion as BibleVersion)}
              onRemove={() => onRemoveVersion(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
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
              onVersionChange={(newVersion) => onVersionChange(index, newVersion as BibleVersion)}
              onRemove={() => onRemoveVersion(index)}
              canRemove={versions.length > 1}
              selectedBook={selectedBook}
              chapter={chapter}
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

export default BibleLayout;