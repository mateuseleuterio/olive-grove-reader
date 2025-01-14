import React from "react";
import Timer from "@/components/Timer";

const PreachingToolbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-bible-gray/95 backdrop-blur-sm border-b border-bible-navy/10 z-50">
      <div className="max-w-4xl mx-auto px-6 py-2 flex justify-end">
        <Timer />
      </div>
    </div>
  );
};

export default PreachingToolbar;