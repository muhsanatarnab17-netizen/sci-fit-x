import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PostureAssessment {
  id: string;
  user_id: string;
  score: number;
  issues: string[] | null;
  recommendations: string[] | null;
  assessment_type: string | null;
  assessed_at: string;
}

export function usePostureHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["posture-assessments", user?.id],
    queryFn: async (): Promise<PostureAssessment[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("posture_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("assessed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PostureAssessment[];
    },
    enabled: !!user?.id,
  });

  const saveAssessment = useMutation({
    mutationFn: async (assessment: {
      score: number;
      issues?: string[];
      recommendations?: string[];
      assessment_type: "camera" | "self-assessment";
    }) => {
      if (!user?.id) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("posture_assessments")
        .insert({
          user_id: user.id,
          score: assessment.score,
          issues: assessment.issues || null,
          recommendations: assessment.recommendations || null,
          assessment_type: assessment.assessment_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posture-assessments", user?.id] });
    },
    onError: (error) => {
      toast.error("Failed to save assessment: " + error.message);
    },
  });

  // Calculate statistics
  const stats = {
    totalAssessments: assessments?.length || 0,
    averageScore: assessments?.length 
      ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
      : 0,
    latestScore: assessments?.[0]?.score || null,
    previousScore: assessments?.[1]?.score || null,
    improvement: assessments && assessments.length >= 2
      ? assessments[0].score - assessments[1].score
      : null,
    bestScore: assessments?.length
      ? Math.max(...assessments.map((a) => a.score))
      : 0,
    weeklyProgress: calculateWeeklyProgress(assessments || []),
  };

  return {
    assessments,
    isLoading,
    saveAssessment,
    stats,
  };
}

function calculateWeeklyProgress(assessments: PostureAssessment[]): { date: string; score: number }[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter assessments from the last 7 days
  const recentAssessments = assessments.filter((a) => {
    const date = new Date(a.assessed_at);
    return date >= weekAgo && date <= now;
  });

  // Group by date and take the latest score per day
  const dailyScores: Record<string, number> = {};
  recentAssessments.forEach((a) => {
    const dateKey = new Date(a.assessed_at).toISOString().split("T")[0];
    if (!dailyScores[dateKey] || new Date(a.assessed_at) > new Date(dailyScores[dateKey])) {
      dailyScores[dateKey] = a.score;
    }
  });

  // Convert to array and sort by date
  return Object.entries(dailyScores)
    .map(([date, score]) => ({ date, score }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
