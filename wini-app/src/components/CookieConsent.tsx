"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { hasConsentCookie, setConsentPreferences } from "@/lib/cookies";

const ease = [0.16, 1, 0.3, 1] as const;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasConsentCookie()) return;
    const timer = setTimeout(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate: delayed mount check
      setVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const accept = (all: boolean) => {
    setConsentPreferences({
      essential: true,
      analytics: all ? true : analytics,
      marketing: all ? true : marketing,
      timestamp: Date.now(),
    });
    setVisible(false);
  };

  const reject = () => {
    setConsentPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.5, ease }}
          className="fixed inset-x-0 z-[60] flex justify-center px-4"
          style={{ top: "calc(50% + clamp(4rem, 10vw, 7rem) + 3cm)" }}
        >
          <div
            className="w-full max-w-xl rounded-2xl px-8 py-6"
            style={{
              background: "rgba(13, 13, 13, 0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            <h3
              className="text-lg mb-2"
              style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "var(--cream-lightest)" }}
            >
              Cookie Preferences
            </h3>
            <p
              className="text-sm mb-4 leading-relaxed"
              style={{ fontFamily: "var(--font-jost-family)", fontWeight: 300, color: "rgba(250, 246, 240, 0.65)" }}
            >
              We use cookies to enhance your experience. Essential cookies are always active.
              You can customize optional cookies below.
            </p>

            <AnimatePresence>
              {customizing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 py-1">
                    <ToggleRow label="Essential" description="Required for the site to function" checked disabled />
                    <ToggleRow label="Analytics" description="Help us understand how you use WINi" checked={analytics} onChange={setAnalytics} />
                    <ToggleRow label="Marketing" description="Personalized recommendations" checked={marketing} onChange={setMarketing} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!customizing ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => accept(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                  style={{
                    fontFamily: "var(--font-jost-family)",
                    background: "var(--gold)",
                    color: "var(--charcoal)",
                  }}
                >
                  Accept All
                </button>
                <button
                  onClick={reject}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                  style={{
                    fontFamily: "var(--font-jost-family)",
                    background: "transparent",
                    color: "var(--cream-lightest)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  Reject Optional
                </button>
                <button
                  onClick={() => setCustomizing(true)}
                  className="text-sm transition-colors duration-200 shrink-0"
                  style={{
                    fontFamily: "var(--font-jost-family)",
                    fontWeight: 400,
                    color: "var(--gold)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}
                >
                  Customize
                </button>
              </div>
            ) : (
              <button
                onClick={() => accept(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.97] cursor-pointer"
                style={{
                  fontFamily: "var(--font-jost-family)",
                  background: "var(--gold)",
                  color: "var(--charcoal)",
                }}
              >
                Save Preferences
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--font-jost-family)", fontWeight: 500, color: "var(--cream-lightest)" }}
        >
          {label}
        </p>
        <p
          className="text-xs"
          style={{ fontFamily: "var(--font-jost-family)", fontWeight: 300, color: "rgba(250, 246, 240, 0.45)" }}
        >
          {description}
        </p>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className="relative shrink-0 rounded-full transition-colors duration-200"
        style={{
          width: 40,
          height: 22,
          background: checked ? "var(--gold)" : "rgba(255, 255, 255, 0.12)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "default" : "pointer",
          border: "none",
        }}
        aria-label={`Toggle ${label}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 rounded-full transition-transform duration-200 block"
          style={{
            width: 18,
            height: 18,
            background: "white",
            transform: checked ? "translateX(20px)" : "translateX(2px)",
          }}
        />
      </button>
    </div>
  );
}
