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
import { supabase } from "@/integrations/supabase/client";
import CameraCapture from "@/components/posture/CameraCapture";
import PostureHistory from "@/components/posture/PostureHistory";
import ExerciseCard from "@/components/posture/ExerciseCard";
import { getExercisesForIssues, getTipsForScore } from "@/lib/posture-exercises";
import spineDnaBg from "@/assets/spine-dna-bg.jpg";

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
  const { profile, updateProfile } = useProfile();
  const { saveAssessment } = usePostureHistory();
  const { analyzePosture, isAnalyzing } = usePosture();
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

  const handleCameraCapture = async (imageBase64: string) => {
    try {
      const data = await analyzePosture(imageBase64);

      setScore(data.score);
      setCvaAngle(data.cva_angle);
      setShoulderAlignment(data.shoulder_alignment);
      setSymmetryScore(data.symmetry_score);
      setCameraIssues(data.issues || []);
      setCameraRecommendations(data.recommendations || []);
      setAnalysisDetails(data.details || null);
      setAssessmentType("camera");
      setMode("results");

      // Save to database
      await Promise.all([
        updateProfile.mutateAsync({ posture_score: data.score }),
        saveAssessment.mutateAsync({
          score: data.score,
          issues: data.issues || [],
          recommendations: data.recommendations || [],
          assessment_type: "camera_analysis",
        }),
      ]);
      toast.success("AI posture analysis complete!");
    } catch (error) {
      // Error handled in hook
    }
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

  return (
    <AppLayout>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
        <img src={spineDnaBg} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              Posture Lab
            </h1>
            <p className="text-muted-foreground mt-1">Next-gen skeletal alignment analysis</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "assess" | "history")} className="w-fit">
            <TabsList className="bg-background/50 backdrop-blur-md border border-white/10">
              <TabsTrigger value="assess" className="gap-2"><Target className="h-4 w-4" /> Analyze</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> History</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "assess" ? (
            <motion.div 
              key="assess-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 px-4 md:px-0"
            >
              {mode === "select" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <SelectionCard 
                    title="Camera Analysis" 
                    desc="Use AI to track your spine alignment in real-time."
                    icon={<Camera className="h-8 w-8 text-primary" />}
                    onClick={() => setMode("camera")}
                    variant="primary"
                  />
                  <SelectionCard 
                    title="Quick Survey" 
                    desc="Analyze lifestyle habits and pain points manually."
                    icon={<ClipboardList className="h-8 w-8 text-secondary" />}
                    onClick={() => setMode("assessment")}
                    variant="secondary"
                  />
                </div>
              )}

              {mode === "camera" && (
                <Card className="overflow-hidden border-primary/20 glass animate-in fade-in zoom-in-95 duration-500">
                  <CardHeader>
                    <CardTitle>AI Vision Scan</CardTitle>
                    <CardDescription>Position yourself clearly in the frame.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CameraCapture 
                      onCapture={handleCameraCapture} 
                      onCancel={() => setMode("select")} 
                      isAnalyzing={isAnalyzing} 
                    />
                  </CardContent>
                </Card>
              )}

              {mode === "assessment" && (
                <Card className="glass border-primary/10">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Self-Assessment</CardTitle>
                      <Badge variant="secondary">{currentQuestion + 1} / {POSTURE_QUESTIONS.length}</Badge>
                    </div>
                    <Progress value={((currentQuestion + 1) / POSTURE_QUESTIONS.length) * 100} className="h-1" />
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">{POSTURE_QUESTIONS[currentQuestion].question}</h3>
                      <RadioGroup 
                        onValueChange={(v) => handleAnswer(POSTURE_QUESTIONS[currentQuestion].id, v)}
                        value={answers[POSTURE_QUESTIONS[currentQuestion].id]}
                      >
                        <div className="grid gap-3">
                          {POSTURE_QUESTIONS[currentQuestion].options.map((opt) => (
                            <Label 
                              key={opt.value}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                answers[POSTURE_QUESTIONS[currentQuestion].id] === opt.value 
                                  ? "border-primary bg-primary/5" 
                                  : "border-transparent bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <RadioGroupItem value={opt.value} />
                              {opt.label}
                            </Label>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="ghost" onClick={() => currentQuestion === 0 ? setMode("select") : setCurrentQuestion(q => q - 1)}>Back</Button>
                      <Button 
                        disabled={!answers[POSTURE_QUESTIONS[currentQuestion].id]}
                        onClick={() => currentQuestion === POSTURE_QUESTIONS.length - 1 ? handleCompleteAssessment() : setCurrentQuestion(q => q + 1)}
                      >
                        {currentQuestion === POSTURE_QUESTIONS.length - 1 ? "Finish Analysis" : "Next Question"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {mode === "results" && score !== null && (
                <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-700">
                  <Card className="glass border-primary/30 text-center py-8">
                    <CardHeader>
                      <CardTitle className="text-4xl font-bold tracking-tighter">Your Posture: {score}%</CardTitle>
                      <Badge className="w-fit mx-auto mt-2" variant={score > 70 ? "default" : "destructive"}>
                        {getPostureScoreDescription(score).label}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        {getPostureScoreDescription(score).description}
                      </p>

                      {assessmentType === "camera" && (
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                          <MetricCard 
                            label="CVA Angle" 
                            value={`${cvaAngle}°`} 
                            desc={cvaAngle && cvaAngle > 50 ? "Normal Range" : "Forward Head"}
                            status={cvaAngle && cvaAngle > 50 ? "good" : "bad"}
                          />
                          <MetricCard 
                            label="Shoulder" 
                            value={`${shoulderAlignment}%`} 
                            desc="Horizontal Level"
                            status={shoulderAlignment && shoulderAlignment > 90 ? "good" : "bad"}
                          />
                          <MetricCard 
                            label="Symmetry" 
                            value={`${symmetryScore}%`} 
                            desc="Bilateral Balance"
                            status={symmetryScore && symmetryScore > 85 ? "good" : "bad"}
                          />
                        </div>
                      )}

                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={resetAssessment}>Start New Analysis</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glass border-secondary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-secondary">
                          <AlertCircle className="h-5 w-5" /> Detected Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(assessmentType === "camera" ? cameraIssues : getIssues()).map((issue, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="glass border-neon-green/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-neon-green">
                          <CheckCircle2 className="h-5 w-5" /> Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(assessmentType === "camera" ? cameraRecommendations : [
                            "Take desk breaks every 30 minutes",
                            "Adjust your monitor to eye level",
                            "Incorporate core exercises"
                          ]).map((rec, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ArrowRight className="h-3 w-3 text-neon-green" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {analysisDetails && (
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" /> AI Detailed Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                          "{analysisDetails}"
                        </p>
                      </CardContent>
                    </Card>
                  ) }
                  
                  {/* Exercises */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" /> Recommended Corrective Exercises
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {getExercisesForIssues(assessmentType === "camera" ? cameraIssues : getIssues()).map((ex) => (
                        <ExerciseCard key={ex.id} exercise={ex} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="history-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PostureHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  desc: string;
  status: "good" | "bad";
}

function MetricCard({ label, value, desc, status }: MetricCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-xl border bg-background/50",
      status === "good" ? "border-neon-green/20" : "border-neon-orange/20"
    )}>
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{label}</p>
      <p className={cn(
        "text-2xl font-black mt-1",
        status === "good" ? "text-neon-green" : "text-neon-orange"
      )}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

interface SelectionCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary";
}

function SelectionCard({ title, desc, icon, onClick, variant }: SelectionCardProps) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card 
        className={cn(
          "cursor-pointer h-full border-white/5 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-colors",
          variant === "primary" ? "hover:border-primary/50" : "hover:border-secondary/50"
        )}
        onClick={onClick}
      >
        <CardHeader>
          <div className="p-3 rounded-2xl bg-background/50 w-fit mb-4 border border-white/10">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm font-medium text-primary">
            Launch <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}