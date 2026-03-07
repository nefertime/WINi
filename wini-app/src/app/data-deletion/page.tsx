import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion — WINi",
  description: "How to delete your data from WINi.",
};

export default function DataDeletionPage() {
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
        Data Deletion
      </h1>

      <div className="space-y-6 text-sm leading-relaxed" style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.8)" }}>
        <p>
          WINi respects your right to control your personal data. You can request deletion of all data associated with your account at any time.
        </p>

        <Section title="What Gets Deleted">
          <ul className="list-disc pl-5 space-y-1">
            <li>Your account profile (name, email, password hash)</li>
            <li>All saved wine pairings and session history</li>
            <li>All favorite wines and paired-with data</li>
            <li>Any linked social login connections (Google, Facebook, Microsoft)</li>
          </ul>
        </Section>

        <Section title="How to Delete Your Data">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>From your account:</strong> Open the hamburger menu, go to Account, and use the delete account option. This permanently removes all your data.
            </li>
            <li>
              <strong>By email:</strong> Send a request to{" "}
              <a href="mailto:privacy@alfredleppanen.com" style={{ color: "var(--gold)" }}>
                privacy@alfredleppanen.com
              </a>{" "}
              from the email address associated with your account. We will process your request within 30 days.
            </li>
          </ol>
        </Section>

        <Section title="Guest Users">
          <p>
            If you used WINi without creating an account, your data is stored only in your browser&apos;s local storage. Clear your browser data or site data for wini.alfredleppanen.com to remove it.
          </p>
        </Section>

        <Section title="Facebook Login Users">
          <p>
            If you signed in with Facebook, you can also remove WINi from your Facebook settings:{" "}
            <strong>Settings &amp; Privacy &rarr; Settings &rarr; Apps and Websites &rarr; Remove WINi</strong>.
            This will revoke WINi&apos;s access to your Facebook data. To also delete the data stored on our servers, follow the steps above.
          </p>
        </Section>

        <Section title="Processing Time">
          <p>
            Deletion requests are processed within 30 days. You will receive a confirmation email once your data has been permanently removed.
          </p>
        </Section>

        <p className="pt-4" style={{ color: "rgba(250, 246, 240, 0.5)" }}>
          For more information, see our{" "}
          <Link href="/privacy" style={{ color: "var(--gold)" }}>Privacy Policy</Link>.
        </p>
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
