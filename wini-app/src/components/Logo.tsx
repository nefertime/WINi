"use client";

import { motion } from "framer-motion";

type LogoProps = {
  variant?: "split" | "compact";
  className?: string;
};

const ease = [0.16, 1, 0.3, 1] as const;
const GAP = "0.12em"; // equal breathing room from center on each side

export default function Logo({ variant = "split", className = "" }: LogoProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`relative w-full ${className}`}>
      {/* Compact mode: small centered "WINi" — colors match the split background */}
      <motion.div
        className="flex items-baseline justify-center select-none"
        animate={{
          opacity: isCompact ? 1 : 0,
          scale: isCompact ? 1 : 0.8,
          y: isCompact ? 0 : -10,
          x: isCompact ? "-0.6em" : 0,
        }}
        transition={{ duration: 0.6, ease }}
        style={{
          position: isCompact ? "relative" : "absolute",
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: isCompact ? "auto" : "none",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cinzel-family)",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5.5vw, 2.8rem)",
            color: "#E8DCC8",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          WI
        </span>
        <span
          style={{
            fontFamily: "var(--font-cinzel-family)",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5.5vw, 2.8rem)",
            color: "#1A0A0E",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}
        >
          N
        </span>
        <span
          style={{
            fontFamily: "var(--font-cormorant-family)",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
            color: "#5C0A1E",
            lineHeight: 1,
            marginLeft: "-0.05em",
            position: "relative",
            top: "0.05em",
          }}
        >
          i
        </span>
      </motion.div>

      {/* Split mode: each half anchored to 50% center */}
      <motion.div
        className="relative select-none"
        animate={{
          opacity: isCompact ? 0 : 1,
          scale: isCompact ? 0.6 : 1,
        }}
        transition={{ duration: 0.6, ease }}
        style={{
          position: isCompact ? "absolute" : "relative",
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: isCompact ? "none" : "auto",
          minHeight: "clamp(8.5rem, 16.5vw, 13rem)",
        }}
      >
        {/* Left half: "WI" + stacked caption — anchored to right edge at 50% */}
        <motion.div
          className="flex flex-col items-end"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isCompact ? 0 : 1, x: isCompact ? -20 : 0 }}
          transition={{ duration: 0.8, ease }}
          style={{
            position: "absolute",
            top: 0,
            right: `calc(50% + ${GAP})`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-cinzel-family)",
              fontWeight: 700,
              fontSize: "clamp(4rem, 10vw, 7rem)",
              color: "#E8DCC8",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            WI
          </span>
          <div
            className="flex flex-col items-end"
            style={{
              marginTop: "0.35em",
              gap: "0.1em",
            }}
          >
            {["Wine", "Pairing", "Information"].map((word) => (
              <span
                key={word}
                style={{
                  fontFamily: "var(--font-cormorant-family)",
                  fontWeight: 400,
                  fontSize: "clamp(1rem, 2.4vw, 1.5rem)",
                  color: "rgba(250, 246, 240, 0.95)",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right half: "Ni" — anchored to left edge at 50% */}
        <motion.div
          className="flex flex-col items-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isCompact ? 0 : 1, x: isCompact ? 20 : 0 }}
          transition={{ duration: 0.8, ease }}
          style={{
            position: "absolute",
            top: 0,
            left: `calc(50% + ${GAP})`,
          }}
        >
          <div className="flex items-baseline">
            <span
              style={{
                fontFamily: "var(--font-cinzel-family)",
                fontWeight: 700,
                fontSize: "clamp(4rem, 10vw, 7rem)",
                color: "#1A0A0E",
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              N
            </span>
            <span
              style={{
                fontFamily: "var(--font-cormorant-family)",
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: "clamp(3.2rem, 8vw, 5.6rem)",
                color: "#5C0A1E",
                lineHeight: 1,
                marginLeft: "-0.05em",
                position: "relative",
                top: "0.05em",
              }}
            >
              i
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
