import type { Json } from "@/integrations/supabase/types";

export interface SermonPoint {
  title: string;
  content: string;
  illustrations: Array<{
    content: string;
    type: string;
  }>;
}

export interface SermonType {
  id: string;
  title: string;
  bible_text?: string | null;
  introduction?: string | null;
  points?: SermonPoint[] | null;
  conclusion?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_id: string;
}

export type SermonInput = Omit<SermonType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;