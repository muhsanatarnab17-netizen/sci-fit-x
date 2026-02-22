import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useStreak() {
  const { user } = useAuth();

  const { data: streak = 0, isLoading } = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Fetch completed task dates (distinct days where at least one task was completed)
      const { data, error } = await supabase
        .from("daily_tasks")
        .select("scheduled_for")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("scheduled_for", { ascending: false })
        .limit(365);

      if (error) throw error;
      if (!data || data.length === 0) return 0;

      // Get unique dates
      const uniqueDates = [...new Set(data.map((t) => t.scheduled_for))].sort().reverse();

      // Calculate consecutive streak from today/yesterday
      const today = new Date().toISOString().split("T")[0];
      let streakCount = 0;
      let checkDate = new Date(today);

      // If no tasks completed today, start checking from yesterday
      if (!uniqueDates.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(dateStr)) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streakCount;
    },
    enabled: !!user?.id,
  });

  return { streak, isLoading };
}
