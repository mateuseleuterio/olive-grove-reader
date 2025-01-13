export interface StrongEntry {
  id: number;
  strong_number: string;
  hebrew_word: string;
  transliteration: string;
  meaning: string;
  portuguese_word: string;
  created_at: string;
}

export interface StrongMapping {
  id: number;
  word: string;
  strong_number: string;
  created_at: string;
}