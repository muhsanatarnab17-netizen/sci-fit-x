import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Target,
  Dumbbell,
  Utensils,
  TrendingUp,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Heart,
  Moon
} from "lucide-react";
import { getBMICategory, getPostureScoreDescription } from "@/lib/health-utils";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();
  const { tasks, isLoading: tasksLoading, toggleTask, seedDefaultTasks } = useDailyTasks();
  const { streak } = useStreak();
  const { thisMonthWorkouts } = useWorkoutHistory();
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
  }, [tasksLoading, tasks.length, profile?.onboarding_completed, seedDefaultTasks]);

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
  const postureScore = postureStats?.latestScore ?? profile.posture_score ?? 0;
  const postureInfo = getPostureScoreDescription(postureScore);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = (mealLogs || []).filter((l) => l.logged_at.startsWith(todayStr)).length;
  const todayCalories = (mealLogs || []).filter((l) => l.logged_at.startsWith(todayStr)).reduce((s, l) => s + (l.calories || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-8 stagger-children pb-20">
        {/* Instagram-CLI Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
              <span className="text-orange-500">@{profile.username?.toLowerCase() || 'arnab'}</span>
              <span className="text-gray-600">~</span>
              <span>$ ./posfitx --status</span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="text-5xl font-black font-mono tracking-tighter uppercase"
              style={{
                background: 'linear-gradient(to right, #6366f1, #d946ef, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(3px 3px 0px rgba(217, 70, 239, 0.4)) drop-shadow(-2px -2px 0px rgba(99, 102, 241, 0.4))'
              }}
            >
              {(profile.username || 'ARNAB007').toUpperCase()}
            </motion.h1>
            <p className="font-mono text-sm text-gray-400 mt-2">System online. Waiting for input...</p>
          </div>
          <div className="flex items-center gap-3">
            <WeightLogDialog />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium">{streak > 0 ? `${streak} day streak` : "No streak yet"}</span>
              {streak > 0 && <span>🔥</span>}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 stagger-children">
          {/* BMI - combined Activity + Heart */}
          <Card className="glass hover-lift hover-glow-blue border-primary/20 transition-all duration-300 shadow-[0_4px_25px_hsl(187_100%_50%/0.25)]">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/15 shadow-[0_0_20px_hsl(187_100%_50%/0.3)]">
                  <div className="relative">
                    <Activity className="h-5 w-5 sm:h-7 sm:w-7 text-primary" strokeWidth={1.5} />
                    <Heart className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-neon-pink absolute -bottom-0.5 -right-1" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase font-black">BMI</p>
                  <p className="text-xl sm:text-2xl font-bold">{profile.bmi || "--"}</p>
                  {bmiCategory && <Badge variant="outline" className="mt-1 text-xs">{bmiCategory.label}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workouts - green */}
          <Card className="glass hover-lift hover-glow-green border-neon-green/20 transition-all duration-300 shadow-[0_4px_25px_hsl(160_80%_45%/0.25)]">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-neon-green/15 shadow-[0_0_20px_hsl(160_80%_45%/0.3)]">
                  <Dumbbell className="h-5 w-5 sm:h-7 sm:w-7 text-neon-green" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase font-black">Workouts</p>
                  <p className="text-xl sm:text-2xl font-bold">{thisMonthWorkouts}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground opacity-70">this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meals - orange */}
          <Card className="glass hover-lift hover-glow-orange border-neon-orange/20 transition-all duration-300 shadow-[0_4px_25px_hsl(25_100%_50%/0.25)]">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-neon-orange/15 shadow-[0_0_20px_hsl(25_100%_50%/0.3)]">
                  <Utensils className="h-5 w-5 sm:h-7 sm:w-7 text-neon-orange" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase font-black">Meals</p>
                  <p className="text-xl sm:text-2xl font-bold">{todayMeals}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground opacity-70">{todayCalories} kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posture - spine-like, deep neon */}
          <Card className="glass hover-lift hover-glow-purple border-neon-purple/20 transition-all duration-300 shadow-[0_4px_25px_hsl(260_80%_55%/0.25)]">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl bg-neon-purple/15 shadow-[0_0_20px_hsl(260_80%_55%/0.3)]">
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
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase font-black">Posture</p>
                  <p className="text-xl sm:text-2xl font-bold">{postureScore}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs">{postureInfo.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-2 glass-elevated border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>{completedTasks} of {tasks.length} completed</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/plans")}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <Progress value={taskProgress} className="h-2 mb-4 bg-white/5" />
              <div className="space-y-3">
                {tasks.slice(0, 6).map((task) => (
                  <div key={task.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-all", task.completed ? "bg-accent/5 opacity-60" : "bg-muted/30 hover:border-primary/50")}>
                    <CompletionTick 
                      completed={!!task.completed} 
                      onToggle={() => toggleTask.mutate({ id: task.id, completed: !task.completed })} 
                      category={(task.category as "workout" | "meal" | "sleep" | "health" | "posture" | "hydration" | "wellness") || "workout"} 
                    />
                    <span className={cn("flex-1 text-sm font-medium", task.completed && "line-through")}>{task.title}</span>
                    <CategoryBadge category={task.category || "other"} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4 stagger-children">
            <Card className="glass hover-lift hover-glow-blue border-primary/20 cursor-pointer transition-all duration-300 active:scale-[0.98]" onClick={() => navigate("/posture")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 shadow-[0_0_15px_hsl(187_100%_50%/0.2)]">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Posture Lab</h3>
                    <p className="text-sm text-muted-foreground">Start AI scan</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass hover-lift hover-glow-green border-neon-green/20 cursor-pointer transition-all duration-300 active:scale-[0.98]" onClick={() => navigate("/plans")}>
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

            <Card className="glass hover-lift hover-glow-orange border-neon-orange/20 cursor-pointer transition-all duration-300 active:scale-[0.98]" onClick={() => navigate("/plans")}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-neon-orange/10 shadow-[0_0_15px_hsl(25_100%_50%/0.2)]">
                    <Utensils className="h-8 w-8 text-neon-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Meal Plan</h3>
                    <p className="text-sm text-muted-foreground">Check today's meals</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neon-orange/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass hover-lift hover-glow-pink border-neon-pink/20 cursor-pointer transition-all duration-300 active:scale-[0.98]" onClick={() => navigate("/progress")}>
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

            {/* Sleep Goal Info */}
            <Card className="glass p-6 border-white/5">
                <div className="flex items-center gap-4">
                   <Moon className="h-6 w-6 text-neon-purple" />
                   <div className="flex-1">
                      <p className="text-xs font-black uppercase opacity-50">Sleep Goal</p>
                      <p className="text-xl font-bold">{profile.sleep_hours || 8} Hours</p>
                   </div>
                   <Heart className="h-4 w-4 text-neon-pink/40 animate-pulse" />
                </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
