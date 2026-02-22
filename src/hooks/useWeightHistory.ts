import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const chartData = (weightLogs || []).map((log) => ({
    date: new Date(log.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: Number(log.weight_kg),
  }));

  const latest = weightLogs?.[weightLogs.length - 1];
  const first = weightLogs?.[0];
  const weightChange = latest && first ? Number(latest.weight_kg) - Number(first.weight_kg) : null;
  const weightChangePercent = first && weightChange !== null
    ? ((weightChange / Number(first.weight_kg)) * 100).toFixed(1)
    : null;

  return { weightLogs, chartData, weightChange, weightChangePercent, isLoading };
}
