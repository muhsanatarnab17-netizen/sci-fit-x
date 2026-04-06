import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeneratedPlans } from "@/hooks/useGeneratePlans";
import { toast } from "sonner";

const TODAY_KEY = () => new Date().toISOString().split("T")[0];

/**
 * Caches generated plans for the day in localStorage keyed by user+date.
 * Plans are generated once per day and persist across navigation.
 */
export function useCachedPlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cacheKey = user?.id ? `plans_${user.id}_${TODAY_KEY()}` : null;

  const { data: plans, isLoading } = useQuery<GeneratedPlans | null>({
    queryKey: ["cached-plans", user?.id, TODAY_KEY()],
    queryFn: () => {
      if (!cacheKey) return null;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as GeneratedPlans;
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never refetch automatically
    gcTime: 1000 * 60 * 60 * 24, // keep in memory 24h
  });

  const generateAndCache = useMutation({
    mutationFn: async (): Promise<GeneratedPlans> => {
      const { data, error } = await supabase.functions.invoke("generate-plans", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as GeneratedPlans;
    },
    onSuccess: (data) => {
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        // Clean old cached days
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith(`plans_${user?.id}_`) && k !== cacheKey) {
            localStorage.removeItem(k);
          }
        });
      }
      queryClient.setQueryData(["cached-plans", user?.id, TODAY_KEY()], data);
      toast.success("Personalized plans generated! ✨");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate plans");
    },
  });

  const seedTasksFromPlan = async (result: GeneratedPlans) => {
    if (!user?.id || !result.dailyTasks) return;
    const today = TODAY_KEY();
    await supabase.from("daily_tasks").delete().eq("user_id", user.id).eq("scheduled_for", today);
    const rows = result.dailyTasks.map((t) => ({
      user_id: user.id,
      title: t.title,
      category: t.category,
      scheduled_for: today,
      completed: false,
    }));
    await supabase.from("daily_tasks").insert(rows);
    queryClient.invalidateQueries({ queryKey: ["daily-tasks"] });
  };

  return {
    plans,
    isLoading,
    isGenerating: generateAndCache.isPending,
    generateAndCache,
    seedTasksFromPlan,
    hasPlansToday: !!plans,
  };
}
