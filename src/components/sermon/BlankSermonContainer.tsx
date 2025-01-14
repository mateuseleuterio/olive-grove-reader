import { useState, useEffect } from "react";
import BlankSermonForm from "./BlankSermonForm";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface BlankSermonContainerProps {
  initialTitle?: string;
  initialContent?: string;
  id?: string;
}

const BlankSermonContainer = ({ initialTitle = "", initialContent = "", id }: BlankSermonContainerProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const { handleSaveSermon } = useSermonManagement();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const onSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    await handleSaveSermon({
      title,
      bible_text: content,
      points: [],
      user_id: user.id
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