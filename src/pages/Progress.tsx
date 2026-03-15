import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useWeightHistory } from "@/hooks/useWeightHistory";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useMealHistory } from "@/hooks/useMealHistory";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { useStreak } from "@/hooks/useStreak";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import WeightLogDialog from "@/components/weight/WeightLogDialog";
import TradingChart from "@/components/progress/TradingChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Scale, Target, Dumbbell, CheckCircle2 } from "lucide-react";

export default function Progress() {
  const { profile } = useProfile();
  const { weeklyData: weightWeekly, monthlyData: weightMonthly, weightChangePercent, isLoading: weightLoading } = useWeightHistory();
  const { weeklyChart: workoutWeekly, monthlyChart: workoutMonthly, totalWorkouts, thisMonthWorkouts, isLoading: workoutLoading } = useWorkoutHistory();
  const { weeklyChart: mealWeekly, monthlyChart: mealMonthly, isLoading: mealLoading } = useMealHistory();
  const { weeklyChart: postureWeekly, monthlyChart: postureMonthly, stats: postureStats, isLoading: postureLoading } = usePostureHistory();
  const { streak, isLoading: streakLoading } = useStreak();
  const { tasks } = useDailyTasks();

  const completedToday = tasks.filter((t) => t.completed).length;
  const totalToday = tasks.length;

  // BMI from weight data
  const bmiWeekly = profile?.height_cm
    ? weightWeekly.map((d) => ({ date: d.date, value: parseFloat((d.value / ((profile.height_cm! / 100) ** 2)).toFixed(1)) }))
    : [];
  const bmiMonthly = profile?.height_cm
    ? weightMonthly.map((d) => ({ date: d.date, value: parseFloat((d.value / ((profile.height_cm! / 100) ** 2)).toFixed(1)) }))
    : [];

  const isAnyLoading = weightLoading || workoutLoading || mealLoading || postureLoading || streakLoading;

  const stats = [
    {
      label: "Weight",
      value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—",
      change: weightChangePercent ? `${Number(weightChangePercent) > 0 ? "+" : ""}${weightChangePercent}%` : "",
      icon: Scale,
      color: "primary",
    },
    {
      label: "Workouts",
      value: `${thisMonthWorkouts}`,
      change: `${totalWorkouts} total`,
      icon: Dumbbell,
      color: "secondary",
    },
    {
      label: "Posture",
      value: `${postureStats.latestScore ?? profile?.posture_score ?? "—"}`,
      change: postureStats.improvement !== null ? `${postureStats.improvement > 0 ? "+" : ""}${postureStats.improvement}` : "",
      icon: Target,
      color: "accent-foreground",
    },
    {
      label: "Today",
      value: `${completedToday}/${totalToday}`,
      change: streak > 0 ? `${streak}🔥` : "",
      icon: CheckCircle2,
      color: "neon-orange",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Your Progress
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time tracking of your fitness journey
            </p>
          </div>
          <WeightLogDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass">
              <CardContent className="pt-6">
                {isAnyLoading ? (
                  <Skeleton className="h-14 w-full" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">{stat.value}</p>
                        {stat.change && (
                          <Badge variant="outline" className="text-xs">
                            {stat.change}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trading-style Charts */}
        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl overflow-x-auto">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="bmi">BMI</TabsTrigger>
            <TabsTrigger value="posture">Posture</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Calories</TabsTrigger>
          </TabsList>

          <TabsContent value="weight">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
                <CardDescription>Your weight over time — weekly & monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <TradingChart
                  weeklyData={weightWeekly}
                  monthlyData={weightMonthly}
                  label="Weight"
                  unit=" kg"
                  color="hsl(187, 100%, 50%)"
                  gradientId="weightGrad"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bmi">
            <Card className="glass">
              <CardHeader>
                <CardTitle>BMI Progress</CardTitle>
                <CardDescription>Calculated from weight & height</CardDescription>
              </CardHeader>
              <CardContent>
                <TradingChart
                  weeklyData={bmiWeekly}
                  monthlyData={bmiMonthly}
                  label="BMI"
                  unit=""
                  color="hsl(260, 60%, 55%)"
                  gradientId="bmiGrad"
                  domain={[15, 40]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posture">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Posture Score</CardTitle>
                <CardDescription>Your posture improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <TradingChart
                  weeklyData={postureWeekly}
                  monthlyData={postureMonthly}
                  label="Score"
                  unit=""
                  color="hsl(160, 80%, 45%)"
                  gradientId="postureGrad"
                  domain={[0, 100]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Workout Minutes</CardTitle>
                <CardDescription>Daily exercise duration</CardDescription>
              </CardHeader>
              <CardContent>
                <TradingChart
                  weeklyData={workoutWeekly}
                  monthlyData={workoutMonthly}
                  label="Minutes"
                  unit=" min"
                  color="hsl(330, 81%, 60%)"
                  gradientId="workoutGrad"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Calorie Intake</CardTitle>
                <CardDescription>Daily calorie consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <TradingChart
                  weeklyData={mealWeekly}
                  monthlyData={mealMonthly}
                  label="Calories"
                  unit=" cal"
                  color="hsl(25, 95%, 53%)"
                  gradientId="calorieGrad"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
