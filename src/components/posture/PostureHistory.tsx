import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Award, History } from "lucide-react";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { getPostureScoreDescription } from "@/lib/health-utils";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PostureHistory() {
  const { assessments, isLoading, stats, weeklyChart } = usePostureHistory();

  if (isLoading) {
    return (
      <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-zinc-500 font-bold tracking-widest">SYNCING DATA...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTrend = () => {
    if (stats.improvement === null) return null;
    
    if (stats.improvement > 0) {
      return (
        <div className="flex items-center gap-1 text-emerald-400 font-bold antialiased">
          <TrendingUp className="h-4 w-4" />
          <span>+{stats.improvement} PTS</span>
        </div>
      );
    } else if (stats.improvement < 0) {
      return (
        <div className="flex items-center gap-1 text-rose-400 font-bold antialiased">
          <TrendingDown className="h-4 w-4" />
          <span>{stats.improvement} PTS</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-zinc-500 font-bold">
        <Minus className="h-4 w-4" />
        <span>NO CHANGE</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 antialiased">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <Target className="h-4 w-4 text-cyan-400" />
              <span>Current Score</span>
            </div>
            <div className="text-3xl font-black text-cyan-50">
              {stats.latestScore ?? "--"}
            </div>
            <div className="mt-2">{renderTrend()}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <Award className="h-4 w-4 text-cyan-400" />
              <span>Best Score</span>
            </div>
            <div className="text-3xl font-black text-cyan-50">
              {stats.bestScore || "--"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <History className="h-4 w-4 text-cyan-400" />
              <span>Assessments</span>
            </div>
            <div className="text-3xl font-black text-cyan-50">
              {stats.totalAssessments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 text-zinc-500 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span>Average Index</span>
            </div>
            <div className="text-3xl font-black text-cyan-50">
              {stats.averageScore || "--"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart & History */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/40 border border-zinc-800/50 p-1 mb-6">
          <TabsTrigger value="chart" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-zinc-950 font-bold uppercase tracking-widest">BIOMETRIC TREND</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-zinc-950 font-bold uppercase tracking-widest">LOG HISTORY</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-0">
          <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 shadow-2xl">
            <CardHeader className="pb-8">
              <CardTitle className="text-xl text-cyan-50 uppercase tracking-widest font-bold antialiased">Score Propagation</CardTitle>
              <CardDescription className="text-zinc-500">Longitudinal biometric alignment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyChart && weeklyChart.length > 0 ? (
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                        className="text-[10px] font-bold text-zinc-600 uppercase"
                        stroke="#4b5563"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        className="text-[10px] font-bold text-zinc-600"
                        stroke="#4b5563"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#050505",
                          border: "1px solid #27272a",
                          borderRadius: "12px",
                          boxShadow: "0 0 20px rgba(0,0,0,0.5)"
                        }}
                        labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                        itemStyle={{ color: "#22d3ee", fontWeight: "bold", fontSize: "12px" }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#22d3ee" 
                        strokeWidth={3}
                        dot={{ fill: "#22d3ee", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 8, stroke: "#050505", strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-zinc-600 space-y-4">
                  <Activity className="h-12 w-12 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm">Insufficient data for trend propagation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="bg-[#0a0a0a]/80 backdrop-blur-md border border-zinc-800/50 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl text-cyan-50 uppercase tracking-widest font-bold antialiased">Biometric Archive</CardTitle>
              <CardDescription className="text-zinc-500">Historical alignment capture data</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments && assessments.length > 0 ? (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                  {assessments.slice(0, 10).map((assessment) => {
                    const info = getPostureScoreDescription(assessment.score);
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xl font-black text-cyan-400">{assessment.score}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-zinc-100 tracking-wide">{info.label.toUpperCase()}</span>
                              <Badge variant="outline" className="text-[9px] uppercase font-black border-zinc-800 text-zinc-500 px-2 py-0">
                                {assessment.assessment_type?.replace("_", " ") || "SCAN"}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                              {format(new Date(assessment.assessed_at), "MMM d, yyyy • HH:mm")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <Progress value={assessment.score} className="w-24 h-1.5 bg-zinc-800 [&>div]:bg-cyan-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-600">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest">Archive Empty</p>
                  <p className="text-xs mt-2">Initialize scan to begin biometric logging</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
