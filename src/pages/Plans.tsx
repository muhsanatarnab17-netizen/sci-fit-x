import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import CompletionTick from "@/components/ui/completion-tick";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  const { profile } = useProfile();
  const { tasks, isLoading: tasksLoading, toggleTask } = useDailyTasks();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");

  // Track local completion state for workout exercises and meals
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [sleepLogged, setSleepLogged] = useState(false);

  const workoutPlan = {
    title: "Today's Workout",
    duration: "45 mins",
    calories: 350,
    exercises: [
      { name: "Warm-up Stretches", duration: "5 mins" },
      { name: "Push-ups", sets: "3x12" },
      { name: "Squats", sets: "3x15" },
      { name: "Plank Hold", duration: "3x30s" },
      { name: "Lunges", sets: "3x10 each" },
      { name: "Cool-down", duration: "5 mins" },
    ],
  };

  const mealPlan = {
    breakfast: { time: "7:00 AM", meal: "Oatmeal with berries and nuts", calories: 350, protein: 12, carbs: 55, fat: 10 },
    lunch: { time: "12:30 PM", meal: "Grilled chicken salad with quinoa", calories: 480, protein: 35, carbs: 40, fat: 18 },
    dinner: { time: "7:00 PM", meal: "Salmon with roasted vegetables", calories: 520, protein: 40, carbs: 30, fat: 25 },
    snacks: [
      { name: "Greek yogurt", calories: 120 },
      { name: "Apple with almond butter", calories: 200 },
    ],
  };

  const sleepPlan = {
    bedtime: "10:30 PM",
    wakeTime: "6:30 AM",
    targetHours: profile?.sleep_hours || 8,
    tips: [
      "Avoid screens 1 hour before bed",
      "Keep bedroom temperature around 65-68°F",
      "Practice deep breathing for 5 minutes",
      "Avoid caffeine after 2 PM",
    ],
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success("New personalized plan generated!");
  };

  const toggleExercise = (index: number) => {
    setCompletedExercises((prev) => ({ ...prev, [index]: !prev[index] }));
    if (!completedExercises[index]) {
      toast.success("Exercise completed! 💪");
    }
  };

  const toggleMeal = (key: string) => {
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!completedMeals[key]) {
      toast.success("Meal logged! 🍽️");
    }
  };

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
                        {exercise.sets || exercise.duration}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals">
            <div className="grid gap-4">
              {/* Macros Overview */}
              <Card className="glass">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {mealPlan.breakfast.calories + mealPlan.lunch.calories + mealPlan.dinner.calories + 320}
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

              {/* Meals with completion ticks */}
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

              {/* Snacks */}
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
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep">
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
                {/* Schedule */}
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

                {/* Sleep completion */}
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

                {/* Tips */}
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
          </TabsContent>

          {/* Tasks Tab - Database backed */}
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
                      No tasks for today. Visit the Dashboard to generate your daily tasks.
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
