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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const reducedMotion = useReducedMotion();

  const resetForm = () => {
    setName("");
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
      body: JSON.stringify({ email, password, name: name || undefined }),
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
                      <InputField label="Name" type="text" value={name} onChange={setName} required={false} />
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
  required = true,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        className="block text-xs mb-1.5"
        style={{ fontFamily: "var(--font-jost-family)", fontWeight: 400, color: "rgba(250, 246, 240, 0.5)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200"
          style={{
            fontFamily: "var(--font-jost-family)",
            background: "rgba(255, 255, 255, 0.04)",
            color: "var(--cream-lightest)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            paddingRight: isPassword ? "2.5rem" : undefined,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 transition-opacity duration-150"
            style={{ color: "rgba(250, 246, 240, 0.4)", background: "none", border: "none", cursor: "pointer" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
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

function SocialIcon({ id }: { id: string }) {
  if (id === "google") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    );
  }
  if (id === "microsoft-entra-id") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
        <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
        <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
        <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
      </svg>
    );
  }
  return null;
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
          <SocialIcon id={p.id} />
          {p.label}
        </button>
      ))}
    </div>
  );
}
