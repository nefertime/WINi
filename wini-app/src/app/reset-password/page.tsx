"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageShell><p style={{ color: "rgba(250, 246, 240, 0.7)" }}>Loading...</p></PageShell>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json();
      setError(data.error || "Reset failed");
      if (data.error?.includes("expired") || data.error?.includes("invalid")) {
        setStatus("error");
      }
    }
  };

  if (!token) {
    return (
      <PageShell>
        <p style={{ color: "var(--burgundy-glow)" }}>Invalid reset link. Please request a new one.</p>
        <BackLink />
      </PageShell>
    );
  }

  if (status === "success") {
    return (
      <PageShell>
        <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}>
          Password Reset
        </h1>
        <p style={{ color: "rgba(250, 246, 240, 0.7)" }}>
          Your password has been reset. You can now sign in with your new password.
        </p>
        <BackLink />
      </PageShell>
    );
  }

  if (status === "error") {
    return (
      <PageShell>
        <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}>
          Link Expired
        </h1>
        <p style={{ color: "rgba(250, 246, 240, 0.7)" }}>
          This reset link has expired. Please request a new password reset.
        </p>
        <BackLink />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-2xl mb-6" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}>
        Set New Password
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <input
          type="password"
          placeholder="New password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
          style={{
            fontFamily: "var(--font-jost-family)",
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--cream-lightest)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
          style={{
            fontFamily: "var(--font-jost-family)",
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--cream-lightest)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />
        {error && (
          <p className="text-sm" style={{ color: "var(--burgundy-glow)" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          style={{
            fontFamily: "var(--font-jost-family)",
            background: "var(--gold)",
            color: "var(--charcoal)",
          }}
        >
          {loading ? "..." : "Reset Password"}
        </button>
      </form>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--charcoal)", color: "var(--cream-lightest)" }}
    >
      {children}
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-block mt-6 text-sm"
      style={{ fontFamily: "var(--font-jost-family)", color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: "3px" }}
    >
      Back to WINi
    </Link>
  );
}
