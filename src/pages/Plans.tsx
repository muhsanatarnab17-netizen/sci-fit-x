import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import { useGeneratePlans, GeneratedPlans } from "@/hooks/useGeneratePlans";
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

export default function Plans() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { tasks, isLoading: tasksLoading, toggleTask, seedDefaultTasks } = useDailyTasks();
  const { plans, isGenerating, generate } = useGeneratePlans();
  const [activeTab, setActiveTab] = useState("workout");

  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [sleepLogged, setSleepLogged] = useState(false);

  // Auto-generate plans on first load if profile is complete
  useEffect(() => {
    if (profile?.onboarding_completed && !plans && !isGenerating) {
      generate(profile);
    }
  }, [profile?.onboarding_completed]);

  const handleGenerateNew = async () => {
    if (!profile) return;
    setCompletedExercises({});
    setCompletedMeals({});
    setSleepLogged(false);
    const result = await generate(profile);
    // Seed AI-generated daily tasks
    if (result?.dailyTasks && user?.id) {
      const today = new Date().toISOString().split("T")[0];
      // Delete existing tasks for today and seed new ones
      await supabase.from("daily_tasks").delete().eq("user_id", user.id).eq("scheduled_for", today);
      const rows = result.dailyTasks.map((t) => ({
        user_id: user.id,
        title: t.title,
        category: t.category,
        scheduled_for: today,
        completed: false,
      }));
      await supabase.from("daily_tasks").insert(rows);
    }
  };

  const toggleExercise = async (index: number) => {
    setCompletedExercises((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!completedExercises[index]) {
      toast.success("Exercise completed! 💪");
      // Log completed exercise to workout_logs
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
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!completedMeals[key]) {
      toast.success("Meal logged! 🍽️");
      // Log completed meal
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
              <Card className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        {workoutPlan.title}
                      </CardTitle>
                      <CardDescription>
                        Tailored for your{" "}
                        <span className="capitalize">{profile?.workout_experience || "beginner"}</span> level
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {workoutPlan.duration}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Flame className="h-3 w-3" />
                        {workoutPlan.calories} cal
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workoutPlan.exercises.map((exercise, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-lg border transition-all",
                          completedExercises[i]
                            ? "bg-accent/5 border-accent/20"
                            : "hover:border-primary/50"
                        )}
                      >
                        <CompletionTick
                          completed={!!completedExercises[i]}
                          onToggle={() => toggleExercise(i)}
                          category="workout"
                        />
                        <div className="flex-1">
                          <span className={cn("font-medium", completedExercises[i] && "line-through text-muted-foreground")}>
                            {exercise.name}
                          </span>
                        </div>
                        <Badge variant="secondary">
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
                        <p className="text-2xl font-bold text-accent">
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
                  <ListTodo className="h-5 w-5 text-accent" />
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
