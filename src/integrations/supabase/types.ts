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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_tasks: {
        Row: {
          category: string | null
          completed: boolean | null
          created_at: string
          id: string
          scheduled_for: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          created_at?: string
          id?: string
          scheduled_for?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          food_items: Json
          id: string
          logged_at: string
          meal_type: string | null
          protein_g: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_items: Json
          id?: string
          logged_at?: string
          meal_type?: string | null
          protein_g?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_items?: Json
          id?: string
          logged_at?: string
          meal_type?: string | null
          protein_g?: number | null
          user_id?: string
        }
        Relationships: []
      }
      posture_assessments: {
        Row: {
          assessed_at: string
          assessment_type: string | null
          id: string
          issues: string[] | null
          recommendations: string[] | null
          score: number
          user_id: string
        }
        Insert: {
          assessed_at?: string
          assessment_type?: string | null
          id?: string
          issues?: string[] | null
          recommendations?: string[] | null
          score: number
          user_id: string
        }
        Update: {
          assessed_at?: string
          assessment_type?: string | null
          id?: string
          issues?: string[] | null
          recommendations?: string[] | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          avatar_url: string | null
          bmi: number | null
          bmr: number | null
          body_type: string | null
          created_at: string
          daily_calorie_goal: number | null
          dietary_restrictions: string[] | null
          eating_habits: string | null
          fitness_goals: string[] | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          injuries: string[] | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          posture_score: number | null
          sleep_hours: number | null
          stress_level: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
          work_schedule: string | null
          workout_experience: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          bmi?: number | null
          bmr?: number | null
          body_type?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          dietary_restrictions?: string[] | null
          eating_habits?: string | null
          fitness_goals?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          posture_score?: number | null
          sleep_hours?: number | null
          stress_level?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
          work_schedule?: string | null
          workout_experience?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          avatar_url?: string | null
          bmi?: number | null
          bmr?: number | null
          body_type?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          dietary_restrictions?: string[] | null
          eating_habits?: string | null
          fitness_goals?: string[] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          posture_score?: number | null
          sleep_hours?: number | null
          stress_level?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
          work_schedule?: string | null
          workout_experience?: string | null
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          recorded_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          id?: string
          recorded_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          id?: string
          recorded_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          calories_burned: number | null
          completed_at: string
          duration_minutes: number
          exercises: Json | null
          id: string
          notes: string | null
          user_id: string
          workout_type: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string
          duration_minutes: number
          exercises?: Json | null
          id?: string
          notes?: string | null
          user_id: string
          workout_type: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string
          duration_minutes?: number
          exercises?: Json | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_type?: string
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
