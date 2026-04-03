import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PostureAssessment {
  id: string;
  user_id: string;
  score: number;
  cva_angle: number | null;
  shoulder_alignment: number | null;
  symmetry_score: number | null;
  issues: string[] | null;
  recommendations: string[] | null;
  assessment_type: string | null;
  assessed_at: string;
}

function filterByDays(items: PostureAssessment[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((a) => new Date(a.assessed_at) >= cutoff);
}

function aggregateByDay(items: PostureAssessment[]): { date: string; value: number }[] {
  const map: Record<string, { score: number; count: number }> = {};
  items.forEach((a) => {
    const date = new Date(a.assessed_at);
    const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!map[key]) map[key] = { score: 0, count: 0 };
    map[key].score += a.score;
    map[key].count += 1;
  });
  return Object.entries(map).map(([date, { score, count }]) => ({
    date,
    value: Math.round(score / count),
  }));
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
      cva_angle?: number;
      shoulder_alignment?: number;
      symmetry_score?: number;
      issues?: string[];
      recommendations?: string[];
      assessment_type: "camera_analysis" | "self_assessment";
    }) => {
      if (!user?.id) throw new Error("No user logged in");
      const { data, error } = await supabase
        .from("posture_assessments")
        .insert({
          user_id: user.id,
          score: assessment.score,
          cva_angle: assessment.cva_angle || null,
          shoulder_alignment: assessment.shoulder_alignment || null,
          symmetry_score: assessment.symmetry_score || null,
          issues: assessment.issues || null,
          recommendations: assessment.recommendations || null,
          assessment_type: assessment.assessment_type,
        })
        .select()
        .single();
      if (error) throw error;

      // Update latest metrics in profile too
      await supabase.from("profiles").update({
        posture_score: assessment.score,
        latest_cva_angle: assessment.cva_angle || null,
        latest_shoulder_alignment: assessment.shoulder_alignment || null,
        latest_symmetry_score: assessment.symmetry_score || null,
      }).eq("user_id", user.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posture-assessments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      toast.error("Failed to save assessment: " + error.message);
    },
  });

  const stats = {
    totalAssessments: assessments?.length || 0,
    averageScore: assessments?.length
      ? Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length)
      : 0,
    latestScore: assessments?.[0]?.score || null,
    latestCVA: assessments?.[0]?.cva_angle || null,
    latestShoulderAlignment: assessments?.[0]?.shoulder_alignment || null,
    latestSymmetry: assessments?.[0]?.symmetry_score || null,
    previousScore: assessments?.[1]?.score || null,
    improvement: assessments && assessments.length >= 2
      ? assessments[0].score - assessments[1].score
      : null,
    bestScore: assessments?.length
      ? Math.max(...assessments.map((a) => a.score))
      : 0,
  };

  const sorted = assessments ? [...assessments].reverse() : [];
  const weeklyChart = aggregateByDay(filterByDays(sorted, 7));
  const monthlyChart = aggregateByDay(filterByDays(sorted, 30));

  return { assessments, isLoading, saveAssessment, stats, weeklyChart, monthlyChart };
}