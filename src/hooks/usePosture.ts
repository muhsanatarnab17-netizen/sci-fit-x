import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePostureHistory } from "./usePostureHistory";

export function usePosture() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { saveAssessment } = usePostureHistory();

  const analyzePosture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-posture", {
        body: { imageBase64 },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from posture analysis");
      }

      // Save to history automatically
      await saveAssessment.mutateAsync({
        score: data.score,
        cva_angle: data.cva_angle,
        shoulder_alignment: data.shoulder_alignment,
        symmetry_score: data.symmetry_score,
        issues: data.issues,
        recommendations: data.recommendations,
        assessment_type: "camera",
      });

      return data;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      console.error("Posture analysis failed:", err);
      toast.error(err.message || "AI Analysis failed. Please try again.");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzePosture,
    isAnalyzing,
  };
}
