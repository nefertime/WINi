"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { signIn } from "next-auth/react";

type AuthView = "signin" | "signup" | "forgot";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup";
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function AuthModal({ isOpen, onClose, initialView = "signin" }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const reducedMotion = useReducedMotion();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setForgotSent(false);
  };

  const switchView = (v: AuthView) => {
    resetForm();
    setView(v);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      onClose();
      resetForm();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
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

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but sign-in failed. Try signing in manually.");
    } else {
      onClose();
      resetForm();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setForgotSent(true);
  };

  const handleSocial = (provider: string) => {
    signIn(provider);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55]"
            style={{ background: "rgba(0, 0, 0, 0.6)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease }}
            className="fixed inset-0 z-[56] flex items-center justify-center px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          >
            <div
              className="w-full max-w-sm rounded-2xl px-6 py-8 relative"
              style={{
                background: "linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6)",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full p-1 transition-opacity duration-200 hover:opacity-100"
                style={{ color: "rgba(250, 246, 240, 0.5)", cursor: "pointer", background: "none", border: "none" }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <AnimatePresence mode="wait">
                {view === "signin" && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="text-2xl mb-6 text-center"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}
                    >
                      Welcome Back
                    </h2>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <InputField label="Email" type="email" value={email} onChange={setEmail} />
                      <InputField label="Password" type="password" value={password} onChange={setPassword} />

                      {error && <p className="text-sm" style={{ fontFamily: "var(--font-jost-family)", color: "var(--burgundy-glow)" }}>{error}</p>}

                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-xs block"
                        style={{
                          fontFamily: "var(--font-jost-family)",
                          color: "var(--gold)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        Forgot password?
                      </button>

                      <SubmitButton loading={loading}>Sign In</SubmitButton>
                    </form>

                    <Divider />
                    <SocialButtons onSocial={handleSocial} />

                    <p
                      className="text-center text-sm mt-5"
                      style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
                    >
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => switchView("signup")}
                        style={{ color: "var(--gold)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                      >
                        Create one
                      </button>
                    </p>
                  </motion.div>
                )}

                {view === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="text-2xl mb-6 text-center"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}
                    >
                      Create Account
                    </h2>

                    <form onSubmit={handleSignUp} className="space-y-4">
                      <InputField label="Email" type="email" value={email} onChange={setEmail} />
                      <InputField label="Password" type="password" value={password} onChange={setPassword} />
                      <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />

                      {error && <p className="text-sm" style={{ fontFamily: "var(--font-jost-family)", color: "var(--burgundy-glow)" }}>{error}</p>}

                      <SubmitButton loading={loading}>Create Account</SubmitButton>
                    </form>

                    <Divider />
                    <SocialButtons onSocial={handleSocial} />

                    <p
                      className="text-center text-sm mt-5"
                      style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
                    >
                      Already have an account?{" "}
                      <button
                        onClick={() => switchView("signin")}
                        style={{ color: "var(--gold)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                      >
                        Sign in
                      </button>
                    </p>
                  </motion.div>
                )}

                {view === "forgot" && (
                  <motion.div
                    key="forgot"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className="text-2xl mb-6 text-center"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}
                    >
                      Reset Password
                    </h2>

                    {forgotSent ? (
                      <div className="text-center py-4">
                        <p
                          className="text-sm leading-relaxed"
                          style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.7)" }}
                        >
                          If an account exists with that email, you&apos;ll receive a password reset link.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleForgot} className="space-y-4">
                        <InputField label="Email" type="email" value={email} onChange={setEmail} />
                        {error && <p className="text-sm" style={{ fontFamily: "var(--font-jost-family)", color: "var(--burgundy-glow)" }}>{error}</p>}
                        <SubmitButton loading={loading}>Send Reset Link</SubmitButton>
                      </form>
                    )}

                    <p
                      className="text-center text-sm mt-5"
                      style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
                    >
                      <button
                        onClick={() => switchView("signin")}
                        style={{ color: "var(--gold)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}
                      >
                        Back to Sign In
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InputField({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="block text-xs mb-1.5"
        style={{ fontFamily: "var(--font-jost-family)", fontWeight: 400, color: "rgba(250, 246, 240, 0.5)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
        style={{
          fontFamily: "var(--font-jost-family)",
          background: "rgba(255, 255, 255, 0.04)",
          color: "var(--cream-lightest)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
      />
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
      style={{
        fontFamily: "var(--font-jost-family)",
        background: "var(--gold)",
        color: "var(--charcoal)",
      }}
    >
      {loading ? "..." : children}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "rgba(255, 255, 255, 0.08)" }} />
      <span
        className="text-xs"
        style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.35)" }}
      >
        or continue with
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(255, 255, 255, 0.08)" }} />
    </div>
  );
}

function SocialButtons({ onSocial }: { onSocial: (provider: string) => void }) {
  const providers = [
    { id: "google", label: "Google", color: "#4285F4" },
    { id: "facebook", label: "Meta", color: "#1877F2" },
    { id: "microsoft-entra-id", label: "Microsoft", color: "#00A4EF" },
  ];

  return (
    <div className="space-y-2">
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => onSocial(p.id)}
          className="w-full py-2.5 rounded-xl text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.97] flex items-center justify-center gap-2"
          style={{
            fontFamily: "var(--font-jost-family)",
            fontWeight: 400,
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--cream-lightest)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderLeft: `3px solid ${p.color}`,
            cursor: "pointer",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
