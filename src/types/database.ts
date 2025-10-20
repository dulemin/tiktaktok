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
      games: {
        Row: {
          board_size: number
          board_state: Json
          created_at: string
          current_player: string
          game_code: string
          id: string
          player1_id: string
          player1_name: string
          player2_id: string | null
          player2_name: string | null
          status: string
          updated_at: string
          win_condition: number
          winner: string | null
        }
        Insert: {
          board_size?: number
          board_state?: Json
          created_at?: string
          current_player?: string
          game_code: string
          id?: string
          player1_id: string
          player1_name?: string
          player2_id?: string | null
          player2_name?: string | null
          status?: string
          updated_at?: string
          win_condition?: number
          winner?: string | null
        }
        Update: {
          board_size?: number
          board_state?: Json
          created_at?: string
          current_player?: string
          game_code?: string
          id?: string
          player1_id?: string
          player1_name?: string
          player2_id?: string | null
          player2_name?: string | null
          status?: string
          updated_at?: string
          win_condition?: number
          winner?: string | null
        }
        Relationships: []
      }
      match_history: {
        Row: {
          ai_difficulty: string | null
          board_size: number
          created_at: string | null
          duration_seconds: number | null
          final_score_opponent: number | null
          final_score_player: number | null
          id: string
          match_mode: string
          opponent_name: string
          opponent_type: string
          player_symbol: string
          result: string
          total_rounds: number | null
          user_id: string
          win_condition: number
        }
        Insert: {
          ai_difficulty?: string | null
          board_size: number
          created_at?: string | null
          duration_seconds?: number | null
          final_score_opponent?: number | null
          final_score_player?: number | null
          id?: string
          match_mode: string
          opponent_name: string
          opponent_type: string
          player_symbol: string
          result: string
          total_rounds?: number | null
          user_id: string
          win_condition: number
        }
        Update: {
          ai_difficulty?: string | null
          board_size?: number
          created_at?: string | null
          duration_seconds?: number | null
          final_score_opponent?: number | null
          final_score_player?: number | null
          id?: string
          match_mode?: string
          opponent_name?: string
          opponent_type?: string
          player_symbol?: string
          result?: string
          total_rounds?: number | null
          user_id?: string
          win_condition?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          ai_losses: number | null
          ai_wins: number | null
          created_at: string | null
          games_played: number | null
          id: string
          pvp_losses: number | null
          pvp_wins: number | null
          total_draws: number | null
          total_losses: number | null
          total_wins: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_losses?: number | null
          ai_wins?: number | null
          created_at?: string | null
          games_played?: number | null
          id?: string
          pvp_losses?: number | null
          pvp_wins?: number | null
          total_draws?: number | null
          total_losses?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_losses?: number | null
          ai_wins?: number | null
          created_at?: string | null
          games_played?: number | null
          id?: string
          pvp_losses?: number | null
          pvp_wins?: number | null
          total_draws?: number | null
          total_losses?: number | null
          total_wins?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
