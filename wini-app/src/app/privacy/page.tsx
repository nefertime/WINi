import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — WINi",
  description: "How WINi handles your data, your rights, and our commitments.",
};

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen px-6 py-16 max-w-2xl mx-auto"
      style={{ background: "var(--charcoal)", color: "var(--cream-lightest)" }}
    >
      <Link
        href="/"
        className="inline-block mb-8 text-sm"
        style={{ fontFamily: "var(--font-jost-family)", color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: "3px" }}
      >
        &larr; Back to WINi
      </Link>

      <h1
        className="text-3xl mb-8"
        style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}
      >
        Privacy Policy
      </h1>

      <div className="space-y-6 text-sm leading-relaxed" style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.8)" }}>
        <p><strong style={{ color: "var(--cream-lightest)" }}>Effective date:</strong> March 2026</p>

        <Section title="1. What We Collect">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> name, email, hashed password (when you register).</li>
            <li><strong>Pairing data:</strong> menu photos you upload, dish/wine pairing results, and saved favorites.</li>
            <li><strong>Usage data:</strong> anonymous page views and feature usage (only with your explicit consent).</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> sell your data to third parties. Ever.</p>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide the wine pairing service (analyzing menus, saving results).</li>
            <li>To improve WINi through anonymized aggregate patterns (only with your consent).</li>
            <li>To send transactional emails (password reset, account verification).</li>
          </ul>
        </Section>

        <Section title="3. AI Processing">
          <p>
            Menu photos and text are sent to Anthropic&apos;s Claude API for analysis.
            Anthropic does not use your data for training. See{" "}
            <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
              Anthropic&apos;s privacy policy
            </a>.
          </p>
        </Section>

        <Section title="4. Data Storage & Security">
          <p>
            Your data is stored on secure servers within the EU (Azure North Europe).
            Passwords are hashed with bcrypt (cost 12). Sessions use encrypted JWT tokens.
            All connections are HTTPS-encrypted.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            WINi uses essential cookies for authentication and consent preferences.
            Analytics cookies are only set with your explicit opt-in via our cookie banner.
          </p>
        </Section>

        <Section title="6. Your Rights (GDPR)">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Access</strong> — Export all your data from Account settings.</li>
            <li><strong>Rectification</strong> — Edit your profile anytime.</li>
            <li><strong>Erasure</strong> — Delete your account and all data permanently.</li>
            <li><strong>Data portability</strong> — Download your data as JSON.</li>
            <li><strong>Withdraw consent</strong> — Revoke analytics consent anytime.</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          <ul className="list-disc pl-5 space-y-1">
            <li>Account data: kept until you delete your account.</li>
            <li>Pairing sessions: kept until you delete them or your account.</li>
            <li>Menu photos: processed in-memory only, never stored on our servers.</li>
          </ul>
        </Section>

        <Section title="8. Third-Party Services">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Anthropic (Claude API)</strong> — AI analysis (US-based, no training on your data).</li>
            <li><strong>Stripe</strong> — Payment processing (PCI DSS compliant).</li>
            <li><strong>Resend</strong> — Transactional emails.</li>
            <li><strong>Microsoft Azure</strong> — Hosting (EU region).</li>
          </ul>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy questions or data requests, email:{" "}
            <a href="mailto:privacy@alfredleppanen.com" style={{ color: "var(--gold)" }}>
              privacy@alfredleppanen.com
            </a>
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
