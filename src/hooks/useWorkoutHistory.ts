import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function filterByDays(logs: any[], dateKey: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((l) => new Date(l[dateKey]) >= cutoff);
}

function aggregateByDay(logs: any[]) {
  const map: Record<string, number> = {};
  logs.forEach((l) => {
    const key = new Date(l.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    map[key] = (map[key] || 0) + l.duration_minutes;
  });
  return Object.entries(map).map(([date, value]) => ({ date, value }));
}

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

  const weeklyChart = aggregateByDay(filterByDays(workoutLogs || [], "completed_at", 7));
  const monthlyChart = aggregateByDay(filterByDays(workoutLogs || [], "completed_at", 30));

  const totalWorkouts = workoutLogs?.length || 0;
  const thisMonthWorkouts = (workoutLogs || []).filter((l) => {
    const d = new Date(l.completed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { workoutLogs, weeklyData, weeklyChart, monthlyChart, totalWorkouts, thisMonthWorkouts, isLoading };
}
