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
  const { assessments, isLoading, stats } = usePostureHistory();

  if (isLoading) {
    return (
      <Card className="glass">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTrend = () => {
    if (stats.improvement === null) return null;
    
    if (stats.improvement > 0) {
      return (
        <div className="flex items-center gap-1 text-accent">
          <TrendingUp className="h-4 w-4" />
          <span>+{stats.improvement} pts</span>
        </div>
      );
    } else if (stats.improvement < 0) {
      return (
        <div className="flex items-center gap-1 text-destructive">
          <TrendingDown className="h-4 w-4" />
          <span>{stats.improvement} pts</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span>No change</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Current Score</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats.latestScore ?? "--"}
            </div>
            <div className="text-xs mt-1">{renderTrend()}</div>
          </CardContent>
        </Card>

        <Card className="glass border-secondary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs">Best Score</span>
            </div>
            <div className="text-2xl font-bold text-secondary">
              {stats.bestScore || "--"}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <History className="h-4 w-4" />
              <span className="text-xs">Total Assessments</span>
            </div>
            <div className="text-2xl font-bold text-accent">
              {stats.totalAssessments}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Average Score</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.averageScore || "--"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart & History */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Progress Chart</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Score Trend</CardTitle>
              <CardDescription>Your posture score over time</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.weeklyProgress.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                        className="text-xs"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => format(new Date(value), "MMMM d, yyyy")}
                        formatter={(value: number) => [`${value} pts`, "Score"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>Complete more assessments to see your progress chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Recent Assessments</CardTitle>
              <CardDescription>Your posture assessment history</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments && assessments.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {assessments.slice(0, 10).map((assessment) => {
                    const info = getPostureScoreDescription(assessment.score);
                    return (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{assessment.score}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{info.label}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {assessment.assessment_type || "assessment"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(assessment.assessed_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <Progress value={assessment.score} className="w-20 h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No assessments yet</p>
                  <p className="text-sm">Complete your first posture assessment to start tracking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
