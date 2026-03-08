import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userId = claimsData.claims.sub as string;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please complete onboarding first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch recent user history for personalization (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    const [workoutRes, mealRes, weightRes, taskRes] = await Promise.all([
      supabase.from("workout_logs").select("*").eq("user_id", userId).gte("completed_at", cutoff).order("completed_at", { ascending: false }).limit(20),
      supabase.from("meal_logs").select("*").eq("user_id", userId).gte("logged_at", cutoff).order("logged_at", { ascending: false }).limit(20),
      supabase.from("weight_logs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(10),
      supabase.from("daily_tasks").select("*").eq("user_id", userId).gte("scheduled_for", sevenDaysAgo.toISOString().split("T")[0]).order("scheduled_for", { ascending: false }).limit(30),
    ]);

    const recentWorkouts = workoutRes.data || [];
    const recentMeals = mealRes.data || [];
    const recentWeights = weightRes.data || [];
    const recentTasks = taskRes.data || [];

    // Build history context
    const workoutSummary = recentWorkouts.length > 0
      ? recentWorkouts.map(w => `${formatDate(w.completed_at)}: ${w.workout_type} - ${w.duration_minutes}min, ${w.calories_burned || 0}cal${w.exercises ? `, exercises: ${JSON.stringify(w.exercises)}` : ""}`).join("\n")
      : "No recent workouts logged.";

    const mealSummary = recentMeals.length > 0
      ? recentMeals.map(m => `${formatDate(m.logged_at)}: ${m.meal_type || "meal"} - ${m.calories || 0}cal, P:${m.protein_g || 0}g C:${m.carbs_g || 0}g F:${m.fat_g || 0}g`).join("\n")
      : "No recent meals logged.";

    const weightSummary = recentWeights.length > 0
      ? recentWeights.map(w => `${formatDate(w.recorded_at)}: ${w.weight_kg}kg`).join(", ")
      : "No weight records.";

    const completedTaskTitles = recentTasks.filter(t => t.completed).map(t => t.title);
    const skippedTaskTitles = recentTasks.filter(t => !t.completed).map(t => t.title);

    const taskSummary = recentTasks.length > 0
      ? `Completed tasks: ${completedTaskTitles.length > 0 ? completedTaskTitles.join(", ") : "none"}\nSkipped/incomplete tasks: ${skippedTaskTitles.length > 0 ? skippedTaskTitles.join(", ") : "none"}`
      : "No recent task history.";

    const systemPrompt = `You are an expert fitness, nutrition, sleep, and lifestyle coach who creates PERSONALIZED and PROGRESSIVE plans. You must:

1. ANALYZE the user's recent history carefully to understand their current fitness level, eating patterns, and preferences.
2. BUILD ON their progress — don't restart from scratch each time. If they did push-ups yesterday, progress naturally (more reps, harder variation, or complementary exercises).
3. AVOID repeating the exact same exercises/meals they already had recently unless it makes sense for their program.
4. For dailyTasks: Generate FUN, RISK-FREE, ENJOYABLE challenges and activities. Examples:
   - "Sprint 100 meters in under 60 seconds" (adjust time to their level)
   - "Hold a plank for 90 seconds"
   - "Play 30 minutes of your favorite sport (basketball, badminton, etc.)"
   - "Go for a 20-minute cycling tour around your neighborhood"
   - "Swim 4 laps without stopping"
   - "Play a competitive esports session for 45 minutes (take stretch breaks!)"
   - "Try a new indoor game (table tennis, bowling, darts)"
   - "Do 50 jumping jacks in under 2 minutes"
   - "Take a 30-minute nature walk and photograph 5 interesting things"
   - "Challenge a friend to a step count competition today"
   Mix physical challenges, outdoor adventures, indoor games, esports, social activities, and mindfulness tasks.
   IMPORTANT: All tasks must be SAFE and appropriate for the user's fitness level and any injuries they have.
5. Ensure CONTINUITY — the new plan should feel like a natural next step, not a completely different program.`;

    const userPrompt = `Create today's personalized plan for this user:

## Profile
- Age: ${profile.age || "unknown"}
- Gender: ${profile.gender || "unknown"}
- Weight: ${profile.weight_kg ? profile.weight_kg + " kg" : "unknown"}
- Height: ${profile.height_cm ? profile.height_cm + " cm" : "unknown"}
- BMI: ${profile.bmi || "unknown"}
- BMR: ${profile.bmr || "unknown"} cal/day
- Daily Calorie Goal: ${profile.daily_calorie_goal || "unknown"} cal
- Activity Level: ${profile.activity_level || "unknown"}
- Workout Experience: ${profile.workout_experience || "beginner"}
- Fitness Goals: ${(profile.fitness_goals || []).join(", ") || "general fitness"}
- Body Type: ${profile.body_type || "unknown"}
- Injuries: ${(profile.injuries || []).join(", ") || "none"}
- Dietary Restrictions: ${(profile.dietary_restrictions || []).join(", ") || "none"}
- Allergies: ${(profile.allergies || []).join(", ") || "none"}
- Eating Habits: ${profile.eating_habits || "regular"}
- Sleep Hours Target: ${profile.sleep_hours || 8}
- Work Schedule: ${profile.work_schedule || "unknown"}
- Stress Level: ${profile.stress_level || "unknown"}

## Recent Weight Trend (last 7 days)
${weightSummary}

## Recent Workout History (last 7 days)
${workoutSummary}

## Recent Meal History (last 7 days)
${mealSummary}

## Recent Task History (last 7 days)
${taskSummary}

## Instructions
- Design today's workout to PROGRESS from what they did recently (vary muscle groups, increase intensity slightly, or introduce new exercises).
- If they skipped workouts recently, make today's plan lighter and more approachable.
- Meal plan should complement their recent nutrition — if they've been low on protein, emphasize protein today.
- For dailyTasks: Create 6-8 FUN and VARIED tasks mixing physical challenges, games (indoor/outdoor/esports), social activities, and wellness habits. Make them specific with measurable goals (e.g., "Run 200m in under 50 seconds" not just "Go running"). Ensure all are risk-free and enjoyable.
- DO NOT repeat the same tasks they had recently. Keep it fresh and exciting.
- Sleep tips should address their specific stress level and work schedule.

Generate a complete personalized plan for today.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_daily_plans",
              description: "Return a complete personalized daily plan with workout, meals, sleep schedule, and fun daily tasks",
              parameters: {
                type: "object",
                properties: {
                  workout: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      duration: { type: "string" },
                      calories: { type: "number" },
                      exercises: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            sets: { type: "string", description: "e.g. 3x12 or null" },
                            duration: { type: "string", description: "e.g. 5 mins or null" },
                          },
                          required: ["name"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["title", "duration", "calories", "exercises"],
                    additionalProperties: false,
                  },
                  meals: {
                    type: "object",
                    properties: {
                      breakfast: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          meal: { type: "string" },
                          calories: { type: "number" },
                          protein: { type: "number" },
                          carbs: { type: "number" },
                          fat: { type: "number" },
                        },
                        required: ["time", "meal", "calories", "protein", "carbs", "fat"],
                        additionalProperties: false,
                      },
                      lunch: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          meal: { type: "string" },
                          calories: { type: "number" },
                          protein: { type: "number" },
                          carbs: { type: "number" },
                          fat: { type: "number" },
                        },
                        required: ["time", "meal", "calories", "protein", "carbs", "fat"],
                        additionalProperties: false,
                      },
                      dinner: {
                        type: "object",
                        properties: {
                          time: { type: "string" },
                          meal: { type: "string" },
                          calories: { type: "number" },
                          protein: { type: "number" },
                          carbs: { type: "number" },
                          fat: { type: "number" },
                        },
                        required: ["time", "meal", "calories", "protein", "carbs", "fat"],
                        additionalProperties: false,
                      },
                      snacks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            calories: { type: "number" },
                          },
                          required: ["name", "calories"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["breakfast", "lunch", "dinner", "snacks"],
                    additionalProperties: false,
                  },
                  sleep: {
                    type: "object",
                    properties: {
                      bedtime: { type: "string" },
                      wakeTime: { type: "string" },
                      targetHours: { type: "number" },
                      tips: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["bedtime", "wakeTime", "targetHours", "tips"],
                    additionalProperties: false,
                  },
                  dailyTasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Specific, fun, measurable task with a clear goal" },
                        category: { type: "string", enum: ["workout", "meal", "hydration", "posture", "health", "sleep", "fun", "social", "gaming"] },
                      },
                      required: ["title", "category"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["workout", "meals", "sleep", "dailyTasks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_daily_plans" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No plan generated from AI");
    }

    const plans = JSON.parse(toolCall.function.arguments);
    console.log("Plans generated successfully");

    return new Response(
      JSON.stringify(plans),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating plans:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate plans" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
