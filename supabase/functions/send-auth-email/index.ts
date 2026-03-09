import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthEmailRequest {
  email: string;
  type: "signup" | "recovery" | "email_change" | "magic_link";
  token?: string;
  token_hash?: string;
  redirect_to?: string;
}

const VALID_TYPES = ["signup", "recovery", "email_change", "magic_link"];

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#080b14;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080b14;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;border-radius:16px;overflow:hidden;border:1px solid rgba(59,130,246,0.15);background:linear-gradient(168deg,#0d1025 0%,#111827 100%);">
  <!-- Header -->
  <tr><td style="padding:32px 32px 0;text-align:center;">
    <div style="display:inline-block;padding:10px 20px;border-radius:40px;background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15));border:1px solid rgba(59,130,246,0.2);margin-bottom:16px;">
      <span style="color:#60a5fa;font-size:22px;font-weight:700;letter-spacing:0.5px;">PosFitx</span>
    </div>
    <p style="color:#64748b;font-size:13px;margin:8px 0 0;">AI-Powered Fitness &amp; Posture Partner</p>
  </td></tr>
  <!-- Content -->
  <tr><td style="padding:28px 32px 32px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:0 32px 28px;text-align:center;border-top:1px solid rgba(100,116,139,0.15);">
    <p style="color:#475569;font-size:12px;margin:20px 0 0;line-height:1.6;">
      © ${new Date().getFullYear()} PosFitx · Your AI Health Companion<br/>
      <span style="color:#374151;">This is an automated message. Please do not reply.</span>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const ctaButton = (url: string, label: string) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
<tr><td style="border-radius:10px;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);box-shadow:0 4px 24px rgba(59,130,246,0.35);">
  <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">${label}</a>
</td></tr></table>`;

const getEmailContent = (type: string, confirmUrl: string) => {
  switch (type) {
    case "signup":
      return {
        subject: "Welcome to PosFitx — Confirm Your Email",
        html: emailWrapper(`
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome aboard! 🎉</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 4px;">
            You're one step away from starting your AI-powered fitness transformation.
          </p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">
            Confirm your email below to unlock personalized workouts, posture analysis, and smart nutrition plans.
          </p>
          ${ctaButton(confirmUrl, "Confirm Email &amp; Get Started")}
          <p style="color:#475569;font-size:13px;text-align:center;margin:0;">If you didn't create an account, you can safely ignore this email.</p>
        `),
      };
    case "recovery":
      return {
        subject: "PosFitx — Reset Your Password",
        html: emailWrapper(`
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Password Reset 🔒</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">
            We received a request to reset your PosFitx password. Click below to choose a new one.
          </p>
          ${ctaButton(confirmUrl, "Reset Password")}
          <p style="color:#475569;font-size:13px;text-align:center;margin:0;">This link expires in 1 hour. Didn't request this? Ignore this email.</p>
        `),
      };
    case "magic_link":
      return {
        subject: "PosFitx — Your Login Link",
        html: emailWrapper(`
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Magic Login Link ✨</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">
            Tap the button below to sign in to your PosFitx account instantly — no password needed.
          </p>
          ${ctaButton(confirmUrl, "Sign In to PosFitx")}
          <p style="color:#475569;font-size:13px;text-align:center;margin:0;">This link expires in 1 hour.</p>
        `),
      };
    default:
      return {
        subject: "PosFitx — Email Confirmation",
        html: emailWrapper(`
          <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">Confirm Your Email</h1>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">Click the button below to confirm your email address.</p>
          ${ctaButton(confirmUrl, "Confirm")}
        `),
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
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
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: AuthEmailRequest = await req.json();
    const { email, type, token_hash, redirect_to } = payload;

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate type
    if (!VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid email type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce email ownership: the caller can only send auth emails to their own email
    const callerEmail = (claimsData.claims as Record<string, unknown>).email as string | undefined;
    if (callerEmail && email.toLowerCase() !== callerEmail.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "You can only send auth emails to your own email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate redirect_to against allowed domains
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const allowedOrigins = [
      supabaseUrl,
      "https://sci-fit-x.lovable.app",
      "https://id-preview--52e56e5c-67de-441a-a285-866601d5c260.lovable.app",
    ].filter(Boolean);

    let validatedRedirect = supabaseUrl;
    if (redirect_to) {
      try {
        const redirectUrl = new URL(redirect_to);
        const isAllowed = allowedOrigins.some((origin) => {
          try {
            return new URL(origin).origin === redirectUrl.origin;
          } catch { return false; }
        });
        if (!isAllowed) {
          return new Response(
            JSON.stringify({ error: "Invalid redirect URL" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        validatedRedirect = redirect_to;
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid redirect URL format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const baseUrl = validatedRedirect;
    const confirmUrl = token_hash 
      ? `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${type}&redirect_to=${validatedRedirect}`
      : validatedRedirect;

    const { subject, html } = getEmailContent(type, confirmUrl || "");

    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "PosFitx <noreply@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    console.log("Auth email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending auth email");
    
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
