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
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* LAYER 0: ANATOMICAL ANCHOR */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <img 
          src="/spine-dna-bg.png" 
          alt="" 
          className="w-full h-full object-contain opacity-[0.05] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen filter brightness-[0.8] contrast-[1.2]"
        />
      </div>

      <AppLayout>
        <div className="relative z-10 space-y-8 stagger-children pb-20 px-0">
          {/* Instagram-CLI Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 antialiased">
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-zinc-500">
                <span className="text-cyan-600 dark:text-cyan-400">@{profile.username?.toLowerCase() || 'arnab'}</span>
                <span className="text-slate-400 dark:text-zinc-600">~</span>
                <span>$ ./posfitx --status</span>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="text-5xl font-black font-mono tracking-tighter uppercase subpixel-antialiased"
                style={{
                  background: 'linear-gradient(to right, #0891b2, #c026d3, #ea580c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(3px 3px 0px rgba(34, 211, 238, 0.4))'
                }}
              >
                {(profile.username || 'ARNAB007').toUpperCase()}
              </motion.h1>
              <p className="font-mono text-sm text-slate-500 dark:text-zinc-500 mt-2">System online. Waiting for biometric sync...</p>
            </div>
            <div className="flex items-center gap-3">
              <WeightLogDialog />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-900 dark:text-cyan-50">{streak > 0 ? `${streak} DAY STREAK` : "NO STREAK"}</span>
                {streak > 0 && <span>🔥</span>}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {/* BMI */}
            <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 hover:border-cyan-500/50 transition-all duration-300 hover-lift group shadow-sm dark:shadow-none">
              <CardContent className="pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                    <div className="relative">
                      <Activity className="h-7 w-7 text-cyan-600 dark:text-cyan-400 z-10 antialiased" strokeWidth={1.5} />
                      <Heart className="h-3.5 w-3.5 text-pink-500 absolute -bottom-0.5 -right-1 z-10 antialiased" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-black tracking-widest">BMI</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{profile.bmi || "--"}</p>
                    {bmiCategory && <Badge variant="outline" className="mt-1 text-[10px] border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">{bmiCategory.label}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workouts */}
            <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 hover:border-emerald-500/50 transition-all duration-300 hover-lift group shadow-sm dark:shadow-none">
              <CardContent className="pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                    <Dumbbell className="h-7 w-7 text-emerald-600 dark:text-emerald-400 z-10 antialiased" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-black tracking-widest">Workouts</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{thisMonthWorkouts}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500">THIS MONTH</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals */}
            <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 hover:border-orange-500/50 transition-all duration-300 hover-lift group shadow-sm dark:shadow-none">
              <CardContent className="pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform">
                    <Utensils className="h-7 w-7 text-orange-600 dark:text-orange-400 z-10 antialiased" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-black tracking-widest">Meals</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{todayMeals}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500">{todayCalories} KCAL</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posture */}
            <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 hover:border-cyan-500/50 transition-all duration-300 hover-lift group shadow-sm dark:shadow-none" onClick={() => navigate("/posture")}>
              <CardContent className="pt-6 px-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                    <div className="flex flex-col items-center gap-[2px] h-7 w-7 justify-center z-10 antialiased">
                      {[5, 6.5, 7.5, 7, 5.5, 4].map((w, i) => (
                        <div
                          key={i}
                          className="rounded-full bg-cyan-600 dark:bg-cyan-400"
                          style={{
                            width: `${w * 2.5}px`,
                            height: '2.5px',
                            opacity: 0.8,
                            boxShadow: '0 0 6px rgba(34, 211, 238, 0.6)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-black tracking-widest">Posture</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{postureScore}</p>
                    <Badge variant="outline" className="mt-1 text-[10px] border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">{postureInfo.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Today's Tasks */}
            <Card className="lg:col-span-2 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 shadow-xl dark:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-cyan-50 antialiased">
                    <CheckCircle2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400 z-10" />
                    DAILY PROTOCOL
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-zinc-500">{completedTasks} of {tasks.length} SYNCED</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white" onClick={() => navigate("/plans")}>
                  INTERFACE <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <Progress value={taskProgress} className="h-1.5 mb-6 bg-slate-100 dark:bg-zinc-900 [&>div]:bg-cyan-500" />
                <div className="space-y-4">
                  {tasks.slice(0, 6).map((task) => (
                    <div key={task.id} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all duration-300", task.completed ? "bg-slate-50 dark:bg-zinc-900/40 border-slate-100 dark:border-zinc-800/30 opacity-60" : "bg-white dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800/50 shadow-sm hover:border-cyan-500/40 group")}>
                      <CompletionTick 
                        completed={!!task.completed} 
                        onToggle={() => toggleTask.mutate({ id: task.id, completed: !task.completed })} 
                        category={(task.category as "workout" | "meal" | "sleep" | "health" | "posture" | "hydration" | "wellness") || "workout"} 
                      />
                      <span className={cn("flex-1 text-sm font-medium tracking-wide", task.completed ? "line-through text-slate-400 dark:text-zinc-500" : "text-slate-700 dark:text-zinc-200")}>{task.title}</span>
                      <CategoryBadge category={task.category || "other"} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions HUD */}
            <div className="space-y-4 stagger-children">
              <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 cursor-pointer transition-all duration-300 hover-lift group active:scale-[0.98] shadow-sm" onClick={() => navigate("/posture")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                      <Target className="h-8 w-8 text-cyan-600 dark:text-cyan-400 z-10 antialiased" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-cyan-50 uppercase tracking-widest">POSTURE LAB</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">LAUNCH AI INTERFACE</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-cyan-600/60 dark:text-cyan-400/60 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 cursor-pointer transition-all duration-300 hover-lift group active:scale-[0.98] shadow-sm" onClick={() => navigate("/plans")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                      <Dumbbell className="h-8 w-8 text-emerald-600 dark:text-emerald-400 z-10 antialiased" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-emerald-50 uppercase tracking-widest">WORKOUT PLAN</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">VIEW ACTIVE PLAN</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-emerald-600/60 dark:text-emerald-400/60 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 cursor-pointer transition-all duration-300 hover-lift group active:scale-[0.98] shadow-sm" onClick={() => navigate("/plans")}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:scale-110 transition-transform">
                      <Utensils className="h-8 w-8 text-orange-600 dark:text-orange-400 z-10 antialiased" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-orange-50 uppercase tracking-widest">MEAL PLAN</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">SYNC NUTRITION DATA</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-orange-600/60 dark:text-orange-400/60 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Goal HUD */}
              <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-slate-200 dark:border-zinc-800/50 p-6 shadow-xl dark:shadow-2xl">
                <div className="flex items-center gap-5">
                   <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <Moon className="h-6 w-6 text-purple-600 dark:text-purple-400 z-10 antialiased" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">Circadian Cycle</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-purple-50">{profile.sleep_hours || 8}H OBJECTIVE</p>
                   </div>
                   <Heart className="h-5 w-5 text-pink-500/40 animate-pulse z-10 antialiased" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
