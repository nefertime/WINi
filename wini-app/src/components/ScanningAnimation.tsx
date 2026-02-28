"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

function getMealTime(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "brunch";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 17) return "afternoon";
  return "evening";
}

export default function ScanningAnimation() {
  const [meal] = useState(() => getMealTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "rgba(13, 11, 14, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <motion.div
        initial={{ scale: 1.2 }}
        animate={{ scale: 0.8 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Logo variant="compact" />
      </motion.div>

      {/* Wine pour animation */}
      <motion.div className="mt-12 relative w-1 overflow-hidden" style={{ height: 80 }}>
        <motion.div
          className="absolute top-0 left-0 w-full rounded-full"
          style={{
            background: "var(--burgundy-glow)",
            filter: "drop-shadow(0 0 6px var(--burgundy-glow)) drop-shadow(0 0 12px rgba(155, 35, 53, 0.4))",
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: [0, 80, 80, 0],
            opacity: [0, 1, 1, 0],
            y: [0, 0, 0, 80],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-cream/60 text-sm tracking-widest uppercase"
        style={{ fontFamily: "var(--font-cormorant-family)", letterSpacing: "0.2em" }}
      >
        Pairing your {meal}...
      </motion.p>

      {/* Scanning line — vivid glow */}
      <motion.div
        className="absolute left-0 w-full h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent 5%, rgba(210, 120, 140, 0.4) 30%, var(--burgundy-glow) 50%, rgba(210, 120, 140, 0.4) 70%, transparent 95%)",
          boxShadow: "0 0 12px 2px var(--burgundy-glow), 0 0 30px 4px rgba(155, 35, 53, 0.3)",
        }}
        animate={{ top: ["20%", "80%", "20%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
