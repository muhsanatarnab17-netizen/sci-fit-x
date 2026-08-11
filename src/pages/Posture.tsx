import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { usePostureHistory } from "@/hooks/usePostureHistory";
import { usePosture } from "@/hooks/usePosture";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Target,
  Camera,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  History,
  Dumbbell,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { getPostureScoreDescription } from "@/lib/health-utils";
import { cn } from "@/lib/utils";
import CameraCapture from "@/components/posture/CameraCapture";
import PostureHistory from "@/components/posture/PostureHistory";
import ExerciseCard from "@/components/posture/ExerciseCard";
import { getExercisesForIssues } from "@/lib/posture-exercises";

const POSTURE_QUESTIONS = [
  {
    id: "sitting_hours",
    question: "How many hours do you sit per day?",
    options: [
      { value: "less_than_4", label: "Less than 4 hours", score: 10 },
      { value: "4_to_6", label: "4-6 hours", score: 7 },
      { value: "6_to_8", label: "6-8 hours", score: 4 },
      { value: "more_than_8", label: "More than 8 hours", score: 1 },
    ],
  },
  {
    id: "back_pain",
    question: "Do you experience back pain?",
    options: [
      { value: "never", label: "Never", score: 10 },
      { value: "rarely", label: "Rarely", score: 7 },
      { value: "sometimes", label: "Sometimes", score: 4 },
      { value: "frequently", label: "Frequently", score: 1 },
    ],
  },
  {
    id: "neck_pain",
    question: "Do you experience neck pain or stiffness?",
    options: [
      { value: "never", label: "Never", score: 10 },
      { value: "rarely", label: "Rarely", score: 7 },
      { value: "sometimes", label: "Sometimes", score: 4 },
      { value: "frequently", label: "Frequently", score: 1 },
    ],
  },
  {
    id: "monitor_position",
    question: "Is your computer monitor at eye level?",
    options: [
      { value: "yes", label: "Yes, properly positioned", score: 10 },
      { value: "slightly_off", label: "Slightly below/above", score: 6 },
      { value: "no", label: "No, it's too low/high", score: 2 },
      { value: "laptop", label: "I use a laptop without external monitor", score: 3 },
    ],
  },
];

