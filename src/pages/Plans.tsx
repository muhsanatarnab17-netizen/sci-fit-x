import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import { useCachedPlans } from "@/hooks/useCachedPlans";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CompletionTick from "@/components/ui/completion-tick";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dumbbell,
  Utensils,
  Moon,
  ListTodo,
  Sparkles,
  Clock,
  Flame,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Track completed items in localStorage so they persist across navigation
function useLocalState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default function Plans() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tasks, isLoading: tasksLoading, toggleTask } = useDailyTasks();
  const { plans, isGenerating, generateAndCache, seedTasksFromPlan, hasPlansToday } = useCachedPlans();
  const [activeTab, setActiveTab] = useState("workout");

  const today = new Date().toISOString().split("T")[0];
  const [completedExercises, setCompletedExercises] = useLocalState<Record<number, boolean>>(`exercises_${user?.id}_${today}`, {});
  const [completedMeals, setCompletedMeals] = useLocalState<Record<string, boolean>>(`meals_${user?.id}_${today}`, {});
  const [sleepLogged, setSleepLogged] = useLocalState<boolean>(`sleep_${user?.id}_${today}`, false);

  // Auto-generate plans only if none cached for today
  useEffect(() => {
    if (profile?.onboarding_completed && !hasPlansToday && !isGenerating) {
      generateAndCache.mutateAsync().then((result) => {
        if (result) seedTasksFromPlan(result);
      });
    }
  }, [profile?.onboarding_completed, hasPlansToday]);

  const handleGenerateNew = async () => {
    if (!profile) return;
    setCompletedExercises({});
    setCompletedMeals({});
    setSleepLogged(false);
    const result = await generateAndCache.mutateAsync();
    if (result) await seedTasksFromPlan(result);
  };

  const toggleExercise = async (index: number) => {
    const wasCompleted = completedExercises[index];
    setCompletedExercises((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!wasCompleted) {
      toast.success("Exercise completed! 💪");
      if (user?.id && plans?.workout) {
        const exercise = plans.workout.exercises[index];
        await supabase.from("workout_logs").insert({
          user_id: user.id,
          workout_type: "daily_plan",
          duration_minutes: parseInt(exercise.duration || "5") || 5,
          calories_burned: Math.round(plans.workout.calories / plans.workout.exercises.length),
          exercises: [exercise],
        });
      }
    }
  };

  const toggleMeal = async (key: string) => {
    const wasCompleted = completedMeals[key];
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!wasCompleted) {
      toast.success("Meal logged! 🍽️");
      if (user?.id && plans?.meals) {
        const mealData = plans.meals[key as keyof typeof plans.meals];
        if (mealData && "calories" in mealData) {
          await supabase.from("meal_logs").insert({
            user_id: user.id,
            meal_type: key,
            food_items: [{ name: (mealData as any).meal }],
            calories: (mealData as any).calories,
            protein_g: (mealData as any).protein,
            carbs_g: (mealData as any).carbs,
            fat_g: (mealData as any).fat,
          });
        }
      }
    }
  };

  const workoutPlan = plans?.workout;
  const mealPlan = plans?.meals;
  const sleepPlan = plans?.sleep;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Your Personalized Plans
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-generated recommendations based on your profile
            </p>
          </div>
          <Button onClick={handleGenerateNew} disabled={isGenerating} variant="outline">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Plans
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="workout" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Workout</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Meals</span>
            </TabsTrigger>
            <TabsTrigger value="sleep" className="gap-2">
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline">Sleep</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>

          {/* Workout Tab */}
          <TabsContent value="workout">
            {isGenerating || !workoutPlan ? (
              <Card className="glass">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass overflow-hidden">
                <CardHeader className="pb-4">
                  {/* Hero header with large icon and skill indicator */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <Dumbbell className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl leading-tight mb-1">
                        {workoutPlan.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Tailored for your level
                      </CardDescription>
                      {/* Skill level bar */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const exp = profile?.workout_experience || "beginner";
                            const filled = exp === "beginner" ? 1 : exp === "intermediate" ? 3 : 5;
                            return (
                              <div
                                key={level}
                                className={cn(
                                  "w-1.5 rounded-full transition-all",
                                  level <= filled
                                    ? "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                                    : "bg-muted",
                                  level <= filled
                                    ? level <= 1 ? "h-3" : level <= 2 ? "h-4" : level <= 3 ? "h-5" : level <= 4 ? "h-6" : "h-7"
                                    : level <= 1 ? "h-3" : level <= 2 ? "h-4" : level <= 3 ? "h-5" : level <= 4 ? "h-6" : "h-7"
                                )}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize font-medium">
                          {profile?.workout_experience || "beginner"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Duration & calories pills */}
                  <div className="flex gap-2.5 mt-4">
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                      <Clock className="h-3.5 w-3.5" />
                      {workoutPlan.duration}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                      <Flame className="h-3.5 w-3.5" />
                      {workoutPlan.calories} cal
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    {workoutPlan.exercises.map((exercise, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all",
                          completedExercises[i]
                            ? "bg-accent/5 border-accent/20"
                            : "hover:border-primary/50 border-border"
                        )}
                      >
                        <CompletionTick
                          completed={!!completedExercises[i]}
                          onToggle={() => toggleExercise(i)}
                          category="workout"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "font-medium text-[15px] leading-snug block",
                            completedExercises[i] && "line-through text-muted-foreground"
                          )}>
                            {exercise.name}
                          </span>
                        </div>
                        <Badge variant="secondary" className="shrink-0 px-3 py-1 text-xs font-semibold">
                          {exercise.sets || exercise.duration || "—"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals">
            {isGenerating || !mealPlan ? (
              <div className="grid gap-4">
                <Skeleton className="h-24 w-full" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                <Card className="glass">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {mealPlan.breakfast.calories + mealPlan.lunch.calories + mealPlan.dinner.calories +
                            mealPlan.snacks.reduce((s, sn) => s + sn.calories, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Calories</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">
                          {mealPlan.breakfast.protein + mealPlan.lunch.protein + mealPlan.dinner.protein}g
                        </p>
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent-foreground">
                          {mealPlan.breakfast.carbs + mealPlan.lunch.carbs + mealPlan.dinner.carbs}g
                        </p>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-neon-orange">
                          {mealPlan.breakfast.fat + mealPlan.lunch.fat + mealPlan.dinner.fat}g
                        </p>
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {[
                  { key: "breakfast", icon: "🌅", data: mealPlan.breakfast },
                  { key: "lunch", icon: "☀️", data: mealPlan.lunch },
                  { key: "dinner", icon: "🌙", data: mealPlan.dinner },
                ].map((meal) => (
                  <Card key={meal.key} className={cn("glass transition-all", completedMeals[meal.key] && "border-accent/20")}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CompletionTick
                            completed={!!completedMeals[meal.key]}
                            onToggle={() => toggleMeal(meal.key)}
                            category="meal"
                            size="lg"
                          />
                          <div>
                            <h3 className={cn("font-semibold capitalize", completedMeals[meal.key] && "line-through text-muted-foreground")}>
                              {meal.key}
                            </h3>
                            <p className="text-muted-foreground">{meal.data.meal}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{meal.data.time}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{meal.data.calories} cal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="glass">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">🍎</span>
                      <h3 className="font-semibold">Snacks</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mealPlan.snacks.map((snack, i) => (
                        <Badge key={i} variant="secondary" className="py-2 px-3">
                          {snack.name} ({snack.calories} cal)
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep">
            {isGenerating || !sleepPlan ? (
              <Card className="glass">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-neon-purple" />
                    Sleep Optimization
                  </CardTitle>
                  <CardDescription>
                    Personalized sleep schedule based on your lifestyle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-center">
                      <p className="text-sm text-muted-foreground">Bedtime</p>
                      <p className="text-2xl font-bold">{sleepPlan.bedtime}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <p className="text-sm text-muted-foreground">Wake Time</p>
                      <p className="text-2xl font-bold">{sleepPlan.wakeTime}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
                      <p className="text-sm text-muted-foreground">Target Sleep</p>
                      <p className="text-2xl font-bold">{sleepPlan.targetHours}h</p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border transition-all",
                      sleepLogged ? "bg-neon-purple/5 border-neon-purple/20" : "border-border"
                    )}
                  >
                    <CompletionTick
                      completed={sleepLogged}
                      onToggle={() => {
                        setSleepLogged(!sleepLogged);
                        if (!sleepLogged) toast.success("Sleep goal logged! 😴");
                      }}
                      category="sleep"
                      size="lg"
                    />
                    <div>
                      <h4 className={cn("font-medium", sleepLogged && "line-through text-muted-foreground")}>
                        Log Sleep Goal Achieved
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Did you get {sleepPlan.targetHours}+ hours of sleep last night?
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Sleep Tips</h4>
                    <div className="space-y-2">
                      {sleepPlan.tips.map((tip, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="p-1 rounded-full bg-neon-purple/20">
                            <Moon className="h-3 w-3 text-neon-purple" />
                          </div>
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-accent-foreground" />
                  Daily Health Tasks
                </CardTitle>
                <CardDescription>
                  Your personalized to-do list for optimal health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasksLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tasks for today. Click "Regenerate Plans" to generate your personalized tasks.
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-lg border transition-all",
                          task.completed
                            ? "bg-accent/5 border-accent/20"
                            : "hover:border-primary/50"
                        )}
                      >
                        <CompletionTick
                          completed={!!task.completed}
                          onToggle={() => toggleTask.mutate({ id: task.id, completed: !task.completed })}
                          category={(task.category as any) || "workout"}
                        />
                        <div className="flex-1">
                          <span className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                            {task.title}
                          </span>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
