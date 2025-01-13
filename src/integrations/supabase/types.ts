export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bible_books: {
        Row: {
          abbreviation: string | null
          created_at: string
          id: number
          name: string
          position: number
          testament: string
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          id?: number
          name: string
          position: number
          testament: string
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          id?: number
          name?: string
          position?: number
          testament?: string
        }
        Relationships: []
      }
      bible_chapters: {
        Row: {
          book_id: number | null
          chapter_number: number
          created_at: string
          id: number
        }
        Insert: {
          book_id?: number | null
          chapter_number: number
          created_at?: string
          id?: number
        }
        Update: {
          book_id?: number | null
          chapter_number?: number
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_verses: {
        Row: {
          chapter_id: number | null
          created_at: string
          id: number
          text: string
          verse_number: number
          version: string
        }
        Insert: {
          chapter_id?: number | null
          created_at?: string
          id?: number
          text: string
          verse_number: number
          version: string
        }
        Update: {
          chapter_id?: number | null
          created_at?: string
          id?: number
          text?: string
          verse_number?: number
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_verses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "bible_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_questions: {
        Row: {
          correct_answer: string
          created_at: string
          daily_challenge_id: string | null
          group_challenge_id: string | null
          id: string
          question: string
          wrong_answers: string[]
        }
        Insert: {
          correct_answer: string
          created_at?: string
          daily_challenge_id?: string | null
          group_challenge_id?: string | null
          id?: string
          question: string
          wrong_answers: string[]
        }
        Update: {
          correct_answer?: string
          created_at?: string
          daily_challenge_id?: string | null
          group_challenge_id?: string | null
          id?: string
          question?: string
          wrong_answers?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "challenge_questions_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string
          date: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      group_challenges: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      historical_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          title: string
          year: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          year?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          year?: number | null
        }
        Relationships: []
      }
      mental_maps: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      reading_plan_entries: {
        Row: {
          book_id: number | null
          chapter_end: number
          chapter_start: number
          created_at: string
          day_number: number
          id: string
          plan_id: string | null
        }
        Insert: {
          book_id?: number | null
          chapter_end: number
          chapter_start: number
          created_at?: string
          day_number: number
          id?: string
          plan_id?: string | null
        }
        Update: {
          book_id?: number | null
          chapter_end?: number
          chapter_start?: number
          created_at?: string
          day_number?: number
          id?: string
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_plan_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_plan_entries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "reading_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_plans: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_days: number
          id: string
          is_public: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days: number
          id?: string
          is_public?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_public?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sermons: {
        Row: {
          bible_text: string | null
          conclusion: string | null
          created_at: string
          deleted_at: string | null
          id: string
          introduction: string | null
          points: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bible_text?: string | null
          conclusion?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          introduction?: string | null
          points?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bible_text?: string | null
          conclusion?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          introduction?: string | null
          points?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strongs_dictionary: {
        Row: {
          created_at: string
          hebrew_word: string
          id: number
          meaning: string
          portuguese_word: string
          strong_number: string
          transliteration: string
        }
        Insert: {
          created_at?: string
          hebrew_word: string
          id?: number
          meaning: string
          portuguese_word: string
          strong_number: string
          transliteration: string
        }
        Update: {
          created_at?: string
          hebrew_word?: string
          id?: number
          meaning?: string
          portuguese_word?: string
          strong_number?: string
          transliteration?: string
        }
        Relationships: []
      }
      user_reading_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          current_day: number
          id: string
          plan_id: string | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          current_day?: number
          id?: string
          plan_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          current_day?: number
          id?: string
          plan_id?: string | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "reading_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_scores: {
        Row: {
          completed_at: string
          daily_challenge_id: string | null
          group_challenge_id: string | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          daily_challenge_id?: string | null
          group_challenge_id?: string | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          daily_challenge_id?: string | null
          group_challenge_id?: string | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scores_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scores_group_challenge_id_fkey"
            columns: ["group_challenge_id"]
            isOneToOne: false
            referencedRelation: "group_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
