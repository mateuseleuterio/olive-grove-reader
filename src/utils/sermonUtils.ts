import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput } from "@/types/sermon";
import type { Json } from "@/integrations/supabase/types";

export const saveSermon = async (
  sermonData: SermonInput,
  isValidUUID: boolean,
  id?: string
) => {
  const dataToSave = {
    title: sermonData.title,
    bible_text: sermonData.bible_text,
    introduction: sermonData.introduction,
    points: sermonData.points as unknown as Json,
    conclusion: sermonData.conclusion,
    user_id: sermonData.user_id
  };

  if (isValidUUID && id) {
    const { data, error } = await supabase
      .from("sermons")
      .update(dataToSave)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("sermons")
      .insert([dataToSave])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};