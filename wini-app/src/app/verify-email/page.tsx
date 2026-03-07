"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--charcoal)", color: "var(--cream-lightest)" }}>
        <p style={{ fontFamily: "var(--font-jost-family)" }}>Loading...</p>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate: one-time validation on mount
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        setStatus(res.ok ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--charcoal)", color: "var(--cream-lightest)" }}
    >
      {status === "verifying" && (
        <p style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.7)" }}>
          Verifying your email...
        </p>
      )}
      {status === "success" && (
        <>
          <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}>
            Email Verified
          </h1>
          <p style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.7)" }}>
            Your email has been verified. You can now use all features.
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 700 }}>
            Verification Failed
          </h1>
          <p style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.7)" }}>
            This verification link is invalid or has expired.
          </p>
        </>
      )}
      <Link
        href="/"
        className="inline-block mt-6 text-sm"
        style={{ fontFamily: "var(--font-jost-family)", color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: "3px" }}
      >
        Back to WINi
      </Link>
    </main>
  );
}
