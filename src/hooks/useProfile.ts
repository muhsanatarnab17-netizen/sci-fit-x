import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  age: number | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_type: "ectomorph" | "mesomorph" | "endomorph" | "not_sure" | null;
  bmi: number | null;
  bmr: number | null;
  daily_calorie_goal: number | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  eating_habits: "regular" | "irregular" | "frequent_snacking" | "time_restricted" | null;
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active" | null;
  workout_experience: "beginner" | "intermediate" | "advanced" | null;
  injuries: string[] | null;
  fitness_goals: string[] | null;
  sleep_hours: number | null;
  work_schedule: "regular_9_to_5" | "shift_work" | "flexible" | "work_from_home" | "student" | null;
  stress_level: "low" | "moderate" | "high" | "very_high" | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  posture_score: number;
  created_at: string;
  updated_at: string;
}

const VALID_GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
const VALID_BODY_TYPES = ["ectomorph", "mesomorph", "endomorph", "not_sure"] as const;
const VALID_EATING_HABITS = ["regular", "irregular", "frequent_snacking", "time_restricted"] as const;
const VALID_ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"] as const;
const VALID_WORKOUT_EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;
const VALID_WORK_SCHEDULES = ["regular_9_to_5", "shift_work", "flexible", "work_from_home", "student"] as const;
const VALID_STRESS_LEVELS = ["low", "moderate", "high", "very_high"] as const;

const ProfileUpdateSchema = z.object({
  full_name: z.string().max(200).optional().nullable(),
  avatar_url: z.string().url().max(2048).optional().nullable(),
  age: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.enum(VALID_GENDERS).optional().nullable(),
  height_cm: z.number().min(30).max(300).optional().nullable(),
  weight_kg: z.number().min(10).max(500).optional().nullable(),
  body_type: z.enum(VALID_BODY_TYPES).optional().nullable(),
  bmi: z.number().min(5).max(100).optional().nullable(),
  bmr: z.number().min(500).max(10000).optional().nullable(),
  daily_calorie_goal: z.number().int().min(500).max(10000).optional().nullable(),
  dietary_restrictions: z.array(z.string().max(100)).max(20).optional().nullable(),
  allergies: z.array(z.string().max(100)).max(20).optional().nullable(),
  eating_habits: z.enum(VALID_EATING_HABITS).optional().nullable(),
  activity_level: z.enum(VALID_ACTIVITY_LEVELS).optional().nullable(),
  workout_experience: z.enum(VALID_WORKOUT_EXPERIENCE).optional().nullable(),
  injuries: z.array(z.string().max(200)).max(20).optional().nullable(),
  fitness_goals: z.array(z.string().max(200)).max(20).optional().nullable(),
  sleep_hours: z.number().min(0).max(24).optional().nullable(),
  work_schedule: z.enum(VALID_WORK_SCHEDULES).optional().nullable(),
  stress_level: z.enum(VALID_STRESS_LEVELS).optional().nullable(),
  onboarding_completed: z.boolean().optional(),
  onboarding_step: z.number().int().min(0).max(20).optional(),
  posture_score: z.number().int().min(0).max(100).optional(),
}).partial();

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error("No user logged in");

      // Validate inputs before sending to database
      const validated = ProfileUpdateSchema.parse(updates);

      const { data, error } = await supabase
        .from("profiles")
        .update(validated)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}
