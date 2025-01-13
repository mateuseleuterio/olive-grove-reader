import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BlankSermonFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

const BlankSermonForm = ({
  title,
  content,
  onTitleChange,
  onContentChange,
}: BlankSermonFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Input
          placeholder="Título do sermão"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div>
        <Textarea
          placeholder="Conteúdo do sermão"
          className="min-h-[400px]"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BlankSermonForm;