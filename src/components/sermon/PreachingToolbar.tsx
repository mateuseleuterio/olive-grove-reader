import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Timer from "@/components/Timer";

interface PreachingToolbarProps {
  onEdit: () => void;
}

const PreachingToolbar: React.FC<PreachingToolbarProps> = ({ onEdit }) => {
  return (
    <div className="fixed top-16 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <Timer />
          <Button
            variant="ghost"
            onClick={onEdit}
            className="text-bible-navy hover:bg-bible-gray/10"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreachingToolbar;