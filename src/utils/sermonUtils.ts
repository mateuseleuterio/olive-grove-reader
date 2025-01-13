import { supabase } from "@/integrations/supabase/client";
import type { SermonType } from "@/types/sermon";
import { Database } from "@/integrations/supabase/types";

type SermonInsert = Database['public']['Tables']['sermons']['Insert'];

export const saveSermon = async (
  sermonData: Partial<SermonType>,
  isValidUUID: boolean,
  id?: string
) => {
  // Ensure required fields are present
  if (!sermonData.title) {
    throw new Error('Title is required');
  }

  // Convert SermonType to SermonInsert type
  const insertData: SermonInsert = {
    id: isValidUUID ? id : undefined,
    title: sermonData.title,
    user_id: sermonData.user_id,
    bible_text: sermonData.bible_text || null,
    introduction: sermonData.introduction || null,
    points: sermonData.points || null,
    conclusion: sermonData.conclusion || null,
  };

  if (isValidUUID && id) {
    const { data, error } = await supabase
      .from("sermons")
      .update(insertData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("sermons")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};