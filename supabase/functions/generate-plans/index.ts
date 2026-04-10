import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { coords } = await req.json();
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader! } }
    });

    // 🌍 Resolve Location Name for Localized Meal Suggestions
    let detectedLocation = "Global";
    if (coords?.lat && coords?.lon) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`);
        const geoData = await geoRes.json();
        detectedLocation = geoData.address.country || geoData.address.state || "Global";
      } catch {
        // Fallback to Global if geolocation fails
        console.warn("Geolocation lookup failed, using Global");
      }
    }

    // 🎯 CRITICAL: System prompt with strict schema rules
    const systemPrompt = `You are the PosFitX AI Health Assistant. Generate a comprehensive, personalized wellness plan.
    Current Location: ${detectedLocation}. 
    
    ===== SCHEMA COMPLIANCE RULES (MANDATORY) =====
    1. MEALS: Return protein/carbs/fat as STRINGS with "g" suffix (CRITICAL!)
       Example: "protein": "25g", "carbs": "45g", "fat": "12g"
    
    2. INGREDIENTS & INSTRUCTIONS: Returns as STRING arrays (NOT objects)
       Example: ["2 cups rice", "1 cup lentils"] and ["Step 1: Boil...", "Step 2: Mix..."]
    
    3. EXERCISE FORMAT: Use "N x M" format for sets/reps
       Example: "sets": "3x12" or "duration": "45 mins"
    
    4. TIMES: Format as HH:MM AM/PM
       Example: "bedtime": "10:30 PM", "wakeTime": "6:30 AM"
    
    5. LOCATION AWARENESS: Suggest locally-available ingredients
       If Bangladesh: Use Rui fish, lentils, local vegetables
       If USA: Use chicken, common grocery items
       If Global: Use universally available items
    
    6. NO DEFAULTS: Generate realistic, personalized recommendations
    
    Generate NO mock data. All suggestions must be practical and health-optimized.`;

    // 🔧 Gemini API Request with Function Calling
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          }, 
          { 
            role: "user", 
            content: "Create today's comprehensive wellness plan." 
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_daily_plans",
            description: "Generate comprehensive workout, meal, and sleep plans optimized for user health",
            parameters: {
              type: "object",
              properties: {
                // ===== WORKOUT SCHEMA =====
                workout: {
                  type: "object",
                  properties: {
                    title: { 
                      type: "string", 
                      description: "Workout name (e.g., 'Full Body Strength Training')" 
                    },
                    duration: { 
                      type: "string", 
                      description: "Total duration (e.g., '60 mins', '45 minutes')" 
                    },
                    calories: { 
                      type: "number", 
                      description: "Estimated calorie burn (e.g., 450)" 
                    },
                    intensity: { 
                      type: "string", 
                      enum: ["beginner", "intermediate", "advanced"],
                      description: "Difficulty level" 
                    },
                    exercises: {
                      type: "array",
                      description: "Array of exercises",
                      items: {
                        type: "object",
                        properties: {
                          name: { 
                            type: "string", 
                            description: "Exercise name (e.g., 'Push-ups')" 
                          },
                          sets: { 
                            type: "string", 
                            description: "Sets and reps format (e.g., '3x12', '3 sets of 12')" 
                          },
                          duration: { 
                            type: "string", 
                            description: "Time per exercise (e.g., '5 mins', '300 seconds')" 
                          },
                          rest: { 
                            type: "string", 
                            description: "Rest period (e.g., '60 seconds', '1 min')" 
                          }
                        },
                        required: ["name"]
                      }
                    }
                  },
                  required: ["title", "duration", "calories", "exercises"]
                },

                // ===== MEALS SCHEMA =====
                meals: {
                  type: "object",
                  properties: {
                    breakfast: { $ref: "#/definitions/mealItem" },
                    lunch: { $ref: "#/definitions/mealItem" },
                    dinner: { $ref: "#/definitions/mealItem" },
                    snacks: {
                      type: "array",
                      description: "Light snacks for the day",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          calories: { type: "number" }
                        },
                        required: ["name", "calories"]
                      }
                    }
                  },
                  required: ["breakfast", "lunch", "dinner"]
                },

                // ===== SLEEP SCHEMA =====
                sleep: {
                  type: "object",
                  properties: {
                    bedtime: { 
                      type: "string", 
                      description: "Bedtime in HH:MM AM/PM format (e.g., '10:30 PM')" 
                    },
                    wakeTime: { 
                      type: "string", 
                      description: "Wake time in HH:MM AM/PM format (e.g., '6:30 AM')" 
                    },
                    targetHours: { 
                      type: "number", 
                      description: "Target sleep hours (e.g., 8, 7.5)" 
                    },
                    tips: {
                      type: "array",
                      description: "Sleep optimization tips",
                      items: { type: "string" }
                    },
                    routine: {
                      type: "array",
                      description: "Wind-down routine steps",
                      items: { type: "string" }
                    }
                  },
                  required: ["bedtime", "wakeTime", "targetHours", "tips"]
                },

                // ===== DAILY TASKS SCHEMA =====
                dailyTasks: {
                  type: "array",
                  description: "Daily task suggestions",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      category: { 
                        type: "string", 
                        enum: ["workout", "meal", "sleep", "posture", "hydration", "wellness", "health"] 
                      },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["title", "category"]
                  }
                }
              },
              // ===== DEFINITIONS: MEAL ITEM SCHEMA =====
              definitions: {
                mealItem: {
                  type: "object",
                  properties: {
                    meal: { 
                      type: "string", 
                      description: "Meal name (e.g., 'Grilled Chicken with Quinoa')" 
                    },
                    calories: { 
                      type: "number", 
                      description: "Total calories (e.g., 450)" 
                    },
                    protein: { 
                      type: "string", 
                      description: "Protein in grams WITH 'g' suffix (e.g., '25g', '35g') - MUST be STRING!" 
                    },
                    carbs: { 
                      type: "string", 
                      description: "Carbs in grams WITH 'g' suffix (e.g., '45g', '60g') - MUST be STRING!" 
                    },
                    fat: { 
                      type: "string", 
                      description: "Fat in grams WITH 'g' suffix (e.g., '12g', '15g') - MUST be STRING!" 
                    },
                    image_query: { 
                      type: "string", 
                      description: "Image search query for meal (e.g., 'healthy grilled chicken with quinoa')" 
                    },
                    ingredients: {
                      type: "array",
                      description: "List of ingredients with quantities (STRING ARRAY, not objects)",
                      items: { 
                        type: "string",
                        description: "E.g., '2 chicken breasts', '1 cup cooked quinoa'" 
                      }
                    },
                    instructions: {
                      type: "array",
                      description: "Step-by-step cooking instructions (STRING ARRAY, not objects)",
                      items: { 
                        type: "string",
                        description: "E.g., 'Step 1: Preheat oven to 400F', 'Step 2: Season chicken...'" 
                      }
                    }
                  },
                  required: ["meal", "calories", "protein", "carbs", "fat", "image_query", "ingredients", "instructions"]
                }
              },
              required: ["workout", "meals", "sleep"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_daily_plans" } },
      }),
    });

    // 📦 Parse and validate Gemini response
    const aiData = await response.json();
    
    if (!aiData.choices || !aiData.choices[0]?.message?.tool_calls) {
      throw new Error("Invalid Gemini response structure");
    }

    const toolCall = aiData.choices[0].message.tool_calls[0];
    if (toolCall.function.name !== "generate_daily_plans") {
      throw new Error("Unexpected function call from Gemini");
    }

    const plans = JSON.parse(toolCall.function.arguments);

    // 🔍 VALIDATION: Ensure response matches schema
    if (!plans.workout || !plans.meals || !plans.sleep) {
      throw new Error("Incomplete AI response: missing workout, meals, or sleep");
    }

    // Inject fallback meal images if image_query is provided
    ["breakfast", "lunch", "dinner"].forEach(k => {
      if (plans.meals[k]?.image_query) {
        plans.meals[k].image = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop`;
      }
    });

    return new Response(JSON.stringify(plans), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Plan generation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate plans" 
    }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});