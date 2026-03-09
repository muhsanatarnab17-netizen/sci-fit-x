import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'hsl(220 22% 5%)' }}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: March 9, 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly: email, name, username, health metrics (height, weight, age), fitness goals, dietary preferences, and posture analysis images. Images are processed in real-time and not permanently stored.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>Your data is used exclusively to provide personalized fitness plans, posture analysis, nutrition guidance, and progress tracking. We do not sell, rent, or share your personal data with third parties for marketing.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Storage & Security</h2>
            <p>Your data is stored securely with encryption at rest and in transit. We use industry-standard security measures including Row-Level Security to ensure you can only access your own data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Your Rights (GDPR)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access</strong> your personal data via your Profile page</li>
              <li><strong>Rectify</strong> inaccurate data through Profile settings</li>
              <li><strong>Delete</strong> your account and all associated data permanently</li>
              <li><strong>Export</strong> your data by contacting us</li>
              <li><strong>Withdraw consent</strong> at any time by deleting your account</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. When you delete your account, all personal data is permanently removed within 30 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
            <p>We use AI services for posture analysis and plan generation. Data sent to AI models is processed in real-time and not stored by third parties. Authentication emails are delivered via secure email infrastructure.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management only. No tracking or advertising cookies are used.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Children's Privacy</h2>
            <p>The Service is not intended for users under 16. We do not knowingly collect data from children.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated date.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p>For privacy-related inquiries, please contact us through the app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
