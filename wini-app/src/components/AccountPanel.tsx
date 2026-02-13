"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

type AccountPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
  const { data: session, update } = useSession();
  const reducedMotion = useReducedMotion();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [age, setAge] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate prop-to-state sync
      setName(session.user.name ?? "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("");
      setError("");
    }
  }, [isOpen, session?.user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        age: age ? parseInt(age) : null,
      }),
    });

    if (res.ok) {
      setMessage("Profile updated");
      await update();
    } else {
      const data = await res.json();
      setError(data.error || "Update failed");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setMessage("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setError(data.error || "Password change failed");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="account-panel"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
          transition={{ duration: 0.25, ease }}
          className="fixed z-50 rounded-xl px-5 py-5 overflow-y-auto"
          style={{
            width: 260,
            maxHeight: "calc(100dvh - 8rem)",
            left: "19.5rem",
            top: "calc(1rem + clamp(2.75rem, 8vw, 4rem) + 0.5rem)",
            background: "rgba(13, 13, 13, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h3
            className="text-base mb-4"
            style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}
          >
            Edit Profile
          </h3>

          {/* Name */}
          <label
            className="block text-xs mb-1"
            style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
          >
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
          />

          {/* Email (read-only) */}
          <label
            className="block text-xs mb-1"
            style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
          >
            Email
          </label>
          <input
            type="email"
            value={session?.user?.email ?? ""}
            readOnly
            className="w-full px-3 py-2 rounded-lg text-sm mb-3"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.02)",
              color: "rgba(250, 246, 240, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          />

          {/* Age */}
          <label
            className="block text-xs mb-1"
            style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
          >
            Age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="18"
            max="120"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
          />

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 mb-4"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "var(--gold)",
              color: "var(--charcoal)",
            }}
          >
            Save Changes
          </button>

          {/* Divider */}
          <div className="w-full h-px mb-3" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

          {/* Change password */}
          <p
            className="text-xs mb-2"
            style={{ fontFamily: "var(--font-jost-family)", fontWeight: 500, color: "rgba(250, 246, 240, 0.5)" }}
          >
            Change Password
          </p>

          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
          />
          <input
            type="password"
            placeholder="New password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "rgba(255, 255, 255, 0.04)",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
          />

          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword}
            className="w-full py-2 rounded-xl text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 mb-3"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "transparent",
              color: "var(--cream-lightest)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            Update Password
          </button>

          {/* Messages */}
          {message && (
            <p className="text-xs text-center mb-3" style={{ fontFamily: "var(--font-jost-family)", color: "var(--gold)" }}>
              {message}
            </p>
          )}
          {error && (
            <p className="text-xs text-center mb-3" style={{ fontFamily: "var(--font-jost-family)", color: "var(--burgundy-glow)" }}>
              {error}
            </p>
          )}

          {/* Divider */}
          <div className="w-full h-px mb-3" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

          {/* Sign out */}
          <button
            onClick={() => { onClose(); signOut(); }}
            className="w-full py-2 rounded-xl text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
            style={{
              fontFamily: "var(--font-jost-family)",
              background: "transparent",
              color: "var(--burgundy-glow)",
              border: "1px solid rgba(155, 35, 53, 0.3)",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
