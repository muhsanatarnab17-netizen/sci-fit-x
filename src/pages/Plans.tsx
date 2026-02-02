import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");

  // Mock workout plan based on profile
  const workoutPlan = {
    title: "Today's Workout",
    duration: "45 mins",
    calories: 350,
    exercises: [
      { name: "Warm-up Stretches", duration: "5 mins", completed: false },
      { name: "Push-ups", sets: "3x12", completed: false },
      { name: "Squats", sets: "3x15", completed: false },
      { name: "Plank Hold", duration: "3x30s", completed: false },
      { name: "Lunges", sets: "3x10 each", completed: false },
      { name: "Cool-down", duration: "5 mins", completed: false },
    ],
  };

  // Mock meal plan
  const mealPlan = {
    breakfast: {
      time: "7:00 AM",
      meal: "Oatmeal with berries and nuts",
      calories: 350,
      protein: 12,
      carbs: 55,
      fat: 10,
    },
    lunch: {
      time: "12:30 PM",
      meal: "Grilled chicken salad with quinoa",
      calories: 480,
      protein: 35,
      carbs: 40,
      fat: 18,
    },
    dinner: {
      time: "7:00 PM",
      meal: "Salmon with roasted vegetables",
      calories: 520,
      protein: 40,
      carbs: 30,
      fat: 25,
    },
    snacks: [
      { name: "Greek yogurt", calories: 120 },
      { name: "Apple with almond butter", calories: 200 },
    ],
  };

  // Mock sleep plan
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

  // Mock daily tasks
  const dailyTasks = [
    { id: 1, title: "Morning stretches", time: "6:30 AM", category: "workout", completed: false },
    { id: 2, title: "Take vitamins", time: "7:00 AM", category: "health", completed: false },
    { id: 3, title: "Drink 2 glasses of water", time: "8:00 AM", category: "hydration", completed: false },
    { id: 4, title: "Posture check", time: "10:00 AM", category: "posture", completed: false },
    { id: 5, title: "Mid-day walk", time: "12:00 PM", category: "workout", completed: false },
    { id: 6, title: "Afternoon stretches", time: "3:00 PM", category: "posture", completed: false },
    { id: 7, title: "Evening workout", time: "6:00 PM", category: "workout", completed: false },
    { id: 8, title: "Meditation", time: "9:30 PM", category: "wellness", completed: false },
  ];

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success("New personalized plan generated!");
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
                        "hover:border-primary/50 cursor-pointer"
                      )}
                    >
                      <Checkbox id={`exercise-${i}`} />
                      <div className="flex-1">
                        <label htmlFor={`exercise-${i}`} className="font-medium cursor-pointer">
                          {exercise.name}
                        </label>
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

              {/* Meals */}
              {[
                { key: "breakfast", icon: "🌅", data: mealPlan.breakfast },
                { key: "lunch", icon: "☀️", data: mealPlan.lunch },
                { key: "dinner", icon: "🌙", data: mealPlan.dinner },
              ].map((meal) => (
                <Card key={meal.key} className="glass">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{meal.icon}</span>
                        <div>
                          <h3 className="font-semibold capitalize">{meal.key}</h3>
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

                {/* Tips */}
                <div>
                  <h4 className="font-medium mb-3">Sleep Tips</h4>
                  <div className="space-y-2">
                    {sleepPlan.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
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
                  {dailyTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 transition-all"
                    >
                      <Checkbox id={`task-${task.id}`} />
                      <div className="flex-1">
                        <label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">
                          {task.title}
                        </label>
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {task.time}
                      </Badge>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
