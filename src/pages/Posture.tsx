import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Target,
  Camera,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getPostureScoreDescription } from "@/lib/health-utils";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import CameraCapture from "@/components/posture/CameraCapture";

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
  {
    id: "standing_breaks",
    question: "How often do you take standing/walking breaks?",
    options: [
      { value: "every_30min", label: "Every 30 minutes", score: 10 },
      { value: "every_hour", label: "Every hour", score: 7 },
      { value: "every_few_hours", label: "Every few hours", score: 4 },
      { value: "rarely", label: "Rarely", score: 1 },
    ],
  },
];

export default function Posture() {
  const { profile, updateProfile } = useProfile();
  const [mode, setMode] = useState<"select" | "assessment" | "camera" | "results">("select");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraIssues, setCameraIssues] = useState<string[]>([]);
  const [cameraRecommendations, setCameraRecommendations] = useState<string[]>([]);
  const [analysisDetails, setAnalysisDetails] = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    POSTURE_QUESTIONS.forEach((q) => {
      maxScore += 10;
      const answer = answers[q.id];
      if (answer) {
        const option = q.options.find((o) => o.value === answer);
        if (option) {
          totalScore += option.score;
        }
      }
    });

    return Math.round((totalScore / maxScore) * 100);
  };

  const handleCompleteAssessment = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setMode("results");

    // Update profile with new score
    try {
      await updateProfile.mutateAsync({ posture_score: calculatedScore });
      toast.success("Posture assessment saved!");
    } catch (error) {
      toast.error("Failed to save assessment");
    }
  };

  const handleCameraCapture = async (imageBase64: string) => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-posture", {
        body: { imageBase64 },
      });

      if (error) {
        throw new Error(error.message || "Failed to analyze posture");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const { score: analysisScore, issues, recommendations, details } = data;
      
      setScore(analysisScore);
      setCameraIssues(issues || []);
      setCameraRecommendations(recommendations || []);
      setAnalysisDetails(details || null);
      setMode("results");

      // Save to profile
      await updateProfile.mutateAsync({ posture_score: analysisScore });
      toast.success("AI posture analysis complete!");
    } catch (error) {
      console.error("Posture analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze posture");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const postureInfo = score !== null ? getPostureScoreDescription(score) : null;
  const currentPostureInfo = profile?.posture_score ? getPostureScoreDescription(profile.posture_score) : null;

  const getIssues = () => {
    const issues: string[] = [];
    if (answers["sitting_hours"] === "more_than_8" || answers["sitting_hours"] === "6_to_8") {
      issues.push("Prolonged sitting");
    }
    if (answers["back_pain"] === "frequently" || answers["back_pain"] === "sometimes") {
      issues.push("Back pain issues");
    }
    if (answers["neck_pain"] === "frequently" || answers["neck_pain"] === "sometimes") {
      issues.push("Neck tension");
    }
    if (answers["monitor_position"] === "no" || answers["monitor_position"] === "laptop") {
      issues.push("Poor monitor ergonomics");
    }
    if (answers["standing_breaks"] === "rarely" || answers["standing_breaks"] === "every_few_hours") {
      issues.push("Infrequent movement breaks");
    }
    return issues;
  };

  const getRecommendations = () => {
    const recs: string[] = [];
    if (answers["sitting_hours"] === "more_than_8" || answers["sitting_hours"] === "6_to_8") {
      recs.push("Use a standing desk or take regular standing breaks");
    }
    if (answers["back_pain"] === "frequently" || answers["back_pain"] === "sometimes") {
      recs.push("Strengthen your core with daily exercises");
    }
    if (answers["neck_pain"] === "frequently" || answers["neck_pain"] === "sometimes") {
      recs.push("Do neck stretches every 2 hours");
    }
    if (answers["monitor_position"] === "no" || answers["monitor_position"] === "laptop") {
      recs.push("Raise your monitor to eye level using a stand");
    }
    if (answers["standing_breaks"] === "rarely") {
      recs.push("Set hourly reminders to stand and stretch");
    }
    return recs.length > 0 ? recs : ["Keep up the good work! Maintain your current habits."];
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Posture Detection
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze and improve your posture with AI-powered insights
          </p>
        </div>

        {/* Current Score */}
        {profile?.posture_score && currentPostureInfo && mode === "select" && (
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Posture Score</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl font-bold text-primary">{profile.posture_score}</span>
                    <Badge variant="outline" className="text-sm">
                      {currentPostureInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{currentPostureInfo.description}</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - profile.posture_score / 100)}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Selection */}
        {mode === "select" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="glass border-primary/20 cursor-pointer hover:glow-blue transition-all duration-300"
              onClick={() => setMode("assessment")}
            >
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 w-fit">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">Self-Assessment</CardTitle>
                <CardDescription>
                  Answer questions about your daily habits to get personalized posture insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card
              className="glass border-secondary/20 cursor-pointer hover:glow-purple transition-all duration-300"
              onClick={() => setMode("camera")}
            >
              <CardHeader>
                <div className="p-3 rounded-xl bg-secondary/10 w-fit">
                  <Camera className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="mt-4">Camera Analysis</CardTitle>
                <CardDescription>
                  Use your camera for real-time AI-powered posture analysis and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Open Camera
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Self-Assessment Mode */}
        {mode === "assessment" && (
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Self-Assessment</CardTitle>
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {POSTURE_QUESTIONS.length}
                </Badge>
              </div>
              <Progress value={((currentQuestion + 1) / POSTURE_QUESTIONS.length) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {POSTURE_QUESTIONS[currentQuestion].question}
                </h3>
                <RadioGroup
                  value={answers[POSTURE_QUESTIONS[currentQuestion].id] || ""}
                  onValueChange={(value) =>
                    handleAnswer(POSTURE_QUESTIONS[currentQuestion].id, value)
                  }
                >
                  <div className="space-y-3">
                    {POSTURE_QUESTIONS[currentQuestion].options.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all",
                          answers[POSTURE_QUESTIONS[currentQuestion].id] === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() =>
                          handleAnswer(POSTURE_QUESTIONS[currentQuestion].id, option.value)
                        }
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentQuestion === 0) {
                      setMode("select");
                      setAnswers({});
                    } else {
                      setCurrentQuestion(currentQuestion - 1);
                    }
                  }}
                >
                  {currentQuestion === 0 ? "Cancel" : "Back"}
                </Button>

                {currentQuestion < POSTURE_QUESTIONS.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={!answers[POSTURE_QUESTIONS[currentQuestion].id]}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteAssessment}
                    disabled={!answers[POSTURE_QUESTIONS[currentQuestion].id]}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Mode */}
        {mode === "camera" && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>AI Camera Analysis</CardTitle>
              <CardDescription>
                Position yourself in front of the camera for real-time AI-powered posture analysis
              </CardDescription>
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

        {/* Results */}
        {mode === "results" && score !== null && postureInfo && (
          <div className="space-y-6">
            <Card className="glass border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Posture Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 70}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - score / 100)}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold">{score}</span>
                    <span className="text-sm text-muted-foreground">out of 100</span>
                  </div>
                </div>
                <Badge className="text-lg px-4 py-2">{postureInfo.label}</Badge>
                <p className="text-muted-foreground">{postureInfo.description}</p>
              </CardContent>
            </Card>

            {/* Show AI analysis details for camera mode */}
            {analysisDetails && (
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysisDetails}</p>
                </CardContent>
              </Card>
            )}

            {/* Issues from self-assessment or camera */}
            {(Object.keys(answers).length > 0 ? getIssues().length > 0 : cameraIssues.length > 0) && (
              <Card className="glass border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Issues Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(Object.keys(answers).length > 0 ? getIssues() : cameraIssues).map((issue, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations from self-assessment or camera */}
            {(Object.keys(answers).length > 0 || cameraRecommendations.length > 0) && (
              <Card className="glass border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(Object.keys(answers).length > 0 ? getRecommendations() : cameraRecommendations).map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                        <div className="p-1 rounded-full bg-accent/20 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-accent" />
                        </div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button
              className="w-full"
              onClick={() => {
                setMode("select");
                setCurrentQuestion(0);
                setAnswers({});
                setScore(null);
                setCameraIssues([]);
                setCameraRecommendations([]);
                setAnalysisDetails(null);
              }}
            >
              Take Another Assessment
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
