import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useDailyTasks } from "@/hooks/useDailyTasks";
import { useStreak } from "@/hooks/useStreak";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useMealHistory } from "@/hooks/useMealHistory";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import AppLayout from "@/components/layout/AppLayout";
import WeightLogDialog from "@/components/weight/WeightLogDialog";
import CompletionTick from "@/components/ui/completion-tick";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import CategoryBadge from "@/components/ui/category-badge";
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
  CheckCircle2,
} from "lucide-react";
import { getBMICategory, getPostureScoreDescription } from "@/lib/health-utils";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();
  const { tasks, isLoading: tasksLoading, toggleTask, seedDefaultTasks } = useDailyTasks();
  const { streak } = useStreak();
  const { totalWorkouts, thisMonthWorkouts } = useWorkoutHistory();
  const { mealLogs } = useMealHistory();
  const { stats: postureStats } = usePostureHistory();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [profile, isLoading, navigate]);

  useEffect(() => {
    if (!tasksLoading && tasks.length === 0 && profile?.onboarding_completed) {
      seedDefaultTasks.mutate();
    }
  }, [tasksLoading, tasks.length, profile?.onboarding_completed]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) return null;

  const bmiCategory = profile.bmi ? getBMICategory(profile.bmi) : null;
  const postureInfo = getPostureScoreDescription(profile.posture_score);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Activity summary from real data
  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = (mealLogs || []).filter((l) => l.logged_at.startsWith(todayStr)).length;
  const todayCalories = (mealLogs || []).filter((l) => l.logged_at.startsWith(todayStr)).reduce((s, l) => s + (l.calories || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase relative" style={{
                fontFamily: "'Work Sans', system-ui, sans-serif",
                letterSpacing: '6px',
              }}>
                {/* Backlight glow layer */}
                <span className="absolute inset-0 blur-xl opacity-60 pointer-events-none" aria-hidden="true" style={{
                  background: 'linear-gradient(90deg, hsl(25 100% 50% / 0.4), hsl(260 80% 50% / 0.3), hsl(187 100% 50% / 0.4), hsl(330 80% 50% / 0.3), hsl(25 100% 50% / 0.4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>{`Hi There ! ${(profile.username || 'CHAMP').toUpperCase()}`}</span>
                
                {/* "Hi There !" - frosty glass, silver metallic */}
                {'Hi There ! '.split('').map((letter, i) => {
                  if (letter === ' ') return <span key={`ht-${i}`}>&nbsp;</span>;
                  return (
                    <span key={`ht-${i}`} className="relative inline-block text-2xl md:text-3xl font-black" style={{
                      WebkitTextFillColor: 'transparent',
                      WebkitTextStroke: '1.5px hsl(220 20% 75% / 0.8)',
                      filter: 'drop-shadow(0 0 10px hsl(220 20% 70% / 0.5)) drop-shadow(0 0 20px hsl(220 15% 60% / 0.3))',
                    }}>{letter}</span>
                  );
                })}

                {/* Username - each letter frosty glass with colored backlight */}
                {(() => {
                  const displayName = (profile.username || 'CHAMP').toUpperCase();
                  const glowPalette = [
                    'hsl(187 100% 50% / 0.7)',
                    'hsl(260 80% 55% / 0.7)',
                    'hsl(25 100% 55% / 0.7)',
                  ];
                  const strokePalette = [
                    'hsl(187 100% 70% / 0.7)',
                    'hsl(260 80% 70% / 0.7)',
                    'hsl(25 100% 70% / 0.7)',
                  ];
                  const len = displayName.replace(/\s/g, '').length;
                  const sectionSize = Math.ceil(len / 3);
                  let charIndex = 0;
                  return displayName.split('').map((letter, i) => {
                    if (letter === ' ') return <span key={`u-${i}`}>&nbsp;</span>;
                    const ci = Math.min(Math.floor(charIndex / sectionSize), 2);
                    charIndex++;
                    return (
                      <span key={`u-${i}`} className="relative inline-block" style={{
                        WebkitTextFillColor: 'transparent',
                        WebkitTextStroke: `1.5px ${strokePalette[ci]}`,
                        filter: `drop-shadow(0 0 12px ${glowPalette[ci]}) drop-shadow(0 0 25px ${glowPalette[ci]})`,
                      }}>{letter}</span>
                    );
                  });
                })()}
              </h1>
            <p className="text-muted-foreground mt-1">Here's your fitness overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <WeightLogDialog />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Zap className="h-4 w-4 text-neon-orange" />
              <span className="text-sm font-medium">{streak > 0 ? `${streak} day streak` : "No streak yet"}</span>
              {streak > 0 && <span className="text-lg">🔥</span>}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* BMI - combined Activity + Heart */}
          <Card className="glass border-primary/20 transition-all duration-300 shadow-[0_4px_25px_hsl(187_100%_50%/0.25)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/15 shadow-[0_0_20px_hsl(187_100%_50%/0.3)]">
                  <div className="relative">
                    <Activity className="h-7 w-7 text-primary" strokeWidth={1.5} />
                    <Heart className="h-3.5 w-3.5 text-neon-pink absolute -bottom-0.5 -right-1" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="text-2xl font-bold">{profile.bmi || "--"}</p>
                  {bmiCategory && <Badge variant="outline" className="mt-1 text-xs">{bmiCategory.label}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workouts - green */}
          <Card className="glass border-neon-green/20 transition-all duration-300 shadow-[0_4px_25px_hsl(160_80%_45%/0.25)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-neon-green/15 shadow-[0_0_20px_hsl(160_80%_45%/0.3)]">
                  <Dumbbell className="h-7 w-7 text-neon-green" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                  <p className="text-2xl font-bold">{thisMonthWorkouts}</p>
                  <p className="text-xs text-muted-foreground">this month ({totalWorkouts} total)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meals - orange */}
          <Card className="glass border-neon-orange/20 transition-all duration-300 shadow-[0_4px_25px_hsl(25_100%_50%/0.25)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-neon-orange/15 shadow-[0_0_20px_hsl(25_100%_50%/0.3)]">
                  <Utensils className="h-7 w-7 text-neon-orange" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Meals</p>
                  <p className="text-2xl font-bold">{todayMeals}</p>
                  <p className="text-xs text-muted-foreground">{todayCalories} cal logged</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posture - spine-like, deep neon */}
          <Card className="glass border-neon-purple/20 transition-all duration-300 shadow-[0_4px_25px_hsl(260_80%_55%/0.25)]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-neon-purple/15 shadow-[0_0_20px_hsl(260_80%_55%/0.3)]">
                  {/* Spine-like vertical icon */}
                  <div className="flex flex-col items-center gap-[2px] h-7 w-7 justify-center">
                    {[5, 6.5, 7.5, 7, 5.5, 4].map((w, i) => (
                      <div
                        key={i}
                        className="rounded-full bg-neon-purple"
                        style={{
                          width: `${w * 2.5}px`,
                          height: '3px',
                          opacity: 0.7 + (i < 3 ? i * 0.1 : (5 - i) * 0.1),
                          boxShadow: '0 0 6px hsl(260 80% 55% / 0.6)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posture</p>
                  <p className="text-2xl font-bold">{postureStats.latestScore ?? profile.posture_score}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{postureInfo.label}</Badge>
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
                  {completedTasks} of {tasks.length} completed
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
                {tasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      task.completed
                        ? "bg-accent/5 border-accent/20"
                        : "bg-muted/30 border-border hover:border-primary/50"
                    )}
                  >
                    <CompletionTick
                      completed={!!task.completed}
                      onToggle={() => toggleTask.mutate({ id: task.id, completed: !task.completed })}
                      category={(task.category as any) || "workout"}
                    />
                    <span className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>
                      {task.title}
                    </span>
                    <CategoryBadge category={task.category || "other"} />
                  </div>
                ))}
                {tasks.length > 6 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/plans")} className="w-full text-muted-foreground">
                    +{tasks.length - 6} more tasks
                  </Button>
                )}
                {tasksLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="glass border-primary/20 cursor-pointer hover:glow-blue transition-all duration-300" onClick={() => navigate("/posture")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 shadow-[0_0_15px_hsl(187_100%_50%/0.2)]">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Posture Check</h3>
                    <p className="text-sm text-muted-foreground">
                      {postureStats.totalAssessments} assessments done
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-neon-green/20 cursor-pointer hover:glow-green transition-all duration-300" onClick={() => navigate("/plans")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-neon-green/10 shadow-[0_0_15px_hsl(160_80%_45%/0.2)]">
                    <Dumbbell className="h-8 w-8 text-neon-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Today's Workout</h3>
                    <p className="text-sm text-muted-foreground">View your plan</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neon-green/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-secondary/20 cursor-pointer hover:glow-purple transition-all duration-300" onClick={() => navigate("/plans")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10 shadow-[0_0_15px_hsl(260_60%_55%/0.2)]">
                    <Utensils className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Meal Plan</h3>
                    <p className="text-sm text-muted-foreground">Check today's meals</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-neon-pink/20 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_hsl(330_81%_60%/0.3)]" onClick={() => navigate("/progress")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-neon-pink/10 shadow-[0_0_15px_hsl(330_81%_60%/0.2)]">
                    <TrendingUp className="h-8 w-8 text-neon-pink" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">View Progress</h3>
                    <p className="text-sm text-muted-foreground">Track your journey</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neon-pink/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Summary */}
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
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Today's Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {completedTasks}/{tasks.length} tasks done
                    </p>
                  </div>
                </div>
                <Badge className={cn(
                  taskProgress === 100 ? "bg-neon-green/20 text-neon-green" : ""
                )}>
                  {taskProgress === 100 ? "All Done! 🎉" : `${Math.round(taskProgress)}%`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
