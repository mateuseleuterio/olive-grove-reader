import { useState, useEffect } from "react";
import StructuredSermonForm from "./StructuredSermonForm";
import { useSermonManagement } from "@/hooks/useSermonManagement";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { SermonType } from "@/types/sermon";

interface StructuredSermonContainerProps {
  initialTitle?: string;
  initialIntroduction?: string;
  initialPoints?: NonNullable<SermonType['points']>;
  initialConclusion?: string;
  id?: string;
}

const StructuredSermonContainer = ({
  initialTitle = "",
  initialIntroduction = "",
  initialPoints = [{ title: "", content: "", illustrations: [] }],
  initialConclusion = "",
  id,
}: StructuredSermonContainerProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [introduction, setIntroduction] = useState(initialIntroduction);
  const [points, setPoints] = useState<NonNullable<SermonType['points']>>(initialPoints);
  const [conclusion, setConclusion] = useState(initialConclusion);
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
      introduction,
      points,
      conclusion,
      user_id: user.id
    });
  };

  return (
    <StructuredSermonForm
      title={title}
      introduction={introduction}
      points={points}
      conclusion={conclusion}
      onTitleChange={setTitle}
      onIntroductionChange={setIntroduction}
      onPointsChange={setPoints}
      onConclusionChange={setConclusion}
    />
  );
};

export default StructuredSermonContainer;