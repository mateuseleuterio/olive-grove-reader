import React from "react";
import Timer from "@/components/Timer";

const PreachingToolbar = () => {
  return (
    <div className="fixed top-20 right-6 bg-bible-gray/95 backdrop-blur-sm border border-bible-navy/10 rounded-lg shadow-md z-50 p-3">
      <Timer />
    </div>
  );
};

export default PreachingToolbar;