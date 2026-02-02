import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  calculateBMI,
  calculateBMR,
  calculateDailyCalories,
  BODY_TYPES,
  ACTIVITY_LEVELS,
  DIETARY_RESTRICTIONS,
  COMMON_ALLERGIES,
  FITNESS_GOALS,
  type ACTIVITY_MULTIPLIERS,
} from "@/lib/health-utils";
import { Activity, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<"male" | "female" | "other" | "prefer_not_to_say">("prefer_not_to_say");
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [bodyType, setBodyType] = useState<string>("not_sure");

  // Step 2: Diet Info
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [eatingHabits, setEatingHabits] = useState<string>("regular");

  // Step 3: Fitness History
  const [activityLevel, setActivityLevel] = useState<string>("moderately_active");
  const [workoutExperience, setWorkoutExperience] = useState<string>("beginner");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);

  // Step 4: Lifestyle
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [workSchedule, setWorkSchedule] = useState<string>("regular_9_to_5");
  const [stressLevel, setStressLevel] = useState<string>("moderate");

  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);

    const bmi = calculateBMI(weightKg, heightCm);
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const dailyCalories = calculateDailyCalories(bmr, activityLevel as keyof typeof ACTIVITY_MULTIPLIERS);

    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        age,
        gender,
        height_cm: heightCm,
        weight_kg: weightKg,
        body_type: bodyType as any,
        bmi,
        bmr,
        daily_calorie_goal: dailyCalories,
        dietary_restrictions: dietaryRestrictions,
        allergies,
        eating_habits: eatingHabits as any,
        activity_level: activityLevel as any,
        workout_experience: workoutExperience as any,
        fitness_goals: fitnessGoals,
        sleep_hours: sleepHours,
        work_schedule: workSchedule as any,
        stress_level: stressLevel as any,
        onboarding_completed: true,
        onboarding_step: TOTAL_STEPS,
      });

      toast.success("Profile created! Welcome to FitLife Pro!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (item === "None") {
      setArray([]);
    } else if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array.filter((i) => i !== "None"), item]);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold gradient-text">FitLife Pro</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Let's Set Up Your Profile</h1>
          <p className="text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</p>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Step Content */}
        <Card className="glass border-border/50 mb-8">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Diet & Nutrition"}
              {currentStep === 3 && "Fitness Background"}
              {currentStep === 4 && "Lifestyle Factors"}
              {currentStep === 5 && "Review & Complete"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself so we can personalize your experience"}
              {currentStep === 2 && "Help us understand your dietary preferences and restrictions"}
              {currentStep === 3 && "Share your fitness history and goals"}
              {currentStep === 4 && "Let us know about your daily habits"}
              {currentStep === 5 && "Review your information and see your calculated metrics"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age: {age}</Label>
                    <Slider
                      value={[age]}
                      onValueChange={(v) => setAge(v[0])}
                      min={13}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={(v) => setGender(v as any)}>
                      <div className="grid grid-cols-2 gap-2">
                        {["male", "female", "other", "prefer_not_to_say"].map((g) => (
                          <div key={g} className="flex items-center space-x-2">
                            <RadioGroupItem value={g} id={g} />
                            <Label htmlFor={g} className="capitalize text-sm">
                              {g.replace("_", " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height: {heightCm} cm</Label>
                    <Slider
                      value={[heightCm]}
                      onValueChange={(v) => setHeightCm(v[0])}
                      min={100}
                      max={250}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight: {weightKg} kg</Label>
                    <Slider
                      value={[weightKg]}
                      onValueChange={(v) => setWeightKg(v[0])}
                      min={30}
                      max={200}
                      step={0.5}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <RadioGroup value={bodyType} onValueChange={setBodyType}>
                    <div className="grid gap-3">
                      {BODY_TYPES.map((type) => (
                        <div
                          key={type.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            bodyType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setBodyType(type.id)}
                        >
                          <RadioGroupItem value={type.id} id={type.id} />
                          <div>
                            <Label htmlFor={type.id} className="font-medium cursor-pointer">
                              {type.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Step 2: Diet Info */}
            {currentStep === 2 && (
              <>
                <div className="space-y-3">
                  <Label>Dietary Restrictions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <div
                        key={restriction}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          dietaryRestrictions.includes(restriction)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleArrayItem(dietaryRestrictions, setDietaryRestrictions, restriction)}
                      >
                        <Checkbox checked={dietaryRestrictions.includes(restriction)} />
                        <span className="text-sm">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Food Allergies</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_ALLERGIES.map((allergy) => (
                      <div
                        key={allergy}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          allergies.includes(allergy)
                            ? "border-destructive bg-destructive/5"
                            : "border-border hover:border-destructive/50"
                        }`}
                        onClick={() => toggleArrayItem(allergies, setAllergies, allergy)}
                      >
                        <Checkbox checked={allergies.includes(allergy)} />
                        <span className="text-sm">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Eating Habits</Label>
                  <RadioGroup value={eatingHabits} onValueChange={setEatingHabits}>
                    <div className="grid gap-2">
                      {[
                        { id: "regular", label: "Regular Meals", desc: "3 meals at consistent times" },
                        { id: "irregular", label: "Irregular", desc: "Eating at different times daily" },
                        { id: "frequent_snacking", label: "Frequent Snacking", desc: "Many small meals/snacks" },
                        { id: "time_restricted", label: "Time-Restricted", desc: "Intermittent fasting" },
                      ].map((habit) => (
                        <div
                          key={habit.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            eatingHabits === habit.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setEatingHabits(habit.id)}
                        >
                          <RadioGroupItem value={habit.id} id={`eating-${habit.id}`} />
                          <div>
                            <Label htmlFor={`eating-${habit.id}`} className="cursor-pointer">{habit.label}</Label>
                            <p className="text-sm text-muted-foreground">{habit.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Step 3: Fitness History */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <RadioGroup value={activityLevel} onValueChange={setActivityLevel}>
                    <div className="grid gap-2">
                      {ACTIVITY_LEVELS.map((level) => (
                        <div
                          key={level.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            activityLevel === level.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setActivityLevel(level.id)}
                        >
                          <RadioGroupItem value={level.id} id={`activity-${level.id}`} />
                          <div>
                            <Label htmlFor={`activity-${level.id}`} className="cursor-pointer">{level.label}</Label>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Workout Experience</Label>
                  <RadioGroup value={workoutExperience} onValueChange={setWorkoutExperience}>
                    <div className="grid grid-cols-3 gap-2">
                      {["beginner", "intermediate", "advanced"].map((exp) => (
                        <div
                          key={exp}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                            workoutExperience === exp ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setWorkoutExperience(exp)}
                        >
                          <RadioGroupItem value={exp} id={`exp-${exp}`} className="hidden" />
                          <Label htmlFor={`exp-${exp}`} className="capitalize cursor-pointer">{exp}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Fitness Goals (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FITNESS_GOALS.map((goal) => (
                      <div
                        key={goal}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          fitnessGoals.includes(goal)
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                        }`}
                        onClick={() => toggleArrayItem(fitnessGoals, setFitnessGoals, goal)}
                      >
                        <Checkbox checked={fitnessGoals.includes(goal)} />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Lifestyle */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Average Sleep: {sleepHours} hours</Label>
                  <Slider
                    value={[sleepHours]}
                    onValueChange={(v) => setSleepHours(v[0])}
                    min={3}
                    max={12}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Work Schedule</Label>
                  <RadioGroup value={workSchedule} onValueChange={setWorkSchedule}>
                    <div className="grid gap-2">
                      {[
                        { id: "regular_9_to_5", label: "Regular 9-5", desc: "Standard office hours" },
                        { id: "shift_work", label: "Shift Work", desc: "Rotating or night shifts" },
                        { id: "flexible", label: "Flexible", desc: "Variable work hours" },
                        { id: "work_from_home", label: "Work From Home", desc: "Remote work" },
                        { id: "student", label: "Student", desc: "Academic schedule" },
                      ].map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            workSchedule === schedule.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setWorkSchedule(schedule.id)}
                        >
                          <RadioGroupItem value={schedule.id} id={`schedule-${schedule.id}`} />
                          <div>
                            <Label htmlFor={`schedule-${schedule.id}`} className="cursor-pointer">{schedule.label}</Label>
                            <p className="text-sm text-muted-foreground">{schedule.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Stress Level</Label>
                  <RadioGroup value={stressLevel} onValueChange={setStressLevel}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["low", "moderate", "high", "very_high"].map((level) => (
                        <div
                          key={level}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                            stressLevel === level ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setStressLevel(level)}
                        >
                          <RadioGroupItem value={level} id={`stress-${level}`} className="hidden" />
                          <Label htmlFor={`stress-${level}`} className="capitalize cursor-pointer">
                            {level.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Calculated Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Your BMI</p>
                    <p className="text-3xl font-bold text-primary">
                      {calculateBMI(weightKg, heightCm)}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <p className="text-sm text-muted-foreground">BMR</p>
                    <p className="text-3xl font-bold text-secondary">
                      {calculateBMR(weightKg, heightCm, age, gender)}
                    </p>
                    <p className="text-xs text-muted-foreground">cal/day</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-muted-foreground">Daily Goal</p>
                    <p className="text-3xl font-bold text-accent">
                      {calculateDailyCalories(
                        calculateBMR(weightKg, heightCm, age, gender),
                        activityLevel as keyof typeof ACTIVITY_MULTIPLIERS
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">cal/day</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                    <h4 className="font-medium">Basic Info</h4>
                    <p className="text-sm text-muted-foreground">
                      {fullName || "No name"} • {age} years old • {heightCm}cm • {weightKg}kg
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                    <h4 className="font-medium">Fitness Level</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {activityLevel.replace("_", " ")} • {workoutExperience}
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                    <h4 className="font-medium">Goals</h4>
                    <p className="text-sm text-muted-foreground">
                      {fitnessGoals.length > 0 ? fitnessGoals.join(", ") : "No goals selected"}
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                    <h4 className="font-medium">Lifestyle</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {sleepHours}h sleep • {stressLevel} stress
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
