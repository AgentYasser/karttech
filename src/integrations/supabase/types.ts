export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          category: string
          content_type: string
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          early_access_until: string | null
          estimated_reading_time: number | null
          gutenberg_id: number | null
          id: string
          is_featured: boolean | null
          points_cost: number | null
          requires_points: boolean | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          author: string
          category: string
          content_type: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          early_access_until?: string | null
          estimated_reading_time?: number | null
          gutenberg_id?: number | null
          id?: string
          is_featured?: boolean | null
          points_cost?: number | null
          requires_points?: boolean | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          author?: string
          category?: string
          content_type?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          early_access_until?: string | null
          estimated_reading_time?: number | null
          gutenberg_id?: number | null
          id?: string
          is_featured?: boolean | null
          points_cost?: number | null
          requires_points?: boolean | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          book_id: string
          chapter_number: number
          content: string
          created_at: string | null
          id: string
          title: string | null
          word_count: number | null
        }
        Insert: {
          book_id: string
          chapter_number: number
          content: string
          created_at?: string | null
          id?: string
          title?: string | null
          word_count?: number | null
        }
        Update: {
          book_id?: string
          chapter_number?: number
          content?: string
          created_at?: string | null
          id?: string
          title?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          discussion_id: string
          id: string
          message_type: string
          parent_message_id: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          discussion_id: string
          id?: string
          message_type?: string
          parent_message_id?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          discussion_id?: string
          id?: string
          message_type?: string
          parent_message_id?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_messages_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "discussion_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_point_awards: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          points: number
          reason: string | null
          room_id: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          points: number
          reason?: string | null
          room_id: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          points?: number
          reason?: string | null
          room_id?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_point_awards_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_point_awards_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "discussion_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_point_awards_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_room_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "discussion_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_room_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_room_participants: {
        Row: {
          id: string
          is_muted: boolean | null
          is_speaking: boolean | null
          joined_at: string
          left_at: string | null
          role: Database["public"]["Enums"]["room_role"]
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          is_speaking?: boolean | null
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["room_role"]
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          is_speaking?: boolean | null
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["room_role"]
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "discussion_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_rooms: {
        Row: {
          book_id: string | null
          created_at: string
          created_by: string
          description: string | null
          ended_at: string | null
          group_id: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          title: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ended_at?: string | null
          group_id?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ended_at?: string | null
          group_id?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_rooms_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_rooms_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "reading_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          book_id: string
          chapter_id: string | null
          content: string
          created_at: string | null
          discussion_type: string
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          content: string
          created_at?: string | null
          discussion_type: string
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          content?: string
          created_at?: string | null
          discussion_type?: string
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "reading_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points: number
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          books_completed: number | null
          chapters_read: number | null
          created_at: string | null
          email: string
          id: string
          last_active_at: string | null
          level: string | null
          points: number | null
          reading_streak: number | null
          subscription_tier: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          books_completed?: number | null
          chapters_read?: number | null
          created_at?: string | null
          email: string
          id: string
          last_active_at?: string | null
          level?: string | null
          points?: number | null
          reading_streak?: number | null
          subscription_tier?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          books_completed?: number | null
          chapters_read?: number | null
          created_at?: string | null
          email?: string
          id?: string
          last_active_at?: string | null
          level?: string | null
          points?: number | null
          reading_streak?: number | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      reading_groups: {
        Row: {
          book_id: string | null
          created_at: string | null
          created_by: string
          current_chapter: number | null
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          name: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          created_by: string
          current_chapter?: number | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          created_by?: string
          current_chapter?: number | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_groups_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          book_id: string
          completed_at: string | null
          created_at: string | null
          current_chapter: number | null
          current_position: number | null
          id: string
          is_completed: boolean | null
          last_read_at: string | null
          reading_time_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          completed_at?: string | null
          created_at?: string | null
          current_chapter?: number | null
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          reading_time_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_chapter?: number | null
          current_position?: number | null
          id?: string
          is_completed?: boolean | null
          last_read_at?: string | null
          reading_time_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vocabulary: {
        Row: {
          book_id: string | null
          definition: string | null
          id: string
          learned_at: string | null
          mastery_level: number | null
          user_id: string
          word: string
        }
        Insert: {
          book_id?: string | null
          definition?: string | null
          id?: string
          learned_at?: string | null
          mastery_level?: number | null
          user_id: string
          word: string
        }
        Update: {
          book_id?: string | null
          definition?: string | null
          id?: string
          learned_at?: string | null
          mastery_level?: number | null
          user_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vocabulary_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vocabulary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      room_role: "creator" | "moderator" | "member"
      room_status: "scheduled" | "live" | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      room_role: ["creator", "moderator", "member"],
      room_status: ["scheduled", "live", "ended"],
    },
  },
} as const
