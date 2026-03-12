import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function filterByDays(logs: any[], dateKey: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((l) => new Date(l[dateKey]) >= cutoff);
}

export function useWeightHistory() {
  const { user } = useAuth();

  const { data: weightLogs, isLoading } = useQuery({
    queryKey: ["weight-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toChartData = (logs: any[]) =>
    logs.map((log) => ({
      date: formatDate(log.recorded_at),
      value: Number(log.weight_kg),
      weight: Number(log.weight_kg),
    }));

  const weeklyData = toChartData(filterByDays(weightLogs || [], "recorded_at", 7));
  const monthlyData = toChartData(filterByDays(weightLogs || [], "recorded_at", 30));
  const chartData = toChartData(weightLogs || []);

  const latest = weightLogs?.[weightLogs.length - 1];
  const first = weightLogs?.[0];
  const weightChange = latest && first ? Number(latest.weight_kg) - Number(first.weight_kg) : null;
  const weightChangePercent = first && weightChange !== null
    ? ((weightChange / Number(first.weight_kg)) * 100).toFixed(1)
    : null;

  return { weightLogs, chartData, weeklyData, monthlyData, weightChange, weightChangePercent, isLoading };
}
