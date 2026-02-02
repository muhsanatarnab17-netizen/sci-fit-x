import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Flame,
  Target,
  Dumbbell,
  Utensils,
  Moon,
  TrendingUp,
  ChevronRight,
  Zap,
  Heart,
  Loader2,
} from "lucide-react";
import { getBMICategory, getPostureScoreDescription } from "@/lib/health-utils";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return null;
  }

  const bmiCategory = profile.bmi ? getBMICategory(profile.bmi) : null;
  const postureInfo = getPostureScoreDescription(profile.posture_score);

  // Mock data for demo
  const todaysTasks = [
    { id: 1, title: "Morning Stretches", category: "workout", completed: true },
    { id: 2, title: "Drink 8 glasses of water", category: "hydration", completed: false },
    { id: 3, title: "Log breakfast", category: "meal", completed: false },
    { id: 4, title: "Posture check", category: "posture", completed: false },
  ];

  const completedTasks = todaysTasks.filter((t) => t.completed).length;
  const taskProgress = (completedTasks / todaysTasks.length) * 100;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Welcome back, <span className="gradient-text">{profile.full_name?.split(" ")[0] || "Champion"}</span>! 💪
            </h1>
            <p className="text-muted-foreground mt-1">Here's your fitness overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Zap className="h-4 w-4 text-neon-orange" />
              <span className="text-sm font-medium">7 day streak</span>
              <span className="text-lg">🔥</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass border-primary/20 hover:glow-blue transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="text-2xl font-bold">{profile.bmi || "--"}</p>
                  {bmiCategory && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {bmiCategory.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-secondary/20 hover:glow-purple transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Flame className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMR</p>
                  <p className="text-2xl font-bold">{profile.bmr || "--"}</p>
                  <p className="text-xs text-muted-foreground">cal/day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-accent/20 hover:glow-green transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Goal</p>
                  <p className="text-2xl font-bold">{profile.daily_calorie_goal || "--"}</p>
                  <p className="text-xs text-muted-foreground">calories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-neon-orange/20 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-orange/10">
                  <Heart className="h-5 w-5 text-neon-orange" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posture</p>
                  <p className="text-2xl font-bold">{profile.posture_score}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {postureInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-2 glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>
                  {completedTasks} of {todaysTasks.length} completed
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/plans")}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <Progress value={taskProgress} className="h-2 mb-4" />
              <div className="space-y-3">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      task.completed
                        ? "bg-accent/5 border-accent/20"
                        : "bg-muted/30 border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        task.completed
                          ? "border-accent bg-accent"
                          : "border-muted-foreground"
                      )}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {task.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card
              className="glass border-primary/20 cursor-pointer hover:glow-blue transition-all duration-300"
              onClick={() => navigate("/posture")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Posture Check</h3>
                    <p className="text-sm text-muted-foreground">Start AI analysis</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="glass border-accent/20 cursor-pointer hover:glow-green transition-all duration-300"
              onClick={() => navigate("/plans")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
                    <Dumbbell className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Today's Workout</h3>
                    <p className="text-sm text-muted-foreground">View your plan</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="glass border-secondary/20 cursor-pointer hover:glow-purple transition-all duration-300"
              onClick={() => navigate("/plans")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-neon-pink/20">
                    <Utensils className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Meal Plan</h3>
                    <p className="text-sm text-muted-foreground">Check today's meals</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card
              className="glass border-neon-purple/20 cursor-pointer transition-all duration-300"
              onClick={() => navigate("/progress")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20">
                    <TrendingUp className="h-8 w-8 text-neon-purple" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">View Progress</h3>
                    <p className="text-sm text-muted-foreground">Track your journey</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sleep & Water Reminder */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-neon-purple/10">
                    <Moon className="h-6 w-6 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sleep Goal</h3>
                    <p className="text-sm text-muted-foreground">
                      Target: {profile.sleep_hours || 8} hours tonight
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{profile.sleep_hours || 8}h</p>
                  <p className="text-xs text-muted-foreground">recommended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Activity Level</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile.activity_level?.replace("_", " ") || "Not set"}
                    </p>
                  </div>
                </div>
                <Badge className="capitalize">
                  {profile.workout_experience || "beginner"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
