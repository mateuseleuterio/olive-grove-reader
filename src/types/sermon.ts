export interface SermonPoint {
  title: string;
  content: string;
  illustrations: string[];
}

export interface SermonType {
  id?: string;
  title: string;
  bible_text: string;
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}