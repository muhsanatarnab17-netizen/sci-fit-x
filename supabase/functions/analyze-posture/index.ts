import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PostureAnalysis {
  person_detected: boolean;
  visibility_confidence: number;
  score: number;
  cva_angle: number;
  shoulder_alignment: number;
  symmetry_score: number;
  issues: string[];
  recommendations: string[];
  details: string;
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Reject obviously tiny/invalid captures
    const MIN_BASE64 = 5_000;
    if (imageBase64.length < MIN_BASE64) {
      return new Response(
        JSON.stringify({ error: "Image is too small to analyze. Please retake the photo." }),
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
    const { data: postureHistory, error: historyError } = await supabase
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

    // Call Lovable AI Gateway for Gemini Vision
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp",
        messages: [
          {
            role: "system",
            content: `You are the clinical core of the PosFitX 'Tri-Metric' Posture Engine and a physical therapist. 
            Your goal is to provide precise, medical-grade skeletal alignment analysis from images.

            ${historyContext}

            CRITICAL VALIDATION RULES:
            - First determine if a PERSON is clearly visible (upper body required: head, neck, shoulders, and torso).
            - If no person is visible OR the person is too unclear/too far/too dark/too blurry, DO NOT guess posture.
            - In those invalid cases return:
              - person_detected: false
              - visibility_confidence: a number between 0 and 0.5
              - score: 0
              - cva_angle: 0
              - shoulder_alignment: 0
              - symmetry_score: 0
              - issues: []
              - recommendations: []
              - details: short explanation why analysis is not possible

            If person is visible and assessable, analyze based on these three clinical pillars:
            1. Craniovertebral Angle (CVA): The angle between a horizontal line through C7 and a line connecting C7 to the tragus. 
               - Normal: >50°
               - Forward Head Posture: <50°
            2. Shoulder Alignment: Horizontal tilt of the bi-acromial line (0-100%).
            3. Symmetry Score: Bilateral balance across the midsagittal plane (0-100%).
            
            Return structure:
            - person_detected: true
            - visibility_confidence: 0.6 to 1.0
            - score: overall 0-100
            - cva_angle: numerical degrees
            - shoulder_alignment: 0-100
            - symmetry_score: 0-100
            - issues: specific clinical observations (e.g., 'Rounded shoulders', 'Kyphosis')
            - recommendations: actionable corrective exercises/stretches
            - details: clinical analysis summary

            Be strict and evidence-based.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Perform a high-precision 'Tri-Metric' skeletal analysis. Calculate CVA Angle, Shoulder Alignment %, and Symmetry Score %. Identify specific postural deviations and provide corrective exercises."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_tri_metric_analysis",
              description: "Provides a structured Tri-Metric posture analysis with person-detection validation",
              parameters: {
                type: "object",
                properties: {
                  person_detected: { type: "boolean" },
                  visibility_confidence: { type: "number" },
                  score: { type: "number" },
                  cva_angle: { type: "number" },
                  shoulder_alignment: { type: "number" },
                  symmetry_score: { type: "number" },
                  issues: {
                    type: "array",
                    items: { type: "string" }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  details: { type: "string" }
                },
                required: ["person_detected", "visibility_confidence", "score", "cva_angle", "shoulder_alignment", "symmetry_score", "issues", "recommendations", "details"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_tri_metric_analysis" } }
      })
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No analysis generated from AI");
    }

    const analysis: PostureAnalysis = JSON.parse(toolCall.function.arguments);

    if (!analysis.person_detected || analysis.visibility_confidence < 0.6) {
      return new Response(
        JSON.stringify({
          error: "No person clearly detected in frame. Please stand in front of the camera and retake the scan.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));
    analysis.issues = Array.isArray(analysis.issues) ? analysis.issues : [];
    analysis.recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];

    console.log("Tri-Metric Analysis generated successfully:", analysis.score);

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing posture:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze posture" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});