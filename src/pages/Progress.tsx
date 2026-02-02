import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

// Mock data for charts
const weightData = [
  { date: "Jan 1", weight: 75 },
  { date: "Jan 8", weight: 74.5 },
  { date: "Jan 15", weight: 74.2 },
  { date: "Jan 22", weight: 73.8 },
  { date: "Jan 29", weight: 73.5 },
  { date: "Feb 5", weight: 73.2 },
  { date: "Feb 12", weight: 72.8 },
];

const bmiData = [
  { date: "Week 1", bmi: 25.4 },
  { date: "Week 2", bmi: 25.2 },
  { date: "Week 3", bmi: 25.0 },
  { date: "Week 4", bmi: 24.8 },
  { date: "Week 5", bmi: 24.5 },
  { date: "Week 6", bmi: 24.3 },
];

const postureData = [
  { date: "Week 1", score: 45 },
  { date: "Week 2", score: 52 },
  { date: "Week 3", score: 58 },
  { date: "Week 4", score: 62 },
  { date: "Week 5", score: 68 },
  { date: "Week 6", score: 72 },
];

const workoutData = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 30 },
  { day: "Wed", minutes: 60 },
  { day: "Thu", minutes: 0 },
  { day: "Fri", minutes: 45 },
  { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 30 },
];

const caloriesData = [
  { day: "Mon", consumed: 1850, goal: 2000 },
  { day: "Tue", consumed: 2100, goal: 2000 },
  { day: "Wed", consumed: 1920, goal: 2000 },
  { day: "Thu", consumed: 1780, goal: 2000 },
  { day: "Fri", consumed: 2050, goal: 2000 },
  { day: "Sat", consumed: 2200, goal: 2000 },
  { day: "Sun", consumed: 1900, goal: 2000 },
];

export default function Progress() {
  const { profile } = useProfile();

  const stats = [
    {
      label: "Weight Lost",
      value: "2.2 kg",
      change: "-2.9%",
      trend: "down",
      icon: Scale,
      color: "primary",
    },
    {
      label: "Workouts",
      value: "24",
      change: "+8",
      trend: "up",
      icon: Dumbbell,
      color: "secondary",
    },
    {
      label: "Posture Score",
      value: profile?.posture_score || 50,
      change: "+27",
      trend: "up",
      icon: Target,
      color: "accent",
    },
    {
      label: "Streak",
      value: "7 days",
      change: "🔥",
      trend: "up",
      icon: Calendar,
      color: "neon-orange",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
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
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">{stat.value}</p>
                      <Badge
                        variant="outline"
                        className={stat.trend === "up" ? "text-accent" : "text-primary"}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                  <CardDescription>Your weight over the past 6 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
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
                        <YAxis
                          domain={["dataMin - 1", "dataMax + 1"]}
                          stroke="hsl(240, 5%, 64.9%)"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(240, 10%, 6%)",
                            border: "1px solid hsl(240, 6%, 20%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(199, 89%, 48%)"
                          fill="url(#weightGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>BMI Progress</CardTitle>
                  <CardDescription>Your BMI changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bmiData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                        <XAxis dataKey="date" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                        <YAxis
                          domain={["dataMin - 0.5", "dataMax + 0.5"]}
                          stroke="hsl(240, 5%, 64.9%)"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(240, 10%, 6%)",
                            border: "1px solid hsl(240, 6%, 20%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="bmi"
                          stroke="hsl(271, 81%, 56%)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(271, 81%, 56%)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
                <CardDescription>Your posture score over the past 6 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={postureData}>
                      <defs>
                        <linearGradient id="postureGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                      <XAxis dataKey="date" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(240, 10%, 6%)",
                          border: "1px solid hsl(240, 6%, 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(142, 76%, 36%)"
                        fill="url(#postureGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(240, 10%, 6%)",
                          border: "1px solid hsl(240, 6%, 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="minutes"
                        fill="hsl(271, 81%, 56%)"
                        radius={[4, 4, 0, 0]}
                      />
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
                <CardTitle>Calorie Intake vs Goal</CardTitle>
                <CardDescription>How well you're meeting your nutrition targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={caloriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" />
                      <XAxis dataKey="day" stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <YAxis stroke="hsl(240, 5%, 64.9%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(240, 10%, 6%)",
                          border: "1px solid hsl(240, 6%, 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="consumed"
                        fill="hsl(199, 89%, 48%)"
                        radius={[4, 4, 0, 0]}
                        name="Consumed"
                      />
                      <Bar
                        dataKey="goal"
                        fill="hsl(240, 6%, 30%)"
                        radius={[4, 4, 0, 0]}
                        name="Goal"
                      />
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
