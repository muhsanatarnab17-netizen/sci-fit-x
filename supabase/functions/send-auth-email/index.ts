import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

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

const getEmailContent = (type: string, confirmUrl: string) => {
  switch (type) {
    case "signup":
      return {
        subject: "Welcome to FitLife Pro - Confirm Your Email",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #3b82f6; font-size: 32px; margin: 0;">FitLife Pro</h1>
              <p style="color: #94a3b8; margin-top: 8px;">Your AI-Powered Fitness Partner</p>
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #e2e8f0; font-size: 24px; margin: 0 0 16px 0;">Welcome aboard! 🎉</h2>
              <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
                You're one step away from starting your fitness transformation. Click the button below to confirm your email and unlock your personalized health journey.
              </p>
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Confirm Email & Get Started
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `,
      };
    case "recovery":
      return {
        subject: "Reset Your FitLife Pro Password",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #3b82f6; font-size: 32px; margin: 0;">FitLife Pro</h1>
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #e2e8f0; font-size: 24px; margin: 0 0 16px 0;">Password Reset Request</h2>
              <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to set a new password.
              </p>
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      };
    case "magic_link":
      return {
        subject: "Your FitLife Pro Login Link",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #3b82f6; font-size: 32px; margin: 0;">FitLife Pro</h1>
            </div>
            
            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #e2e8f0; font-size: 24px; margin: 0 0 16px 0;">Magic Login Link</h2>
              <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0;">
                Click the button below to sign in to your FitLife Pro account.
              </p>
              <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In to FitLife Pro
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 0;">
              This link expires in 1 hour.
            </p>
          </div>
        `,
      };
    default:
      return {
        subject: "FitLife Pro - Email Confirmation",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
            <h1 style="color: #3b82f6;">FitLife Pro</h1>
            <p>Click below to confirm:</p>
            <a href="${confirmUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Confirm</a>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailRequest = await req.json();
    const { email, type, token_hash, redirect_to } = payload;

    if (!email || !type) {
      throw new Error("Missing required fields: email and type");
    }

    // Build the confirmation URL
    const baseUrl = redirect_to || Deno.env.get("SUPABASE_URL");
    const confirmUrl = token_hash 
      ? `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${type}&redirect_to=${redirect_to || ''}`
      : redirect_to || baseUrl;

    const { subject, html } = getEmailContent(type, confirmUrl || "");

    // Get the from email - use the verified domain
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "FitLife Pro <noreply@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    console.log("Auth email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending auth email:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
