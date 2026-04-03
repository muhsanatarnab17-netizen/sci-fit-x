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

    // 🌍 Resolve Location Name
    let detectedLocation = "Global";
    if (coords?.lat && coords?.lon) {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`);
      const geoData = await geoRes.json();
      detectedLocation = geoData.address.country || geoData.address.state || "Global";
    }

    const systemPrompt = `You are the PosFitX AI. Generate a workout and meal plan.
    Current Location: ${detectedLocation}. 
    
    RULES:
    1. MEALS: Suggest ingredients available in ${detectedLocation} (e.g., if Bangladesh, use Rui fish/lentils).
    2. RECIPES: Detailed instructions + ingredients. No hostel mess options.
    3. IMAGES: Provide an English 'image_query'.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Create today's plan." }],
        tools: [{
          type: "function",
          function: {
            name: "generate_daily_plans",
            parameters: {
              type: "object",
              properties: {
                workout: { type: "object", properties: { title: { type: "string" }, exercises: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sets: { type: "string" } } } } } },
                meals: {
                  type: "object",
                  properties: {
                    breakfast: { $ref: "#/definitions/meal" },
                    lunch: { $ref: "#/definitions/meal" },
                    dinner: { $ref: "#/definitions/meal" }
                  }
                }
              },
              definitions: {
                meal: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    calories: { type: "number" },
                    protein: { type: "string" },
                    image_query: { type: "string" },
                    ingredients: { type: "array", items: { type: "string" } },
                    instructions: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_daily_plans" } },
      }),
    });

    const aiData = await response.json();
    const plans = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

    // Inject Image URLs
    ["breakfast", "lunch", "dinner"].forEach(k => {
      plans.meals[k].image = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop`;
    });

    return new Response(JSON.stringify(plans), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});