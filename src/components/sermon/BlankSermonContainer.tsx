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
  const { handleSaveSermon, isLoading } = useSermonManagement();
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

    try {
      const sermonId = await handleSaveSermon({
        title,
        bible_text: content,
        points: [],
        user_id: user.id,
        introduction: "",
        conclusion: ""
      });
      
      if (sermonId) {
        navigate(`/preaching-mode/${sermonId}`);
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
    }
  };

  return (
    <BlankSermonForm
      title={title}
      content={content}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onSave={onSave}
      isLoading={isLoading}
    />
  );
};

export default BlankSermonContainer;