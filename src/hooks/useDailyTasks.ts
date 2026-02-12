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

      const defaults = [
        { title: "Morning Stretches", category: "workout" },
        { title: "Drink 8 glasses of water", category: "hydration" },
        { title: "Log breakfast", category: "meal" },
        { title: "Posture check", category: "posture" },
        { title: "Take vitamins", category: "health" },
        { title: "Evening workout", category: "workout" },
        { title: "Log dinner", category: "meal" },
        { title: "Sleep by 10:30 PM", category: "sleep" },
      ];

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
