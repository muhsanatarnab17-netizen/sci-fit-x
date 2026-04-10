/**
 * Core type definitions for PosFitX application
 * Replaces scattered 'any' types across hooks and pages
 * Strict TypeScript for production-grade health platform
 */

// User profile with health metrics
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  sleep_hours?: number;
  posture_score?: number;
  latest_cva_angle?: number;
  latest_shoulder_alignment?: number;
  latest_symmetry_score?: number;
  workout_experience?: "beginner" | "intermediate" | "advanced";
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Workout/exercise log entry
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  category: string;
  duration_minutes: number;
  calories_burned?: number;
  completed_at: string;
  created_at: string;
}

// Meal log entry with nutritional data
export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  logged_at: string;
  created_at: string;
}

// Posture assessment from database
export interface PostureAssessment {
  id: string;
  user_id: string;
  score: number;
  cva_angle: number | null;
  shoulder_alignment: number | null;
  symmetry_score: number | null;
  issues: string[] | null;
  recommendations: string[] | null;
  assessment_type: string | null;
  assessed_at: string;
  created_at: string;
}

// Daily task/plan item
export interface Task {
  id: string;
  user_id: string;
  title: string;
  category: "workout" | "meal" | "sleep" | "health" | "posture" | "hydration" | "wellness";
  completed: boolean;
  scheduled_for: string;
  created_at: string;
}

// Aggregated chart data for visualizations
export interface ChartDataPoint {
  date: string;
  value: number;
}

// Weekly data summary
export interface WeeklyData {
  day: string;
  minutes?: number;
  consumed?: number;
  goal?: number;
}

// Posture statistics summary (Complete & Strict)
export interface PostureStats {
  totalAssessments: number;
  averageScore: number;
  latestScore: number | null;
  latestCVA: number | null;
  latestShoulderAlignment: number | null;
  latestSymmetry: number | null;
  previousScore: number | null;
  improvement: number | null;
  bestScore: number;
}

// Posture history data with charts
export interface PostureHistoryData {
  assessments: PostureAssessment[];
  isLoading: boolean;
  stats: PostureStats;
  weeklyChart: ChartDataPoint[];
  monthlyChart: ChartDataPoint[];
}

// Health metrics summary
export interface HealthMetrics {
  weeklyChart: ChartDataPoint[];
  monthlyChart: ChartDataPoint[];
  weeklyData: WeeklyData[];
  totalWorkouts: number;
  thisMonthWorkouts: number;
  isLoading: boolean;
}
