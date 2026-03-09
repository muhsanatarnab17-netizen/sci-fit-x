import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PostureAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Reject payloads > ~10 MB (base64 overhead ~33%)
    const MAX_BASE64 = 14 * 1024 * 1024;
    if (typeof imageBase64 !== "string" || imageBase64.length > MAX_BASE64) {
      return new Response(
        JSON.stringify({ error: "Image too large (max 10 MB)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate supported image data-URI prefix
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(imageBase64)) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Supported: JPEG, PNG, WebP" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Analyzing posture from image...");

    // Fetch user's posture history for context
    const { data: postureHistory, error: historyError } = await supabaseClient
      .from("posture_assessments")
      .select("score, issues, recommendations, assessed_at")
      .eq("user_id", userId)
      .order("assessed_at", { ascending: false })
      .limit(5);

    if (historyError) {
      console.error("Error fetching posture history:", historyError);
    }

    // Build context about user's posture history
    let historyContext = "";
    if (postureHistory && postureHistory.length > 0) {
      const avgScore = Math.round(
        postureHistory.reduce((sum, p) => sum + p.score, 0) / postureHistory.length
      );
      const latestScore = postureHistory[0].score;
      const commonIssues = postureHistory
        .flatMap((p) => p.issues || [])
        .filter((issue, index, arr) => arr.indexOf(issue) === index)
        .slice(0, 3);

      historyContext = `
User's Posture History:
- Latest score: ${latestScore}/100
- Average score (last 5 assessments): ${avgScore}/100
- Common recurring issues: ${commonIssues.length > 0 ? commonIssues.join(", ") : "None recorded yet"}
- Total assessments: ${postureHistory.length}

Please consider this history when providing recommendations. If you see recurring issues, emphasize exercises that target those specific problems. If the user is improving, acknowledge their progress.`;
    } else {
      historyContext = "This is the user's first posture assessment. Provide comprehensive guidance.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert posture analyst and physical therapist. Analyze the person's posture in the image with precision.

${historyContext}

Provide:
1. A posture score from 0-100 (100 being perfect ergonomic alignment)
   - Deduct points for: forward head posture, rounded shoulders, slouching, uneven shoulders, anterior pelvic tilt, etc.
   - Be specific and realistic in scoring
2. Specific anatomical issues detected (e.g., "Forward head posture - ears ahead of shoulders", "Rounded shoulders - scapular protraction", "Anterior pelvic tilt")
3. Actionable, evidence-based recommendations:
   - Specific stretches with duration (e.g., "Doorway chest stretch - 30 seconds, 3 sets")
   - Strengthening exercises with sets/reps (e.g., "Chin tucks - 10 reps, 3 sets")
   - Ergonomic adjustments (e.g., "Raise monitor to eye level")
   - Daily habits to reinforce good posture

Be honest about severity. If posture is poor (score <60), emphasize the importance of correction. If improving based on history, acknowledge progress. Focus on the 2-3 most critical issues that will have the biggest impact.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze my posture in this image. Look carefully at head position, shoulder alignment, spinal curvature, and overall body positioning. Provide a detailed assessment with a numerical score, specific issues, and personalized exercise recommendations based on what you observe and my history."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_posture",
              description: "Return structured posture analysis results",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Posture score from 0-100"
                  },
                  issues: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific anatomical posture issues detected (e.g., 'Forward head posture', 'Rounded shoulders', 'Anterior pelvic tilt')"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific, actionable exercises and stretches with sets/reps/duration (e.g., 'Chin tucks - 10 reps, 3 sets daily', 'Doorway chest stretch - 30 seconds, 3x daily')"
                  },
                  details: {
                    type: "string",
                    description: "Brief overall assessment of the posture"
                  }
                },
                required: ["score", "issues", "recommendations", "details"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_posture" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      console.error("AI gateway error:", response.status);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No analysis result from AI");
    }

    const analysis: PostureAnalysis = JSON.parse(toolCall.function.arguments);
    analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));

    console.log("Posture analysis complete:", analysis.score);

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing posture:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during posture analysis" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
