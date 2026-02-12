import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
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
