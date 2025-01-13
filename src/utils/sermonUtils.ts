import { supabase } from "@/integrations/supabase/client";
import type { SermonType } from "@/types/sermon";

export const saveSermon = async (
  sermonData: Partial<SermonType>,
  isValidUUID: boolean,
  id?: string
) => {
  if (isValidUUID && id) {
    const { data, error } = await supabase
      .from("sermons")
      .update(sermonData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("sermons")
      .insert(sermonData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};