// BMI Categories
export const BMI_CATEGORIES = {
  underweight: { min: 0, max: 18.5, label: "Underweight", color: "neon-orange" },
  normal: { min: 18.5, max: 24.9, label: "Normal", color: "neon-green" },
  overweight: { min: 25, max: 29.9, label: "Overweight", color: "neon-orange" },
  obese: { min: 30, max: Infinity, label: "Obese", color: "destructive" },
};

// Calculate BMI
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

// Get BMI category
export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return BMI_CATEGORIES.underweight;
  if (bmi < 25) return BMI_CATEGORIES.normal;
  if (bmi < 30) return BMI_CATEGORIES.overweight;
  return BMI_CATEGORIES.obese;
}

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other" | "prefer_not_to_say"
): number {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
  
  // Use average for non-binary or prefer not to say
  if (gender === "male") {
    return Math.round(baseBMR + 5);
  } else if (gender === "female") {
    return Math.round(baseBMR - 161);
  } else {
    return Math.round(baseBMR - 78); // Average of male and female
  }
}

// Activity level multipliers
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// Calculate daily calorie needs based on BMR and activity level
export function calculateDailyCalories(
  bmr: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// Format height for display
export function formatHeight(cm: number): string {
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}" (${cm} cm)`;
}

// Format weight for display
export function formatWeight(kg: number): string {
  const lbs = Math.round(kg * 2.205);
  return `${kg} kg (${lbs} lbs)`;
}

// Get posture score description
export function getPostureScoreDescription(score: number): {
  label: string;
  description: string;
  color: string;
} {
  if (score >= 80) {
    return {
      label: "Excellent",
      description: "Great posture! Keep up the good work.",
      color: "neon-green",
    };
  } else if (score >= 60) {
    return {
      label: "Good",
      description: "Your posture is good with minor improvements needed.",
      color: "primary",
    };
  } else if (score >= 40) {
    return {
      label: "Fair",
      description: "Some posture issues detected. Follow the exercises.",
      color: "neon-orange",
    };
  } else {
    return {
      label: "Needs Work",
      description: "Significant posture issues. Daily exercises recommended.",
      color: "destructive",
    };
  }
}

// Body types
export const BODY_TYPES = [
  {
    id: "ectomorph",
    label: "Ectomorph",
    description: "Lean and long, difficulty building muscle",
  },
  {
    id: "mesomorph",
    label: "Mesomorph",
    description: "Muscular and well-built, gains muscle easily",
  },
  {
    id: "endomorph",
    label: "Endomorph",
    description: "Bigger bone structure, stores fat easily",
  },
  {
    id: "not_sure",
    label: "Not Sure",
    description: "I'm not sure about my body type",
  },
];

// Activity levels
export const ACTIVITY_LEVELS = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise, desk job",
  },
  {
    id: "lightly_active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
  },
  {
    id: "moderately_active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
  },
  {
    id: "very_active",
    label: "Very Active",
    description: "Hard exercise 6-7 days/week",
  },
  {
    id: "extra_active",
    label: "Extra Active",
    description: "Very hard exercise, physical job",
  },
];

// Dietary restrictions options
export const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "Dairy-Free",
  "Low-Carb",
  "Low-Fat",
  "Halal",
  "Kosher",
  "None",
];

// Common allergies
export const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "None",
];

// Fitness goals
export const FITNESS_GOALS = [
  "Lose Weight",
  "Build Muscle",
  "Improve Endurance",
  "Increase Flexibility",
  "Better Posture",
  "General Fitness",
  "Stress Reduction",
  "Better Sleep",
];