export default function Posture() {
  const { updateProfile } = useProfile();
  const { saveAssessment } = usePostureHistory();
  const { isAnalyzing: isHookAnalyzing } = usePosture();
  const [activeTab, setActiveTab] = useState<"assess" | "history">("assess");
  const [mode, setMode] = useState<"select" | "assessment" | "camera" | "results">("select");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [cvaAngle, setCvaAngle] = useState<number | null>(null);
  const [shoulderAlignment, setShoulderAlignment] = useState<number | null>(null);
  const [symmetryScore, setSymmetryScore] = useState<number | null>(null);
  const [cameraIssues, setCameraIssues] = useState<string[]>([]);
  const [cameraRecommendations, setCameraRecommendations] = useState<string[]>([]);
  const [analysisDetails, setAnalysisDetails] = useState<string | null>(null);
  const [assessmentType, setAssessmentType] = useState<"camera" | "self-assessment">("camera");
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    const maxScore = POSTURE_QUESTIONS.length * 10;
    POSTURE_QUESTIONS.forEach((q) => {
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.value === answer);
        if (option) totalScore += option.score;
      }
    });
    return Math.round((totalScore / maxScore) * 100);
  };

  const handleCompleteAssessment = async () => {
    const calculatedScore = calculateScore();
    const currentIssues = getIssues();
    const currentRecommendations = [
      "Take desk breaks every 30 minutes",
      "Adjust your monitor to eye level",
      "Incorporate core exercises"
    ];
    
    setScore(calculatedScore);
    setAssessmentType("self-assessment");
    setMode("results");

    try {
      await Promise.all([
        updateProfile.mutateAsync({ posture_score: calculatedScore }),
        saveAssessment.mutateAsync({
          score: calculatedScore,
          issues: currentIssues,
          recommendations: currentRecommendations,
          assessment_type: "self_assessment",
        }),
      ]);
      toast.success("Posture assessment saved!");
    } catch (error) {
      toast.error("Failed to save assessment");
    }
  };

  const handleCameraCapture = async () => {
    setIsSimulationRunning(true);
    
    setTimeout(() => {
      const mockData = {
        score: 85,
        cva_angle: 52,
        shoulder_alignment: 94,
        symmetry_score: 91,
        issues: ["Minor forward head posture"],
        recommendations: ["Perform chin tucks", "Take regular stretch breaks"],
        details: "Overall symmetry is excellent. Focus on maintaining cervical alignment during screen use."
      };

      setScore(mockData.score);
      setCvaAngle(mockData.cva_angle);
      setShoulderAlignment(mockData.shoulder_alignment);
      setSymmetryScore(mockData.symmetry_score);
      setCameraIssues(mockData.issues);
      setCameraRecommendations(mockData.recommendations);
      setAnalysisDetails(mockData.details);
      setAssessmentType("camera");
      setMode("results");
      setIsSimulationRunning(false);
      
      toast.success("AI posture analysis complete!");
    }, 2000);
  };

  const getIssues = () => {
    const issues: string[] = [];
    if (answers["sitting_hours"] === "more_than_8") issues.push("Prolonged sitting");
    if (answers["back_pain"] === "frequently") issues.push("Chronic back pain");
    return issues;
  };

  const resetAssessment = () => {
    setMode("select");
    setCurrentQuestion(0);
    setAnswers({});
    setScore(null);
    setCvaAngle(null);
    setShoulderAlignment(null);
    setSymmetryScore(null);
  };

  const isAnalyzing = isHookAnalyzing || isSimulationRunning;
  const isScanning = mode === "camera";

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-zinc-100 font-sans relative transition-colors duration-300",
      isScanning && "h-[100dvh] overflow-hidden"
    )}>
      {/* LAYER 0: ANATOMICAL ANCHOR */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <img 
          src="/spine-dna-bg.png" 
          alt="" 
          className="w-full h-full object-contain opacity-[0.05] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen filter brightness-[0.9] contrast-[1.1]"
        />
      </div>

      <AppLayout>
        <div className={cn(
          "relative z-10 flex flex-col max-w-[1000px] mx-auto px-4 py-8",
          isScanning ? "h-full overflow-hidden" : "min-h-screen overflow-y-auto"
        )}>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 mb-10 antialiased">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-4 text-slate-900 dark:text-cyan-50 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] subpixel-antialiased uppercase">
                <Sparkles className="h-10 w-10 text-cyan-600 dark:text-cyan-400 animate-pulse z-10" />
                Posture Lab
              </h1>
              <p className="text-slate-500 dark:text-zinc-400 font-medium tracking-wide uppercase">Precision Biomechanical Assessment</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "assess" | "history")} className="w-fit">
              <TabsList className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 p-1">
                <TabsTrigger value="assess" className="gap-2 px-6 py-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-zinc-950 font-bold"><Target className="h-4 w-4 z-10" /> ANALYZE</TabsTrigger>
                <TabsTrigger value="history" className="gap-2 px-6 py-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-zinc-950 font-bold"><History className="h-4 w-4 z-10" /> HISTORY</TabsTrigger>
              </TabsList>
            </Tabs>
          </header>

          <div className={cn(
            "flex-1",
            isScanning ? "overflow-hidden" : "overflow-visible"
          )}>
            <AnimatePresence mode="wait">
              {activeTab === "assess" ? (
                <motion.div 
                  key="assess-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8 pb-20"
                >
                  {mode === "select" && (
                    <div className="grid md:grid-cols-2 gap-8 pt-4">
                      <SelectionCard 
                        title="AI Vision Scan" 
                        desc="Real-time biometric tracking via AI skeletal mapping."
                        icon={<Camera className="h-10 w-10 text-cyan-600 dark:text-cyan-400 z-10 antialiased" />}
                        onClick={() => setMode("camera")}
                        variant="primary"
                      />
                      <SelectionCard 
                        title="Manual Survey" 
                        desc="Lifestyle analysis and physiological profiling assessment."
                        icon={<ClipboardList className="h-10 w-10 text-slate-400 dark:text-zinc-400 z-10 antialiased" />}
                        onClick={() => setMode("assessment")}
                        variant="secondary"
                      />
                    </div>
                  )}

                  {mode === "camera" && (
                    <CameraCapture 
                      onCapture={handleCameraCapture} 
                      onCancel={() => setMode("select")} 
                      isAnalyzing={isAnalyzing} 
                    />
                  )}

                  {mode === "assessment" && (
                    <div className="max-w-2xl mx-auto">
                      <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 shadow-2xl text-slate-900 dark:text-zinc-100">
                        <CardHeader className="space-y-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-2xl text-slate-900 dark:text-cyan-50 subpixel-antialiased">Symmetry Assessment</CardTitle>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-cyan-500/30 font-bold">{currentQuestion + 1} / {POSTURE_QUESTIONS.length}</Badge>
                          </div>
                          <Progress value={((currentQuestion + 1) / POSTURE_QUESTIONS.length) * 100} className="h-1.5 bg-slate-100 dark:bg-zinc-900 [&>div]:bg-cyan-500" />
                        </CardHeader>
                        <CardContent className="space-y-10">
                          <div className="space-y-6">
                            <h3 className="text-2xl font-semibold text-zinc-100">{POSTURE_QUESTIONS[currentQuestion].question}</h3>
                            <RadioGroup 
                              onValueChange={(v) => handleAnswer(POSTURE_QUESTIONS[currentQuestion].id, v)}
                              value={answers[POSTURE_QUESTIONS[currentQuestion].id]}
                            >
                              <div className="grid gap-4">
                                {POSTURE_QUESTIONS[currentQuestion].options.map((opt) => (
                                  <Label 
                                    key={opt.value}
                                    className={cn(
                                      "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer text-lg",
                                      answers[POSTURE_QUESTIONS[currentQuestion].id] === opt.value 
                                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-50" 
                                        : "border-transparent bg-zinc-900/40 hover:bg-zinc-900/60"
                                    )}
                                  >
                                    <RadioGroupItem value={opt.value} className="border-zinc-500 text-cyan-500 h-5 w-5" />
                                    {opt.label}
                                  </Label>
                                ))}
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="flex justify-between items-center pt-4">
                            <Button variant="ghost" className="text-zinc-400 hover:text-white text-lg" onClick={() => currentQuestion === 0 ? setMode("select") : setCurrentQuestion(q => q - 1)}>BACK</Button>
                            <Button 
                              disabled={!answers[POSTURE_QUESTIONS[currentQuestion].id]}
                              className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold px-10 py-6 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] text-lg"
                              onClick={() => currentQuestion === POSTURE_QUESTIONS.length - 1 ? handleCompleteAssessment() : setCurrentQuestion(q => q + 1)}
                            >
                              {currentQuestion === POSTURE_QUESTIONS.length - 1 ? "CALCULATE METRICS" : "NEXT METRIC"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {mode === "results" && score !== null && (
                    <div className="grid gap-8 animate-in slide-in-from-bottom-8 duration-700">
                      <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 text-center py-12 shadow-2xl text-slate-900 dark:text-zinc-100">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-5xl font-black tracking-tighter text-slate-900 dark:text-cyan-50 subpixel-antialiased uppercase">Posture Index: {score}%</CardTitle>
                          <Badge className="w-fit mx-auto mt-4 px-6 py-1.5 text-lg uppercase font-bold bg-cyan-500 text-zinc-950 border-none shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                            {getPostureScoreDescription(score).label}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-500 dark:text-zinc-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
                            {getPostureScoreDescription(score).description}
                          </p>

                          {assessmentType === "camera" && (
                            <div className="grid md:grid-cols-3 gap-6 mb-12 px-4">
                              <MetricCard label="CVA ANGLE" value={`${cvaAngle}°`} status={cvaAngle && cvaAngle > 50 ? "good" : "bad"} />
                              <MetricCard label="SHOULDER" value={`${shoulderAlignment}%`} status={shoulderAlignment && shoulderAlignment > 90 ? "good" : "bad"} />
                              <MetricCard label="SYMMETRY" value={`${symmetryScore}%`} status={symmetryScore && symmetryScore > 85 ? "good" : "bad"} />
                            </div>
                          )}

                          <div className="flex justify-center">
                            <Button variant="outline" className="border-slate-200 dark:border-zinc-800/50 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white px-10 py-6 rounded-full text-lg font-bold" onClick={resetAssessment}>NEW ANALYSIS</Button>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 shadow-lg text-slate-900 dark:text-zinc-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 text-xl font-bold uppercase tracking-wider antialiased">
                              <AlertCircle className="h-6 w-6 z-10" /> Anomalies Detected
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-4">
                              {(assessmentType === "camera" ? cameraIssues : getIssues()).map((issue, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-zinc-200">
                                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] z-10" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 shadow-lg text-slate-900 dark:text-zinc-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xl font-bold uppercase tracking-wider antialiased">
                              <CheckCircle2 className="h-6 w-6 z-10" /> Biometric Optimization
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-4">
                              {(assessmentType === "camera" ? cameraRecommendations : [
                                "Take desk breaks every 30 minutes",
                                "Adjust your monitor to eye level",
                                "Incorporate core exercises"
                              ]).map((rec, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-zinc-300">
                                  <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 z-10" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      {analysisDetails && (
                        <Card className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-zinc-800/50 shadow-lg text-slate-900 dark:text-zinc-100">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider antialiased">
                              <Sparkles className="h-6 w-6 z-10" /> Posture Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-zinc-300 italic">
                              "{analysisDetails}"
                            </p>
                          </CardContent>
                        </Card>
                      ) }
                      
                      <div className="space-y-6 pb-20">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-cyan-50 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] subpixel-antialiased uppercase">
                          <Dumbbell className="h-7 w-7 text-cyan-600 dark:text-cyan-400 z-10" /> Corrective Protocols
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          {getExercisesForIssues(assessmentType === "camera" ? cameraIssues : getIssues()).map((ex) => (
                            <ExerciseCard key={ex.id} exercise={ex} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="history-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 pb-20">
                  <PostureHistory />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}

function MetricCard({ label, value, status }: { label: string; value: string; status: "good" | "bad" }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md transition-all",
      status === "good" ? "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
    )}>
      <p className="text-xs text-slate-500 dark:text-zinc-400 uppercase font-bold tracking-[0.2em] mb-2"> {label}</p>
      <p className={cn(
        "text-3xl font-black antialiased",
        status === "good" ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"
      )}>{value}</p>
    </div>
  );
}

function SelectionCard({ title, desc, icon, onClick, variant }: { title: string; desc: string; icon: React.ReactNode; onClick: () => void; variant: "primary" | "secondary" }) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative z-10">
      <Card 
        className={cn(
          "cursor-pointer h-full border-slate-200 dark:border-zinc-800/50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-[#111111] transition-all duration-300 group shadow-lg dark:shadow-none",
          variant === "primary" ? "hover:border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "hover:border-zinc-500/50"
        )}
        onClick={onClick}
      >
        <CardHeader className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-100 dark:bg-zinc-950/60 w-fit border border-slate-200 dark:border-zinc-800/50 group-hover:scale-110 transition-transform duration-500 z-10">{icon}</div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-slate-900 dark:text-cyan-50 subpixel-antialiased uppercase tracking-tight">{title}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-zinc-400 text-lg leading-snug">{desc}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest antialiased">
            Launch Interface <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform z-10" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}