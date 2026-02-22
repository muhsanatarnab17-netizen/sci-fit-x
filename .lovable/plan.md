

# Replace Demo Data with Real User Data and AI-Powered Personalization

## Problem Summary
Several pages use hardcoded mock data instead of real database records:
- **Plans page**: Workout plan, meal plan, and sleep plan are all static objects. The "Regenerate" button fakes a 2-second delay with no actual generation. Exercise/meal completions use local state and are lost on refresh.
- **Progress page**: All 5 chart datasets (weight, BMI, posture, workouts, calories) are hardcoded arrays. Stats like "2.2 kg lost", "24 workouts", and "7 day streak" are fake.
- **Dashboard**: The "7 day streak" badge is hardcoded.
- **Database trigger**: The `handle_new_user` function still tries to insert an `email` column that was removed.

## Plan

### 1. Fix the broken database trigger
Update the `handle_new_user()` function to stop inserting the removed `email` column. This is causing errors for new signups.

### 2. Create an AI plan generation edge function
Build a new `generate-plans` edge function that:
- Accepts the user's profile data (age, weight, height, goals, activity level, dietary restrictions, allergies, experience level, injuries, etc.)
- Calls the Lovable AI gateway (Gemini Flash) to generate a personalized workout plan, meal plan, and sleep schedule
- Uses tool calling for structured output (exercises with sets/reps/duration, meals with macros, sleep schedule with tips)
- Returns the generated plans as structured JSON
- Includes JWT authentication and rate limit handling

### 3. Refactor the Plans page to use real AI-generated plans
- Replace all hardcoded `workoutPlan`, `mealPlan`, and `sleepPlan` objects with AI-generated data
- Store generated plans in component state, fetched via the edge function on page load or "Regenerate" click
- Save exercise completions to the `workout_logs` table (with exercises JSON, duration, calories)
- Save meal completions to the `meal_logs` table (with food items, macros, meal type)
- Pass real user profile data to the AI for truly personalized recommendations
- Show loading states while plans generate

### 4. Build data-fetching hooks for Progress page
Create new hooks to pull real data from the database:
- **`useWeightHistory`**: Fetch from `weight_logs`, compute weight change over time
- **`useWorkoutHistory`**: Fetch from `workout_logs`, aggregate by day/week
- **`useMealHistory`**: Fetch from `meal_logs`, aggregate calories and macros by day
- Reuse existing `usePostureHistory` for posture chart data

### 5. Refactor the Progress page with real data
- Replace all mock chart arrays with data from the new hooks
- Weight chart: real data from `weight_logs`
- BMI chart: calculated from weight logs + profile height
- Posture chart: real data from `posture_assessments`
- Workouts chart: real data from `workout_logs`
- Nutrition chart: real data from `meal_logs`
- Stats cards: computed from actual database records (real weight change, real workout count, real streak from `daily_tasks`)

### 6. Calculate real streak on Dashboard
Replace the hardcoded "7 day streak" with a calculated streak based on consecutive days with completed tasks in the `daily_tasks` table.

### 7. Make daily task seeding profile-aware
Update `seedDefaultTasks` to generate tasks based on the user's fitness goals, activity level, and dietary preferences rather than using a static list.

---

## Technical Details

### Edge Function: `generate-plans`

```text
Input: user profile (goals, restrictions, allergies, experience, injuries, body metrics)
Output: { workout: {...}, meals: {...}, sleep: {...} }
Model: google/gemini-2.5-flash (via Lovable AI gateway)
Auth: JWT required
```

Uses tool calling to enforce structured output with exercises (name, sets, reps, duration, difficulty), meals (name, ingredients, calories, protein, carbs, fat, time), and sleep recommendations.

### Database Migration

```text
- Fix handle_new_user() trigger to remove email column reference
- No new tables needed; existing tables (workout_logs, meal_logs, weight_logs) already support the data
```

### New/Modified Files

```text
New:
  - supabase/functions/generate-plans/index.ts
  - src/hooks/useWeightHistory.ts
  - src/hooks/useWorkoutHistory.ts
  - src/hooks/useMealHistory.ts

Modified:
  - src/pages/Plans.tsx (AI plans, DB persistence for completions)
  - src/pages/Progress.tsx (real data hooks, remove all mock arrays)
  - src/pages/Dashboard.tsx (real streak calculation)
  - src/hooks/useDailyTasks.ts (profile-aware seeding)
  - supabase migration (fix trigger)
```

### Data Flow

```text
User Profile (DB) --> generate-plans edge function --> AI Gateway
                                                         |
                                                    Structured Plans
                                                         |
                                          Plans Page (render + completion tracking)
                                                         |
                                         workout_logs / meal_logs (DB)
                                                         |
                                          Progress Page (charts from real data)
```
