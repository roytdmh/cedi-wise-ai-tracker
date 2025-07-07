export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          created_at: string
          expenses: Json
          id: string
          income_amount: number
          income_currency: string
          income_frequency: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expenses?: Json
          id?: string
          income_amount?: number
          income_currency?: string
          income_frequency?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expenses?: Json
          id?: string
          income_amount?: number
          income_currency?: string
          income_frequency?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          budget_id: string | null
          context_data: Json | null
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_id?: string | null
          context_data?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_id?: string | null
          context_data?: Json | null
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rate_history: {
        Row: {
          base_currency: string
          change_percent: number | null
          created_at: string
          id: string
          rate: number
          target_currency: string
          timestamp: string
        }
        Insert: {
          base_currency: string
          change_percent?: number | null
          created_at?: string
          id?: string
          rate: number
          target_currency: string
          timestamp?: string
        }
        Update: {
          base_currency?: string
          change_percent?: number | null
          created_at?: string
          id?: string
          rate?: number
          target_currency?: string
          timestamp?: string
        }
        Relationships: []
      }
      financial_health_scores: {
        Row: {
          budget_id: string | null
          calculated_at: string
          created_at: string
          health_score: number
          id: string
          recommendations: string[] | null
          score_factors: Json
          user_id: string | null
        }
        Insert: {
          budget_id?: string | null
          calculated_at?: string
          created_at?: string
          health_score: number
          id?: string
          recommendations?: string[] | null
          score_factors?: Json
          user_id?: string | null
        }
        Update: {
          budget_id?: string | null
          calculated_at?: string
          created_at?: string
          health_score?: number
          id?: string
          recommendations?: string[] | null
          score_factors?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_health_scores_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string
          id: string
          items: Json
          order_type: Database["public"]["Enums"]["order_type"]
          payment_confirmed: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          rider_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total: number
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          id?: string
          items?: Json
          order_type: Database["public"]["Enums"]["order_type"]
          payment_confirmed?: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          rider_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total: number
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          id?: string
          items?: Json
          order_type?: Database["public"]["Enums"]["order_type"]
          payment_confirmed?: boolean | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          rider_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          category: string
          change_percent: number | null
          country: string
          created_at: string
          currency: string
          id: string
          item_name: string
          price: number
          price_type: string
          timestamp: string
          unit: string
        }
        Insert: {
          category: string
          change_percent?: number | null
          country: string
          created_at?: string
          currency: string
          id?: string
          item_name: string
          price: number
          price_type?: string
          timestamp?: string
          unit: string
        }
        Update: {
          category?: string
          change_percent?: number | null
          country?: string
          created_at?: string
          currency?: string
          id?: string
          item_name?: string
          price?: number
          price_type?: string
          timestamp?: string
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      order_status: "ordered" | "taken" | "completed"
      order_type: "pickup" | "delivery"
      payment_method: "cash" | "momo"
      user_role: "admin" | "waiter" | "rider"
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
      order_status: ["ordered", "taken", "completed"],
      order_type: ["pickup", "delivery"],
      payment_method: ["cash", "momo"],
      user_role: ["admin", "waiter", "rider"],
    },
  },
} as const
