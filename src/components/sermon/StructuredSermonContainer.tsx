import { useState } from "react";
import StructuredSermonForm from "./StructuredSermonForm";
import { useSermonManagement } from "@/hooks/useSermonManagement";
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

  const onSave = async () => {
    await handleSaveSermon({
      title,
      introduction,
      points,
      conclusion,
      user_id: '00000000-0000-0000-0000-000000000000'
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