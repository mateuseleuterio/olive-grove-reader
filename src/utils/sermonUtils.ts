import { supabase } from "@/integrations/supabase/client";
import type { SermonType } from "@/types/sermon";

type RequiredSermonFields = {
  title: string;
  user_id: string;
};

type OptionalSermonFields = Partial<Omit<SermonType, keyof RequiredSermonFields>>;
type SermonInput = RequiredSermonFields & OptionalSermonFields;

export const saveSermon = async (
  sermonData: SermonInput,
  isValidUUID: boolean,
  id?: string
) => {
  console.log('Saving sermon with data:', sermonData);

  if (isValidUUID && id) {
    const { data, error } = await supabase
      .from("sermons")
      .update(sermonData)
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
      .insert(sermonData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting sermon:', error);
      throw error;
    }
    return data;
  }
};