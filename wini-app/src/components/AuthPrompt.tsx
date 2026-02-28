"use client";

import { motion, AnimatePresence } from "framer-motion";

type AuthPromptProps = {
  show: boolean;
  message?: string;
  onSignIn: () => void;
  onDismiss: () => void;
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function AuthPrompt({
  show,
  message = "Sign in to save your favorites",
  onSignIn,
  onDismiss,
}: AuthPromptProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2, ease }}
          className="fixed z-[60] rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            bottom: "clamp(5rem, 12vh, 8rem)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13, 13, 13, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          <p
            className="text-sm whitespace-nowrap"
            style={{
              fontFamily: "var(--font-cormorant-family)",
              fontStyle: "italic",
              color: "var(--cream-lightest)",
            }}
          >
            {message}
          </p>
          <button
            onClick={onSignIn}
            className="text-xs py-1 px-3 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.97] shrink-0"
            style={{
              fontFamily: "var(--font-jost-family)",
              fontWeight: 500,
              color: "var(--charcoal)",
              background: "var(--gold)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={onDismiss}
            className="shrink-0 flex items-center justify-center transition-opacity duration-150 hover:opacity-100"
            style={{ color: "rgba(250, 246, 240, 0.3)", cursor: "pointer", background: "none", border: "none", padding: "2px" }}
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
