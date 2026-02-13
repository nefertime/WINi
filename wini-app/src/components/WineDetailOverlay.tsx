"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish, Wine, WineInfo } from "@/lib/types";

type WineDetailOverlayProps = {
  wine: Wine;
  pairedDishes?: Dish[];
  pairingReason?: string;
  pairingDetailedReason?: string;
  pairingDishName?: string;
  anchorPosition?: { x: number; y: number; right: number };
  onClose: () => void;
};

function truncateDishName(name: string, maxLen = 28): string {
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen - 1).trimEnd() + "\u2026";
}

export default function WineDetailOverlay({ wine, pairingReason, pairingDetailedReason, pairingDishName, anchorPosition, onClose }: WineDetailOverlayProps) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const isMobile = vw < 640;
  const panelWidth = isMobile ? vw - 16 : Math.min(420, Math.max(320, vw * 0.3));
  const panelMaxH = isMobile ? vh - 80 : Math.min(vh * 0.75, 500);

  const anchorStyle = anchorPosition ? (() => {
    if (isMobile) {
      return { left: 8, top: 40, position: "fixed" as const };
    }
    const cardWidth = anchorPosition.right - anchorPosition.x;
    const left = Math.max(8, Math.min(anchorPosition.x + cardWidth * 0.15, vw - panelWidth - 8));
    const top = Math.max(8, Math.min(anchorPosition.y - 16, vh - panelMaxH - 16));
    return { left, top, position: "fixed" as const };
  })() : undefined;

  const displayReason = pairingDetailedReason || pairingReason;

  const [wineInfo, setWineInfo] = useState<WineInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wine-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wineName: wine.name,
            wineType: wine.type,
            grape: wine.grape,
            region: wine.region,
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch wine info");
        const data: WineInfo = await res.json();
        if (!cancelled) setWineInfo(data);
      } catch {
        if (!cancelled) setInfoError(true);
      } finally {
        if (!cancelled) setInfoLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [wine.name, wine.type, wine.grape, wine.region]);

  return (
    <AnimatePresence>
      {/* No backdrop — panel floats on top, clicks pass through to wine cards */}
      <motion.div
        key="wine-detail-panel"
        initial={{ opacity: 0, scale: 0.95, y: anchorPosition ? -8 : 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: anchorPosition ? -8 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed z-50 rounded-xl overflow-hidden ${anchorPosition ? "" : "w-[90vw] max-w-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}`}
        style={{
          background: "linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)",
          maxHeight: panelMaxH,
          width: anchorPosition ? panelWidth : undefined,
          ...(anchorStyle || {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close wine details"
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-cream/40 hover:text-cream-lightest transition-colors cursor-pointer"
          style={{ background: "rgba(255, 255, 255, 0.06)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="overflow-y-auto" style={{ padding: isMobile ? "20px 20px 24px" : "28px 28px 32px", maxHeight: panelMaxH }}>
          {/* Wine type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs uppercase tracking-wider"
              style={{
                color: wine.type === "red" ? "#D4707A"
                  : wine.type === "rosé" ? "#D4707A"
                  : wine.type === "sparkling" ? "#E8DCC8"
                  : "#C9A84C",
              }}
            >
              {wine.type}
            </span>
          </div>

          {/* Wine name */}
          <h2
            className="text-2xl text-cream-lightest mb-1 leading-tight pr-10"
            style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 500 }}
          >
            {wine.name}
          </h2>
          <p className="text-sm text-cream/50 mb-4">
            {"\uD83C\uDF47"} {wine.grape} · {wine.region}
          </p>

          {/* Pairing reason — shown first, from props (no loading needed) */}
          {displayReason && (
            <div className="mb-5">
              <h3
                className="text-xs uppercase tracking-wider text-gold/70 mb-2 inline-block"
                style={{ fontFamily: "var(--font-jost-family)", borderBottom: "1px solid rgba(201, 168, 76, 0.3)", paddingBottom: "0.2rem" }}
              >
                Why this pairing works{pairingDishName ? ` with ${truncateDishName(pairingDishName)}` : ""}
              </h3>
              <p
                className="text-cream/75 leading-relaxed"
                style={{ fontFamily: "var(--font-cormorant-family)", fontStyle: "italic", fontSize: "0.95rem" }}
              >
                {displayReason}
              </p>
            </div>
          )}

          {/* Loading animation or loaded sections */}
          {infoLoading ? (
            <div className="relative flex flex-col items-center py-6" style={{ minHeight: 100 }}>
              {/* Wine pour line (vertical) */}
              <div className="relative w-[2px] overflow-hidden" style={{ height: 48 }}>
                <motion.div
                  className="absolute top-0 left-0 w-full rounded-full"
                  style={{
                    background: "var(--burgundy-glow)",
                    filter: "drop-shadow(0 0 4px var(--burgundy-glow)) drop-shadow(0 0 8px rgba(155, 35, 53, 0.3))",
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: [0, 48, 48, 0],
                    opacity: [0, 1, 1, 0],
                    y: [0, 0, 0, 48],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              {/* Scanning line (horizontal) */}
              <motion.div
                className="absolute left-0 w-full h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent 5%, rgba(210, 120, 140, 0.3) 30%, var(--burgundy-glow) 50%, rgba(210, 120, 140, 0.3) 70%, transparent 95%)",
                  boxShadow: "0 0 8px 1px var(--burgundy-glow), 0 0 20px 2px rgba(155, 35, 53, 0.2)",
                }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-cream/50 text-xs tracking-widest uppercase"
                style={{ fontFamily: "var(--font-cormorant-family)", letterSpacing: "0.2em" }}
              >
                Discovering...
              </motion.p>
            </div>
          ) : infoError ? (
            <p className="text-sm text-cream/40 italic" style={{ fontFamily: "var(--font-cormorant-family)" }}>
              Wine details unavailable.
            </p>
          ) : wineInfo ? (
            <div className="space-y-6">
              {wineInfo.origin_story && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gold/70 mb-2 inline-block" style={{ fontFamily: "var(--font-jost-family)", borderBottom: "1px solid rgba(201, 168, 76, 0.3)", paddingBottom: "0.2rem" }}>
                    Origin
                  </h3>
                  <p className="text-base text-cream/70 leading-relaxed" style={{ fontFamily: "var(--font-cormorant-family)" }}>
                    {wineInfo.origin_story}
                  </p>
                </div>
              )}

              {wineInfo.food_pairings && wineInfo.food_pairings.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gold/70 mb-2 inline-block" style={{ fontFamily: "var(--font-jost-family)", borderBottom: "1px solid rgba(201, 168, 76, 0.3)", paddingBottom: "0.2rem" }}>
                    Classic Pairings
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {wineInfo.food_pairings.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm text-cream/60"
                        style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)" }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={() => {
                window.open(`https://www.vivino.com/search/wines?q=${encodeURIComponent(wine.name)}`, "_blank");
              }}
              className="w-full py-3 rounded-full text-sm text-charcoal font-medium transition-all duration-300 hover:opacity-90 cursor-pointer"
              style={{ background: "var(--gold)", fontFamily: "var(--font-jost-family)" }}
            >
              Buy this wine
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
