import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  Settings,
  Activity,
  Scale,
  Ruler,
  Calendar,
  Dumbbell,
  Heart,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { calculateBMI, calculateBMR, calculateDailyCalories, getBMICategory, type ACTIVITY_MULTIPLIERS } from "@/lib/health-utils";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, updateProfile, isLoading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [height, setHeight] = useState(profile?.height_cm || 170);
  const [weight, setWeight] = useState(profile?.weight_kg || 70);
  const [sleepHours, setSleepHours] = useState(profile?.sleep_hours || 8);

  const handleSave = async () => {
    setIsSaving(true);

    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR(
      weight,
      height,
      profile?.age || 25,
      profile?.gender || "prefer_not_to_say"
    );
    const dailyCalories = calculateDailyCalories(
      bmr,
      (profile?.activity_level as keyof typeof ACTIVITY_MULTIPLIERS) || "moderately_active"
    );

    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        height_cm: height,
        weight_kg: weight,
        sleep_hours: sleepHours,
        bmi,
        bmr,
        daily_calorie_goal: dailyCalories,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const bmiCategory = profile.bmi ? getBMICategory(profile.bmi) : null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            Your Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and settings
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">{profile.full_name || "Fitness Champion"}</h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <Badge variant="outline" className="capitalize">
                    {profile.activity_level?.replace("_", " ") || "Active"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {profile.workout_experience || "Beginner"}
                  </Badge>
                  {profile.fitness_goals?.slice(0, 2).map((goal) => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <Scale className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{profile.weight_kg} kg</p>
              <p className="text-sm text-muted-foreground">Weight</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <Ruler className="h-6 w-6 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold">{profile.height_cm} cm</p>
              <p className="text-sm text-muted-foreground">Height</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <Activity className="h-6 w-6 mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">{profile.bmi || "--"}</p>
              <p className="text-sm text-muted-foreground">BMI</p>
              {bmiCategory && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {bmiCategory.label}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6 text-center">
              <Heart className="h-6 w-6 mx-auto text-neon-pink mb-2" />
              <p className="text-2xl font-bold">{profile.posture_score}</p>
              <p className="text-sm text-muted-foreground">Posture Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={profile.age || ""} disabled className="opacity-50" />
                <p className="text-xs text-muted-foreground">
                  Contact support to update your age
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Height: {height} cm</Label>
                <Slider
                  value={[height]}
                  onValueChange={(v) => setHeight(v[0])}
                  min={100}
                  max={250}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight: {weight} kg</Label>
                <Slider
                  value={[weight]}
                  onValueChange={(v) => setWeight(v[0])}
                  min={30}
                  max={200}
                  step={0.5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sleep Target: {sleepHours} hours</Label>
              <Slider
                value={[sleepHours]}
                onValueChange={(v) => setSleepHours(v[0])}
                min={4}
                max={12}
                step={0.5}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Goals & Preferences */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Goals & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Fitness Goals</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.fitness_goals?.length ? (
                  profile.fitness_goals.map((goal) => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No goals set</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground text-sm">Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.dietary_restrictions?.length ? (
                  profile.dietary_restrictions.map((restriction) => (
                    <Badge key={restriction} variant="outline">
                      {restriction}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No restrictions</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground text-sm">Allergies</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.allergies?.length ? (
                  profile.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="bg-destructive/10 text-destructive">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No allergies</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/onboarding")}
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Update All Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
