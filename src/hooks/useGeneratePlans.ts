import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * ===== GEMINI EDGE FUNCTION RESPONSE SCHEMAS =====
 * These interfaces match the EXACT structure returned by Gemini
 * DO NOT modify without updating the Edge Function schema
 */

/**
 * Exercise Item from AI - Matches Gemini schema
 */
export interface ExerciseItemFromAI {
  name: string;
  sets?: string;    // e.g., "3x12" or "3 sets x 12 reps"
  duration?: string; // e.g., "45 mins" or "3 rounds"
  reps?: string;    // Alternative to sets
  intensity?: string; // e.g., "moderate", "high"
  rest?: string;    // e.g., "60 seconds"
}

/**
 * Workout Plan from Gemini - Guaranteed structure
 */
export interface WorkoutPlanFromAI {
  title: string;
  duration: string; // Total duration (e.g., "60 mins")
  calories: number; // Estimated burn
  exercises: ExerciseItemFromAI[];
  intensity?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

/**
 * Meal Item from AI - CRITICAL: protein/carbs/fat are STRINGS
 * Gemini returns nutritional values as "25g", "45g", etc.
 */
export interface MealItemFromAI {
  meal: string;
  calories: number;
  protein: string;      // ⚠️ STRING! e.g., "25g"
  carbs: string;        // ⚠️ STRING! e.g., "45g"
  fat: string;          // ⚠️ STRING! e.g., "12g"
  image_query: string;
  ingredients: string[];
  instructions: string[];
  time?: string;        // Optional: breakfast, lunch, dinner
}

/**
 * Normalized Meal Item for UI - protein/carbs/fat converted to NUMBERS
 */
export interface MealItemUI {
  meal: string;
  calories: number;
  protein: number;      // ✅ NUMBER (converted from AI string)
  carbs: number;        // ✅ NUMBER (converted from AI string)
  fat: number;          // ✅ NUMBER (converted from AI string)
  image_query: string;
  ingredients: string[];
  instructions: string[];
  time?: string;
}

/**
 * Sleep Plan from AI - Strict schema
 */
export interface SleepPlanFromAI {
  bedtime: string;      // e.g., "10:30 PM"
  wakeTime: string;     // e.g., "6:30 AM"
  targetHours: number;  // e.g., 8
  tips: string[];       // Sleep optimization tips
  routine?: string[];   // Optional: wind-down routine
}

/**
 * Daily Task Suggestion from AI
 */
export interface DailyTaskSuggestionFromAI {
  title: string;
  category: "workout" | "meal" | "sleep" | "posture" | "hydration" | "wellness" | "health" | "fun" | "social" | "gaming" | string;
  timeSlot?: string;    // Optional: suggested time
  priority?: "high" | "medium" | "low";
  duration?: string;    // Optional: estimated duration
}

/**
 * Raw response from Gemini (as returned by Edge Function)
 * MUST match Gemini function calling schema exactly
 */
export interface GeneratedPlansFromAI {
  workout: WorkoutPlanFromAI;
  meals: {
    breakfast: MealItemFromAI;
    lunch: MealItemFromAI;
    dinner: MealItemFromAI;
    snacks?: { name: string; calories: number }[];
  };
  sleep: SleepPlanFromAI;
  dailyTasks?: DailyTaskSuggestionFromAI[];
  metadata?: {
    generatedAt: string;
    location?: string;
    userProfile?: string;
  };
}

/**
 * Normalized Plans for Frontend consumption
 * All string macros converted to numbers, safe for UI/charts
 */
export interface GeneratedPlans {
  workout: WorkoutPlanFromAI;
  meals: {
    breakfast: MealItemUI;
    lunch: MealItemUI;
    dinner: MealItemUI;
    snacks?: { name: string; calories: number }[];
  };
  sleep: SleepPlanFromAI;
  dailyTasks?: DailyTaskSuggestionFromAI[];
}

/**
 * CRITICAL: Macro normalization function
 * Converts "25g" → 25, "45g" → 45, etc.
 * Handles edge cases: "25", "25 grams", invalid input
 */
function parseNutritionValue(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  
  const str = value.toString().trim();
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Normalize Gemini response for UI consumption
 * Converts all macro strings to numbers
 * Validates required fields before normalization
 * 
 * @param aiPlans Raw response from Gemini Edge Function
 * @returns Normalized plans safe for UI rendering
 * @throws Error if critical fields are missing
 */
export function normalizeAIPlans(aiPlans: GeneratedPlansFromAI): GeneratedPlans {
  // Validate critical structure exists
  if (!aiPlans?.workout || !aiPlans?.meals || !aiPlans?.sleep) {
    throw new Error("Invalid AI response structure: missing workout, meals, or sleep");
  }

  const meals = aiPlans.meals;
  
  // Validate meal structure
  if (!meals.breakfast || !meals.lunch || !meals.dinner) {
    throw new Error("Invalid meal structure: missing breakfast, lunch, or dinner");
  }

  return {
    workout: aiPlans.workout,
    meals: {
      breakfast: {
        ...meals.breakfast,
        protein: parseNutritionValue(meals.breakfast.protein),
        carbs: parseNutritionValue(meals.breakfast.carbs),
        fat: parseNutritionValue(meals.breakfast.fat),
      },
      lunch: {
        ...meals.lunch,
        protein: parseNutritionValue(meals.lunch.protein),
        carbs: parseNutritionValue(meals.lunch.carbs),
        fat: parseNutritionValue(meals.lunch.fat),
      },
      dinner: {
        ...meals.dinner,
        protein: parseNutritionValue(meals.dinner.protein),
        carbs: parseNutritionValue(meals.dinner.carbs),
        fat: parseNutritionValue(meals.dinner.fat),
      },
      snacks: meals.snacks,
    },
    sleep: aiPlans.sleep,
    dailyTasks: aiPlans.dailyTasks,
  };
}

export function useGeneratePlans() {
  const [plans, setPlans] = useState<GeneratedPlans | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-plans", {
        body: {},
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

      // Validate and normalize AI response
      const aiPlans = data as GeneratedPlansFromAI;
      const normalizedPlans = normalizeAIPlans(aiPlans);
      
      setPlans(normalizedPlans);
      toast.success("Personalized plans generated! ✨");
      return normalizedPlans;
    } catch (e) {
      console.error("Plan generation failed:", e);
      toast.error(e instanceof Error ? e.message : "Failed to generate plans");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { plans, isGenerating, generate, setPlans };
}
