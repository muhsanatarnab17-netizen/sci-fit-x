import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/hooks/useProfile";
import { toast } from "sonner";

export interface WorkoutPlan {
  title: string;
  duration: string;
  calories: number;
  exercises: { name: string; sets?: string; duration?: string }[];
}

export interface MealItem {
  time: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlan {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: { name: string; calories: number }[];
}

export interface SleepPlan {
  bedtime: string;
  wakeTime: string;
  targetHours: number;
  tips: string[];
}

export interface DailyTaskSuggestion {
  title: string;
  category: string;
}

export interface GeneratedPlans {
  workout: WorkoutPlan;
  meals: MealPlan;
  sleep: SleepPlan;
  dailyTasks: DailyTaskSuggestion[];
}

export function useGeneratePlans() {
  const [plans, setPlans] = useState<GeneratedPlans | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (profile: Profile) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plans", {
        body: { profile },
      });

      if (error) {
        const msg = error.message || "Failed to generate plans";
        toast.error(msg);
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      setPlans(data as GeneratedPlans);
      toast.success("Personalized plans generated! ✨");
      return data as GeneratedPlans;
    } catch (e) {
      console.error("Plan generation failed:", e);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { plans, isGenerating, generate, setPlans };
}
