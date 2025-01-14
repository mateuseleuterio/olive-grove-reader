export interface SermonPoint {
  title: string;
  content: string;
  illustrations: Illustration[];
}

export interface Illustration {
  content: string;
  type: "text" | "image";
}

export interface SermonType {
  id?: string;
  user_id?: string | null;
  title: string;
  bible_text?: string;
  introduction?: string;
  points: SermonPoint[];
  conclusion?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type SermonInput = Omit<SermonType, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Tipo auxiliar para conversão entre SermonPoint e Json
export type SermonPointJson = {
  title: string;
  content: string;
  illustrations: Array<{
    content: string;
    type: string;
  }>;
};