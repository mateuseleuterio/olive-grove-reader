import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput } from "@/types/sermon";

export const saveSermon = async (
  sermonData: SermonInput,
  isValidUUID: boolean,
  id?: string
) => {
  console.log('Saving sermon with data:', sermonData);

  const dataToSave = {
    title: sermonData.title,
    bible_text: sermonData.bible_text,
    introduction: sermonData.introduction,
    points: sermonData.points as any, // Necessário para compatibilidade com o tipo Json do Supabase
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

    if (error) {
      console.error('Error updating sermon:', error);
      throw error;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("sermons")
      .insert(dataToSave)
      .select()
      .single();

    if (error) {
      console.error('Error inserting sermon:', error);
      throw error;
    }
    return data;
  }
};