import { useState } from "react";
import BlankSermonForm from "./BlankSermonForm";
import { useSermonManagement } from "@/hooks/useSermonManagement";

interface BlankSermonContainerProps {
  initialTitle?: string;
  initialContent?: string;
  id?: string;
}

const BlankSermonContainer = ({ initialTitle = "", initialContent = "", id }: BlankSermonContainerProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const { handleSaveSermon, isLoading } = useSermonManagement(id);

  const onSave = async () => {
    await handleSaveSermon({
      title,
      bible_text: content,
    });
  };

  return (
    <BlankSermonForm
      title={title}
      content={content}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onSave={onSave}
    />
  );
};

export default BlankSermonContainer;