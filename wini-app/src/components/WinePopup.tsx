"use client";

import { motion } from "framer-motion";
import { Wine, Pairing } from "@/lib/types";
import { useEscapeKey } from "@/hooks/useEscapeKey";

type WinePopupProps = {
  wine: Wine;
  pairing: Pairing | null;
  position: { x: number; y: number; right: number };
  onMorePairing: () => void;
  onAboutWine: () => void;
  onClose?: () => void;
};

const noop = () => {};

const typeColors: Record<string, string> = {
  red: "#9B2335",
  white: "#C9A84C",
  "rosé": "#D4707A",
  sparkling: "#E8DCC8",
};

export default function WinePopup({
  wine,
  pairing,
  position,
  onMorePairing,
  onAboutWine,
  onClose,
}: WinePopupProps) {
  useEscapeKey(true, onClose ?? noop);

  // Anchor popup shifted right so ~1/4 of underlying wine card is visible
  const cardWidth = position.right - position.x;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed z-50 rounded-xl"
      style={{
        width: "var(--overlay-popup-w)",
        left: `clamp(0.5rem, ${position.x + cardWidth * 0.25}px, calc(100vw - var(--overlay-popup-w) - 0.5rem))`,
        top: `clamp(0.5rem, ${position.y - 8}px, calc(100dvh - 16.25rem))`,
        padding: "clamp(0.75rem, 1.1vw, 1.1rem) clamp(1rem, 1.4vw, 1.4rem)",
        background: "var(--surface-glass)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--surface-glass-border)",
        boxShadow: "var(--surface-glass-shadow)",
      }}
    >
      {/* Pairing reason with type dot */}
      {pairing && (
        <div className="flex gap-2" style={{ marginBottom: "clamp(0.5rem, 0.6vw, 0.6rem)" }}>
          <div
            className="rounded-full shrink-0"
            style={{ background: typeColors[wine.type] || "#C9A84C", width: "clamp(0.5rem, 0.6vw, 0.55rem)", height: "clamp(0.5rem, 0.6vw, 0.55rem)", marginTop: "0.45em" }}
          />
          <p
            className="text-cream/75 leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant-family)", fontStyle: "italic", fontSize: "clamp(0.75rem, 1vw, 0.95rem)" }}
          >
            {pairing.reason}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px mb-3" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Action links — same row */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onAboutWine}
          className="text-left text-gold/80 transition-colors duration-200 hover:text-gold py-1"
          style={{ fontFamily: "var(--font-jost-family)", fontSize: "clamp(0.75rem, 0.9vw, 0.875rem)" }}
        >
          More about this wine
        </button>
        <button
          onClick={() => {
            window.open(`https://www.vivino.com/search/wines?q=${encodeURIComponent(wine.name)}`, "_blank");
          }}
          className="text-left text-gold/80 transition-colors duration-200 hover:text-gold py-1 shrink-0"
          style={{ fontFamily: "var(--font-jost-family)", fontSize: "clamp(0.75rem, 0.9vw, 0.875rem)" }}
        >
          Buy this wine &rarr;
        </button>
      </div>
    </motion.div>
  );
}
