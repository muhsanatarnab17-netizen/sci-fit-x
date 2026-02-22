import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

  // Aggregate by day for current week
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

  return { mealLogs, weeklyData, isLoading };
}
