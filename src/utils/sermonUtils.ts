import { supabase } from "@/integrations/supabase/client";
import type { SermonType, SermonInput } from "@/types/sermon";

export const saveSermon = async (
  sermonData: SermonInput,
  isValidUUID: boolean,
  id?: string
) => {
  console.log('Saving sermon with data:', sermonData);

  if (isValidUUID && id) {
    const { data, error } = await supabase
      .from("sermons")
      .update({
        title: sermonData.title,
        bible_text: sermonData.bible_text,
        introduction: sermonData.introduction,
        points: sermonData.points,
        conclusion: sermonData.conclusion,
        user_id: sermonData.user_id
      })
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
      .insert({
        title: sermonData.title,
        bible_text: sermonData.bible_text,
        introduction: sermonData.introduction,
        points: sermonData.points,
        conclusion: sermonData.conclusion,
        user_id: sermonData.user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting sermon:', error);
      throw error;
    }
    return data;
  }
};