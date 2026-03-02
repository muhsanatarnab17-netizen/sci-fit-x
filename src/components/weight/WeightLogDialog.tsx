import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calculateBMI, calculateBMR } from "@/lib/health-utils";

export default function WeightLogDialog() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weight);
    if (!w || w < 10 || w > 500 || !user?.id) {
      toast.error("Please enter a valid weight (10-500 kg)");
      return;
    }

    setSaving(true);
    try {
      // Save to weight_logs
      const { error } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight_kg: w,
      });
      if (error) throw error;

      // Update profile weight + recalculate BMI/BMR
      const updates: Record<string, number> = { weight_kg: w };
      if (profile?.height_cm) {
        updates.bmi = calculateBMI(w, profile.height_cm);
      }
      if (profile?.height_cm && profile?.age && profile?.gender) {
        updates.bmr = calculateBMR(w, profile.height_cm, profile.age, profile.gender);
      }
      await updateProfile.mutateAsync(updates);

      queryClient.invalidateQueries({ queryKey: ["weight-logs"] });
      toast.success(`Weight logged: ${w} kg ✅`);
      setWeight("");
      setOpen(false);
    } catch (e: any) {
      toast.error("Failed to log weight: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:glow-blue">
          <Scale className="h-4 w-4 text-primary" />
          Log Weight
        </Button>
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Log Current Weight
          </DialogTitle>
          <DialogDescription>
            {profile?.weight_kg
              ? `Last recorded: ${profile.weight_kg} kg`
              : "Enter your current weight to track progress"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="10"
              max="500"
              placeholder="e.g. 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Weight
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
