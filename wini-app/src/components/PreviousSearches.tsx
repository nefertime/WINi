"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "@/lib/types";
import { getSessions, deleteSession } from "@/lib/storage";

type PreviousSearchesProps = {
  onRestore: (session: Session) => void;
};

export default function PreviousSearches({ onRestore }: PreviousSearchesProps) {
  const [sessions, setSessions] = useState<Session[]>(() => getSessions());
  const [isOpen, setIsOpen] = useState(false);

  if (sessions.length === 0) return null;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-6">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-cream/40 hover:text-cream/60 transition-colors mx-auto block"
        style={{ fontFamily: "var(--font-cormorant-family)", fontStyle: "italic" }}
      >
        {isOpen ? "Hide" : "Previous searches"} ({sessions.length})
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-3"
          >
            <div className="space-y-2">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                  onClick={() => onRestore(session)}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm text-cream-lightest truncate"
                      style={{ fontFamily: "var(--font-cormorant-family)" }}
                    >
                      {session.preview}
                    </p>
                    <p className="text-xs text-cream/30 mt-0.5">
                      {formatDate(session.timestamp)} · {session.dishes.length} dishes · {session.wines.length} wines
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                      setSessions((prev) => prev.filter((s) => s.id !== session.id));
                    }}
                    className="opacity-0 group-hover:opacity-100 text-cream/20 hover:text-cream/50 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
