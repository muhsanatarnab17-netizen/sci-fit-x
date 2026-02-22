import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  completed: boolean;
  scheduled_for: string | null;
  created_at: string;
}

export function useDailyTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["daily-tasks", user?.id, today],
    queryFn: async (): Promise<DailyTask[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("scheduled_for", today)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data as DailyTask[]) || [];
    },
    enabled: !!user?.id,
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("daily_tasks")
        .update({ completed })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["daily-tasks", user?.id, today] });
      const previous = queryClient.getQueryData<DailyTask[]>(["daily-tasks", user?.id, today]);
      queryClient.setQueryData<DailyTask[]>(["daily-tasks", user?.id, today], (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t)) || []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["daily-tasks", user?.id, today], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-tasks", user?.id, today] });
    },
  });

  const seedDefaultTasks = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No user");

      // Profile-aware defaults based on user's fitness goals and preferences
      const { data: profile } = await supabase
        .from("profiles")
        .select("fitness_goals, activity_level, dietary_restrictions, workout_experience")
        .eq("user_id", user.id)
        .maybeSingle();

      const defaults: { title: string; category: string }[] = [];

      // Core tasks everyone gets
      defaults.push({ title: "Drink 8 glasses of water", category: "hydration" });
      defaults.push({ title: "Posture check", category: "posture" });

      // Workout tasks based on experience
      const experience = profile?.workout_experience || "beginner";
      if (experience === "beginner") {
        defaults.push({ title: "Morning stretches (10 min)", category: "workout" });
        defaults.push({ title: "Light exercise (20 min)", category: "workout" });
      } else if (experience === "intermediate") {
        defaults.push({ title: "Morning warm-up", category: "workout" });
        defaults.push({ title: "Workout session (45 min)", category: "workout" });
      } else {
        defaults.push({ title: "Morning mobility work", category: "workout" });
        defaults.push({ title: "Training session (60 min)", category: "workout" });
      }

      // Meal tasks
      defaults.push({ title: "Log breakfast", category: "meal" });
      defaults.push({ title: "Log lunch", category: "meal" });
      defaults.push({ title: "Log dinner", category: "meal" });

      // Goal-specific tasks
      const goals = profile?.fitness_goals || [];
      if (goals.includes("weight_loss")) {
        defaults.push({ title: "Track calorie intake", category: "health" });
      }
      if (goals.includes("muscle_gain")) {
        defaults.push({ title: "Hit protein target", category: "meal" });
      }
      if (goals.includes("better_sleep")) {
        defaults.push({ title: "Sleep by 10:30 PM", category: "sleep" });
      }
      if (goals.includes("stress_reduction")) {
        defaults.push({ title: "5 min meditation", category: "health" });
      }

      // Always include sleep
      if (!defaults.some((d) => d.category === "sleep")) {
        defaults.push({ title: "Sleep by 10:30 PM", category: "sleep" });
      }

      // Health supplements
      defaults.push({ title: "Take vitamins", category: "health" });

      const rows = defaults.map((d) => ({
        user_id: user.id,
        title: d.title,
        category: d.category,
        scheduled_for: today,
        completed: false,
      }));

      const { error } = await supabase.from("daily_tasks").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-tasks", user?.id, today] });
    },
  });

  return { tasks: tasks || [], isLoading, toggleTask, seedDefaultTasks };
}
