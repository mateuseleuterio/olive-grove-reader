import type { Json } from "@/integrations/supabase/types";

export interface SermonType {
  id: string;
  title: string;
  bible_text?: string | null;
  introduction?: string | null;
  points?: Array<{
    title: string;
    content: string;
    illustrations: Array<{
      content: string;
      type: string;
    }>;
  }> | null;
  conclusion?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_id: string;
}

export type SermonInput = Pick<SermonType, 'title' | 'user_id'> & Partial<Omit<SermonType, 'title' | 'user_id' | 'id'>>;