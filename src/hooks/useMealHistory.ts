import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function filterByDays(logs: any[], dateKey: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((l) => new Date(l[dateKey]) >= cutoff);
}

function aggregateCalByDay(logs: any[]) {
  const map: Record<string, number> = {};
  logs.forEach((l) => {
    const key = new Date(l.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    map[key] = (map[key] || 0) + (l.calories || 0);
  });
  return Object.entries(map).map(([date, value]) => ({ date, value }));
}

export function useMealHistory() {
  const { user } = useAuth();

  const { data: mealLogs, isLoading } = useQuery({
    queryKey: ["meal-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: true })
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
  const weeklyData = days.map((day) => ({ day, consumed: 0, goal: 2000 }));

  (mealLogs || []).forEach((log) => {
    const d = new Date(log.logged_at);
    if (d >= startOfWeek) {
      weeklyData[d.getDay()].consumed += log.calories || 0;
    }
  });

  const weeklyChart = aggregateCalByDay(filterByDays(mealLogs || [], "logged_at", 7));
  const monthlyChart = aggregateCalByDay(filterByDays(mealLogs || [], "logged_at", 30));

  return { mealLogs, weeklyData, weeklyChart, monthlyChart, isLoading };
}
