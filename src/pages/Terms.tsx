import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'hsl(220 22% 5%)' }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-3xl font-display font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: March 9, 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using PosFitx ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>PosFitx provides AI-powered fitness coaching including posture analysis, workout planning, nutrition guidance, and daily task management. The Service is for informational purposes only and does not constitute medical advice.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information during registration.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Health Disclaimer</h2>
            <p>PosFitx is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any fitness or nutrition program. Use the Service at your own risk.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. User Content</h2>
            <p>You retain ownership of data you submit. By using the Service, you grant us a limited license to process your data solely to provide the Service. We do not sell your personal data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Prohibited Uses</h2>
            <p>You may not misuse the Service, attempt unauthorized access, reverse-engineer the platform, or use it for any unlawful purpose.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time from your Profile settings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. We are not liable for any injuries, health issues, or damages arising from your use of the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>For questions about these Terms, please contact us through the app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
