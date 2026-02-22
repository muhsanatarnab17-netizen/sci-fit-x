import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWorkoutHistory() {
  const { user } = useAuth();

  const { data: workoutLogs, isLoading } = useQuery({
    queryKey: ["workout-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Aggregate by day of week for current week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = days.map((day) => ({ day, minutes: 0 }));

  (workoutLogs || []).forEach((log) => {
    const d = new Date(log.completed_at);
    if (d >= startOfWeek) {
      weeklyData[d.getDay()].minutes += log.duration_minutes;
    }
  });

  const totalWorkouts = workoutLogs?.length || 0;
  const thisMonthWorkouts = (workoutLogs || []).filter((l) => {
    const d = new Date(l.completed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { workoutLogs, weeklyData, totalWorkouts, thisMonthWorkouts, isLoading };
}
