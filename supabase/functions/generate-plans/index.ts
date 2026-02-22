import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
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

    const { profile } = await req.json();
    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile data required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert fitness, nutrition, and sleep coach. Generate a personalized daily plan based on the user's profile. Be specific with exercises, meals, and sleep recommendations. Adapt everything to their experience level, goals, dietary restrictions, allergies, injuries, and body metrics.`;

    const userPrompt = `Create a personalized daily plan for this user:
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
              description: "Return a complete personalized daily plan with workout, meals, and sleep schedule",
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
                        title: { type: "string" },
                        category: { type: "string", enum: ["workout", "meal", "hydration", "posture", "health", "sleep"] },
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
