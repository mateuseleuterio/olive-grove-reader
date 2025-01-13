import { Database } from "@/integrations/supabase/types";

export type SermonType = Database['public']['Tables']['sermons']['Row'] & {
  points?: Array<{
    title: string;
    content: string;
    illustrations: Array<{
      content: string;
      type: string;
    }>;
  }> | null;
};