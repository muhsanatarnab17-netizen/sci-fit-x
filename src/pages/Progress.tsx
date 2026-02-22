import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useWeightHistory } from "@/hooks/useWeightHistory";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useMealHistory } from "@/hooks/useMealHistory";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { useStreak } from "@/hooks/useStreak";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, Scale, Target, Dumbbell, Calendar } from "lucide-react";

export default function Progress() {
  const { profile } = useProfile();
  const { chartData: weightData, weightChange, weightChangePercent, isLoading: weightLoading } = useWeightHistory();
  const { weeklyData: workoutData, totalWorkouts, isLoading: workoutLoading } = useWorkoutHistory();
  const { weeklyData: caloriesData, isLoading: mealLoading } = useMealHistory();
  const { stats: postureStats, isLoading: postureLoading } = usePostureHistory();
  const { streak, isLoading: streakLoading } = useStreak();

  // BMI chart from weight data + profile height
  const bmiData = profile?.height_cm
    ? weightData.map((d) => ({
        date: d.date,
        bmi: parseFloat((d.weight / ((profile.height_cm! / 100) ** 2)).toFixed(1)),
      }))
    : [];

  // Posture chart data
  const postureChartData = postureStats.weeklyProgress || [];

  const isAnyLoading = weightLoading || workoutLoading || mealLoading || postureLoading || streakLoading;

  const stats = [
    {
      label: "Weight Change",
      value: weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg` : "—",
      change: weightChangePercent ? `${Number(weightChangePercent) > 0 ? "+" : ""}${weightChangePercent}%` : "",
      trend: weightChange !== null && weightChange < 0 ? "down" : "up",
      icon: Scale,
      color: "primary",
    },
    {
      label: "Workouts",
      value: totalWorkouts.toString(),
      change: `total`,
      trend: "up",
      icon: Dumbbell,
      color: "secondary",
    },
    {
      label: "Posture Score",
      value: profile?.posture_score || 50,
      change: postureStats.improvement !== null ? `${postureStats.improvement > 0 ? "+" : ""}${postureStats.improvement}` : "",
      trend: "up",
      icon: Target,
      color: "accent",
    },
    {
      label: "Streak",
      value: `${streak} day${streak !== 1 ? "s" : ""}`,
      change: streak > 0 ? "🔥" : "",
      trend: "up",
      icon: Calendar,
      color: "neon-orange",
    },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(240, 10%, 6%)",
    border: "1px solid hsl(240, 6%, 20%)",
    borderRadius: "8px",
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
      <p>{message}</p>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your fitness journey and see how far you've come
          </p>
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
                          <Badge
                            variant="outline"
                            className={stat.trend === "up" ? "text-accent" : "text-primary"}
                          >
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

        {/* Charts */}
        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="posture">Posture</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          {/* Weight Tab */}
          <TabsContent value="weight">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Weight Trend</CardTitle>
                  <CardDescription>Your weight over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {weightData.length === 0 ? (
                      <EmptyState message="No weight logs yet. Log your weight to see trends." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weightData}>
                          <defs>
                            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                          <XAxis dataKey="date" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                          <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="weight" stroke="hsl(199, 89%, 48%)" fill="url(#weightGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>BMI Progress</CardTitle>
                  <CardDescription>Calculated from your weight and height</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {bmiData.length === 0 ? (
                      <EmptyState message="Log weight and set your height to see BMI trends." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bmiData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                          <XAxis dataKey="date" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                          <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" dataKey="bmi" stroke="hsl(271, 81%, 56%)" strokeWidth={2} dot={{ fill: "hsl(271, 81%, 56%)", strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Posture Tab */}
          <TabsContent value="posture">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Posture Score Improvement</CardTitle>
                <CardDescription>Your posture score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {postureChartData.length === 0 ? (
                    <EmptyState message="No posture assessments yet. Do a posture check to start tracking." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={postureChartData}>
                        <defs>
                          <linearGradient id="postureGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                        <XAxis dataKey="date" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="score" stroke="hsl(142, 76%, 36%)" fill="url(#postureGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Weekly Workout Minutes</CardTitle>
                <CardDescription>Your exercise duration this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                      <XAxis dataKey="day" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <YAxis stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="minutes" fill="hsl(271, 81%, 56%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Calorie Intake This Week</CardTitle>
                <CardDescription>How well you're meeting your nutrition targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={caloriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                      <XAxis dataKey="day" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <YAxis stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="consumed" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Consumed" />
                      <Bar dataKey="goal" fill="hsl(240, 6%, 30%)" radius={[4, 4, 0, 0]} name="Goal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
