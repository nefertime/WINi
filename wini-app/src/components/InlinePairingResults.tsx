"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish, Wine, Pairing, PairingLabel } from "@/lib/types";
import WineDetailOverlay from "./WineDetailOverlay";
import { useStorage } from "@/hooks/useStorage";

type InlinePairingResultsProps = {
  dishes: Dish[];
  wines: Wine[];
  pairings: Pairing[];
  dismissedDishIds?: Set<string>;
  onDismissDish?: (dishId: string) => void;
  isPairingSaved?: boolean;
  onSavePairing?: () => void;
  isAuthenticated?: boolean;
  onAuthPrompt?: () => void;
  pairingMode?: "restaurant" | "home_cooking";
};

const typeColors: Record<string, string> = {
  red: "#9B2335",
  white: "#C9A84C",
  "rosé": "#B85A6A",
  sparkling: "#E8DCC8",
};

const categoryIcons: Record<string, string> = {
  meat: "\u{1F969}",
  fish: "\u{1F41F}",
  vegetarian: "\u{1F957}",
  pasta: "\u{1F35D}",
  dessert: "\u{1F370}",
  appetizer: "\u{1FAD2}",
  salad: "\u{1F96C}",
  soup: "\u{1F372}",
  other: "\u{1F37D}",
};

const labelConfig: Record<PairingLabel, { color: string; bg: string; border: string; icon: string; text: string }> = {
  best_pick: { color: "#1A0A0E", bg: "linear-gradient(135deg, #C9A84C, #E8D48A)", border: "#C9A84C", icon: "\u2605", text: "Best Pick" },
  value_pick: { color: "#1A3A0E", bg: "linear-gradient(135deg, #4CAF50, #81C784)", border: "#4CAF50", icon: "$", text: "Value Pick" },
  wild_one: { color: "#FAF6F0", bg: "linear-gradient(135deg, #9B2335, #C0394F)", border: "#9B2335", icon: "\u26A1", text: "Wild One" },
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function InlinePairingResults({
  dishes,
  wines,
  pairings,
  dismissedDishIds = new Set(),
  onDismissDish,
  isPairingSaved,
  onSavePairing,
  isAuthenticated = false,
  onAuthPrompt,
  pairingMode = "restaurant",
}: InlinePairingResultsProps) {
  const storage = useStorage();
  const activeDishes = dishes.filter((d) => !dismissedDishIds.has(d.id));
  const canDismiss = activeDishes.length > 1;
  const pairedDishIdSet = new Set(pairings.map((p) => p.dish_id));

  const [activeItem, setActiveItem] = useState<{ id: string; type: "dish" | "wine" } | null>(
    () => activeDishes.length === 1 ? { id: activeDishes[0].id, type: "dish" } : null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- setIsHolding used in touch handlers
  const [_isHolding, setIsHolding] = useState(false);
  const [detailWine, setDetailWine] = useState<{ wine: Wine; position: { x: number; y: number; right: number } } | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    if (!isAuthenticated) return new Set();
    const favs = wines.filter((w) => storage.isFavorite(w));
    return new Set(favs.map((w) => w.id));
  });
  const [hoveredWineId, setHoveredWineId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => { hasMounted.current = true; }, 800);
    return () => clearTimeout(t);
  }, []);

  // Scale wine cards when many wines are shown
  const wineScale = wines.length <= 5 ? 1 : wines.length <= 7 ? 0.9 : 0.82;

  // Label map: wine_id → PairingLabel for the currently selected dish
  const wineLabelMap = new Map<string, PairingLabel>();
  if (activeItem?.type === "dish") {
    for (const p of pairings.filter((p) => p.dish_id === activeItem.id)) {
      if (p.label) wineLabelMap.set(p.wine_id, p.label);
    }
    // Fallback: if no labels from API, mark highest-scored as best_pick
    if (wineLabelMap.size === 0) {
      const sorted = pairings.filter((p) => p.dish_id === activeItem.id).sort((a, b) => b.score - a.score);
      if (sorted.length > 0) wineLabelMap.set(sorted[0].wine_id, "best_pick");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for future connection line rendering
  const _connections = activeItem
    ? pairings
        .filter((p) =>
          activeItem.type === "dish"
            ? p.dish_id === activeItem.id
            : p.wine_id === activeItem.id
        )
        .map((p) => ({
          fromId: activeItem.type === "dish" ? `dish-${p.dish_id}` : `wine-${p.wine_id}`,
          toId: activeItem.type === "dish" ? `wine-${p.wine_id}` : `dish-${p.dish_id}`,
          score: p.score,
          color: typeColors[wines.find((w) => w.id === p.wine_id)?.type || "red"],
        }))
    : [];

  // Spotlight: IDs paired with the currently selected item
  // If all items would be highlighted, skip the spotlight (no contrast = no value)
  const _hlWines = activeItem?.type === "dish"
    ? new Set(pairings.filter((p) => p.dish_id === activeItem.id).map((p) => p.wine_id))
    : null;
  const highlightedWineIds = _hlWines && _hlWines.size < wines.length ? _hlWines : null;
  const _hlDishes = activeItem?.type === "wine"
    ? new Set(pairings.filter((p) => p.wine_id === activeItem.id).map((p) => p.dish_id))
    : null;
  const highlightedDishIds = _hlDishes && _hlDishes.size < activeDishes.length ? _hlDishes : null;

  // Auto-select when only 1 active dish remains
  const singleActiveDishId = activeDishes.length === 1 ? activeDishes[0].id : null;
  useEffect(() => {
    if (singleActiveDishId) {
      setActiveItem({ id: singleActiveDishId, type: "dish" });
    }
  }, [singleActiveDishId]);

  // If the dismissed dish was selected, clear selection
  const activeIsDismissed = activeItem?.type === "dish" && dismissedDishIds.has(activeItem.id);
  useEffect(() => {
    if (activeIsDismissed) {
      setActiveItem(null);
    }
  }, [activeIsDismissed]);

  const handleDishPress = useCallback((id: string) => {
    setDetailWine(null);
    // Single active dish stays locked
    if (activeDishes.length === 1) return;
    setActiveItem((prev) => (prev?.id === id ? null : { id, type: "dish" }));
  }, [activeDishes.length]);

  const handleDishHoldStart = useCallback(() => {
    holdTimerRef.current = setTimeout(() => setIsHolding(true), 300);
  }, []);

  const handleDishHoldEnd = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setIsHolding(false);
  }, []);

  const handleWineClick = useCallback((wine: Wine, e: React.MouseEvent) => {
    // Toggle: click same wine again → close overlay
    if (detailWine?.wine.id === wine.id) {
      setDetailWine(null);
      return;
    }

    if (activeItem?.type !== "dish" && activeItem?.id !== wine.id) {
      setActiveItem({ id: wine.id, type: "wine" });
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDetailWine({ wine, position: { x: rect.left, y: rect.bottom, right: rect.right } });
  }, [activeItem, detailWine]);

  const handleToggleFavorite = useCallback((wine: Wine, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onAuthPrompt?.();
      return;
    }
    const isFav = favoriteIds.has(wine.id);
    if (isFav) {
      storage.removeFavorite(wine);
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(wine.id); return next; });
    } else {
      const pairedDishIds = pairings.filter((p) => p.wine_id === wine.id).map((p) => p.dish_id);
      const pairedDishes = pairedDishIds.map((id) => dishes.find((d) => d.id === id)).filter((d): d is Dish => d !== undefined);
      const dishName = pairedDishes[0]?.name;
      storage.saveFavorite(wine, dishName, pairedDishes);
      setFavoriteIds((prev) => new Set(prev).add(wine.id));
    }
  }, [favoriteIds, pairings, dishes, isAuthenticated, onAuthPrompt, storage]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("button") && !target.closest("[role='button']")) {
      setDetailWine(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Find pairing reason for the currently open detail wine
  const detailPairing = detailWine && activeItem
    ? pairings.find((p) =>
        activeItem.type === "dish"
          ? p.dish_id === activeItem.id && p.wine_id === detailWine.wine.id
          : p.wine_id === detailWine.wine.id
      ) ?? null
    : detailWine
      ? pairings.find((p) => p.wine_id === detailWine.wine.id) ?? null
      : null;

  return (
    <>
      {/* Main pairing area - leave bottom space for search bar */}
      <div ref={containerRef} className="relative" style={{ paddingBottom: "clamp(1rem, 3vh, 2rem)" }} onClick={handleContainerClick}>
        <div
          className="grid relative z-20"
          style={{ gridTemplateColumns: "1fr 1fr", columnGap: "clamp(0.25rem, 1vw, 0.75rem)" }}
        >
          {/* Dishes column — burgundy side, aligned right toward center */}
          <div className="flex flex-col items-end" style={{ gap: "clamp(0.5rem, 1vw, 0.75rem)", paddingLeft: "clamp(0.5rem, 2vw, 1.5rem)", paddingRight: "clamp(0.25rem, 1.5vw, 1.5rem)", overflow: "clip" }}>
            <div className="flex items-center self-end" style={{ gap: "clamp(0.4rem, 0.8vw, 0.6rem)", marginBottom: "0.25rem", paddingRight: "0.25rem" }}>
              <AnimatePresence>
                {activeItem && activeDishes.length > 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15, ease }}
                    onClick={() => { setActiveItem(null); setDetailWine(null); }}
                    className="transition-all duration-150 hover:opacity-100"
                    style={{
                      fontFamily: "var(--font-jost-family)",
                      fontSize: "clamp(0.6rem, 0.75vw, 0.7rem)",
                      color: "rgba(250, 246, 240, 0.45)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      textDecorationColor: "rgba(250, 246, 240, 0.2)",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    Deselect
                  </motion.button>
                )}
              </AnimatePresence>
              <h3
                className="uppercase tracking-wider"
                style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.7)", fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)" }}
              >
                Dishes
              </h3>
            </div>
            <AnimatePresence mode="popLayout">
              {activeDishes.map((dish, i) => {
                // Dim when: another dish is selected, OR a wine is selected and this dish isn't paired with it
                const isDishDimmed = (activeItem?.type === "dish" && activeItem.id !== dish.id)
                  || (highlightedDishIds !== null && !highlightedDishIds.has(dish.id));
                const isDishHighlighted = highlightedDishIds !== null && highlightedDishIds.has(dish.id);
                const isDishActive = activeItem?.id === dish.id;
                const isUnpaired = !pairedDishIdSet.has(dish.id);

                return (
                <motion.div
                  role="button"
                  tabIndex={0}
                  key={dish.id}
                  id={`dish-${dish.id}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isDishDimmed ? 0.3 : 1,
                    x: 0,
                    scale: isDishDimmed ? 0.96 : isDishActive ? 1.04 : 1,
                    filter: isDishDimmed ? "saturate(0.3)" : "saturate(1)",
                  }}
                  exit={{ opacity: 0, x: -30, scale: 0.9 }}
                  transition={{ delay: hasMounted.current ? 0 : 0.35 + i * 0.05, duration: 0.15, ease }}
                  onClick={() => handleDishPress(dish.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleDishPress(dish.id); }}}
                  onMouseDown={() => handleDishHoldStart()}
                  onMouseUp={handleDishHoldEnd}
                  onMouseLeave={handleDishHoldEnd}
                  onTouchStart={() => handleDishHoldStart()}
                  onTouchEnd={handleDishHoldEnd}
                  className="text-left rounded-lg relative cursor-pointer"
                  style={{
                    background: isUnpaired ? "rgba(201, 168, 76, 0.06)" : isDishActive ? "rgba(250, 246, 240, 0.14)" : "rgba(250, 246, 240, 0.10)",
                    border: isUnpaired
                      ? "1.5px dashed rgba(201, 168, 76, 0.4)"
                      : `1px solid ${isDishActive ? "rgba(250, 246, 240, 0.35)" : "rgba(250, 246, 240, 0.15)"}`,
                    boxShadow: isDishHighlighted
                      ? "0 4px 24px rgba(201, 168, 76, 0.12), 0 0 0 1px rgba(201, 168, 76, 0.15)"
                      : isDishActive ? "0 4px 20px rgba(0, 0, 0, 0.25)" : "0 1px 4px rgba(0, 0, 0, 0.08)",
                    padding: "clamp(0.5rem, 1.1vw, 1.1rem) clamp(0.55rem, 1.4vw, 1.4rem)",
                    width: "clamp(100px, 88%, 360px)",
                    transition: "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "clamp(0.35rem, 0.6vw, 0.6rem)" }}>
                    <span className="shrink-0" style={{ fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)" }}>{categoryIcons[dish.category] || "\u{1F37D}"}</span>
                    <span
                      className="leading-tight line-clamp-2 min-w-0"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 500, color: "var(--cream-lightest)", fontSize: "clamp(0.8rem, 1.3vw, 1.05rem)" }}
                    >
                      {dish.name}
                    </span>
                  </div>
                  {dish.description && (
                    <p className="mt-0.5 ml-5 line-clamp-1" style={{ color: "rgba(250, 246, 240, 0.45)", fontSize: "clamp(10px, 0.85vw, 0.8rem)" }}>{dish.description}</p>
                  )}
                  {/* Dismiss X button */}
                  {canDismiss && onDismissDish && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDismissDish(dish.id); }}
                      className="absolute flex items-center justify-center transition-all duration-150 hover:scale-110"
                      style={{
                        top: "-0.35rem",
                        right: "-0.35rem",
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "50%",
                        background: "rgba(250, 246, 240, 0.06)",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(250, 246, 240, 0.18)";
                        const svg = e.currentTarget.querySelector("svg");
                        if (svg) svg.setAttribute("stroke", "rgba(250, 246, 240, 0.8)");
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(250, 246, 240, 0.06)";
                        const svg = e.currentTarget.querySelector("svg");
                        if (svg) svg.setAttribute("stroke", "rgba(250, 246, 240, 0.5)");
                      }}
                      aria-label={`Dismiss ${dish.name}`}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" stroke="rgba(250, 246, 240, 0.5)" strokeWidth="1.4" strokeLinecap="round">
                        <line x1="1" y1="1" x2="7" y2="7" />
                        <line x1="7" y1="1" x2="1" y2="7" />
                      </svg>
                    </button>
                  )}
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Wines column — cream side, aligned left toward center */}
          <div className="flex flex-col items-start" style={{ gap: `calc(clamp(0.5rem, 1vw, 0.75rem) * ${wineScale})`, paddingRight: "clamp(0.5rem, 2vw, 1.5rem)", paddingLeft: "clamp(0.25rem, 1.5vw, 1.5rem)", paddingBottom: "0.5rem" }}>
            <div className="flex items-center mb-1 px-1" style={{ gap: "clamp(0.5rem, 1vw, 0.75rem)" }}>
              <h3
                className="uppercase tracking-wider"
                style={{ fontFamily: "var(--font-jost-family)", fontWeight: 600, color: "rgba(26, 10, 14, 0.8)", fontSize: "clamp(0.8rem, 1vw, 0.95rem)" }}
              >
                Wines
              </h3>
              {pairingMode === "home_cooking" && (
                <span
                  className="flex items-center gap-1"
                  style={{
                    fontFamily: "var(--font-jost-family)",
                    fontSize: "clamp(0.5rem, 0.7vw, 0.6rem)",
                    color: "rgba(26, 10, 14, 0.45)",
                  }}
                  title="Home cooking mode — wines from retail stores"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Home
                </span>
              )}
              {onSavePairing && (
                <motion.button
                  onClick={onSavePairing}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.2, ease }}
                  className="flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    padding: "0.2rem clamp(0.5rem, 1vw, 0.75rem)",
                    fontFamily: "var(--font-jost-family)",
                    fontSize: "clamp(0.65rem, 0.85vw, 0.8rem)",
                    fontWeight: 500,
                    lineHeight: 1,
                    minWidth: "5.5rem",
                    background: isPairingSaved ? "#C9A84C" : "rgba(201, 168, 76, 0.08)",
                    border: `1px solid ${isPairingSaved ? "#C9A84C" : "rgba(201, 168, 76, 0.4)"}`,
                    color: isPairingSaved ? "#FAF6F0" : "rgba(26, 10, 14, 0.7)",
                    cursor: "pointer",
                  }}
                  aria-label={isPairingSaved ? "Remove saved pairing" : "Save this pairing"}
                >
                  {isPairingSaved ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </svg>
                  ) : (
                    <motion.svg
                      width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" />
                    </motion.svg>
                  )}
                  <span>{isPairingSaved ? "Pairing saved" : "Save pairing"}</span>
                </motion.button>
              )}
            </div>
            {wines.map((wine, i) => {
              const isActive = detailWine?.wine.id === wine.id || activeItem?.id === wine.id;
              const isHovered = hoveredWineId === wine.id;
              const hoverBg = wine.type === "red" ? "rgba(92, 10, 30, 0.85)"
                : wine.type === "rosé" ? "rgba(155, 65, 85, 0.82)"
                : wine.type === "sparkling" ? "rgba(140, 115, 35, 0.82)"
                : "rgba(140, 115, 35, 0.82)"; // white

              // Spotlight states
              const isDimmed = highlightedWineIds !== null && !highlightedWineIds.has(wine.id);
              const isHighlighted = highlightedWineIds !== null && highlightedWineIds.has(wine.id);

              // Highlight glow per wine type
              const highlightGlow = wine.type === "red"
                ? "0 4px 24px rgba(155, 35, 53, 0.2), 0 0 0 1px rgba(155, 35, 53, 0.25)"
                : wine.type === "rosé"
                ? "0 4px 24px rgba(184, 90, 106, 0.2), 0 0 0 1px rgba(184, 90, 106, 0.25)"
                : wine.type === "sparkling"
                ? "0 6px 28px rgba(160, 130, 40, 0.35), 0 0 0 1.5px rgba(160, 130, 40, 0.4)"
                : "0 6px 28px rgba(160, 130, 40, 0.35), 0 0 0 1.5px rgba(160, 130, 40, 0.4)";

              // Color states: hover → filled bg + inverted text for all types
              const cardBg = isHovered ? hoverBg
                : isActive ? "rgba(26, 10, 14, 0.12)"
                : "rgba(26, 10, 14, 0.08)";
              const cardBorder = isHovered ? "rgba(250, 246, 240, 0.2)"
                : isActive ? "rgba(26, 10, 14, 0.35)"
                : "rgba(26, 10, 14, 0.15)";
              const textColor = isHovered ? "var(--cream-lightest)" : "#1A0A0E";
              const subTextColor = isHovered ? "rgba(250, 246, 240, 0.6)" : "rgba(26, 10, 14, 0.55)";


              return (
                <motion.div
                  key={wine.id}
                  id={`wine-${wine.id}`}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: isDimmed ? 0.3 : 1,
                    x: 0,
                    scale: isDimmed ? 0.96 : isHighlighted ? 1.04 : 1,
                    filter: isDimmed ? "saturate(0.3)" : "saturate(1)",
                  }}
                  whileHover={!isActive && !isDimmed ? { scale: 1.03, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)", transition: { duration: 0.15, ease: "easeOut" } } : undefined}
                  transition={{ delay: hasMounted.current ? 0 : 0.35 + i * 0.05, duration: 0.15, ease }}
                  onClick={(e) => handleWineClick(wine, e)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleWineClick(wine, e as unknown as React.MouseEvent); }}}
                  onMouseEnter={() => setHoveredWineId(wine.id)}
                  onMouseLeave={() => setHoveredWineId(null)}
                  className="text-left rounded-lg cursor-pointer relative"
                  style={{
                    background: cardBg,
                    border: `1.5px solid ${cardBorder}`,
                    boxShadow: isHighlighted
                      ? highlightGlow
                      : isActive ? "0 4px 20px rgba(0, 0, 0, 0.12)" : "0 1px 4px rgba(0, 0, 0, 0.04)",
                    padding: `calc(clamp(0.5rem, 1.1vw, 1.1rem) * ${wineScale}) calc(clamp(0.55rem, 1.4vw, 1.4rem) * ${wineScale})`,
                    width: "clamp(100px, 88%, 360px)",
                    transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease",
                  }}
                >
                  {/* Podium label badge */}
                  <AnimatePresence>
                    {wineLabelMap.has(wine.id) && (() => {
                      const lbl = labelConfig[wineLabelMap.get(wine.id)!];
                      return (
                        <motion.span
                          key={wineLabelMap.get(wine.id)}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.2, ease }}
                          className="absolute flex items-center gap-1 rounded-full pointer-events-none"
                          style={{
                            top: "-0.55rem",
                            left: "0.5rem",
                            padding: "0.15rem 0.55rem",
                            background: lbl.bg,
                            border: `1.5px solid ${lbl.border}`,
                            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 0.5px ${lbl.border}40`,
                            zIndex: 2,
                          }}
                        >
                          <span style={{ fontSize: "0.6rem", lineHeight: 1 }}>{lbl.icon}</span>
                          <span style={{
                            fontFamily: "var(--font-jost-family)",
                            fontWeight: 700,
                            fontSize: "clamp(0.5rem, 0.7vw, 0.6rem)",
                            color: lbl.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}>
                            {lbl.text}
                          </span>
                        </motion.span>
                      );
                    })()}
                  </AnimatePresence>
                  <div className="flex items-center" style={{ gap: "clamp(0.35rem, 0.6vw, 0.6rem)" }}>
                    <div
                      className="rounded-full shrink-0"
                      style={{ background: typeColors[wine.type] || "#C9A84C", width: "clamp(0.4rem, 0.6vw, 0.55rem)", height: "clamp(0.4rem, 0.6vw, 0.55rem)" }}
                    />
                    <span
                      className="leading-tight line-clamp-2 min-w-0"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: textColor, fontSize: `calc(clamp(0.85rem, 1.4vw, 1.15rem) * ${wineScale})`, transition: "color 0.25s ease" }}
                    >
                      {wine.name}
                    </span>
                    <span
                      className="shrink-0"
                      style={{
                        fontFamily: "var(--font-cormorant-family)",
                        fontWeight: 600,
                        fontStyle: "italic",
                        fontSize: "clamp(1rem, 1.3vw, 1.25rem)",
                        color: isHovered ? "var(--cream-lightest)" : "#5C0A1E",
                        lineHeight: 1,
                        marginLeft: "auto",
                        transition: "color 0.25s ease",
                      }}
                      aria-hidden="true"
                    >
                      i
                    </span>
                    {/* Flag save + Top Pick star */}
                    <div className="shrink-0 relative flex flex-col items-center" style={{ marginTop: "2px" }}>
                      <button
                        onClick={(e) => handleToggleFavorite(wine, e)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110 group/flag flex items-center gap-1 justify-center"
                        style={{ minWidth: "2.75rem", minHeight: "2.75rem" }}
                        aria-label={favoriteIds.has(wine.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {favoriteIds.has(wine.id) ? (
                          <svg className="transition-colors duration-150" style={{ width: "clamp(13px, 1.2vw, 17px)", height: "clamp(13px, 1.2vw, 17px)" }} viewBox="0 0 24 24" fill="#9B2335" stroke="#9B2335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                            <line x1="4" y1="22" x2="4" y2="15" />
                          </svg>
                        ) : (
                          <motion.svg
                            className="transition-colors duration-150"
                            style={{ width: "clamp(13px, 1.2vw, 17px)", height: "clamp(13px, 1.2vw, 17px)" }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={isHovered ? "rgba(250, 246, 240, 0.5)" : "rgba(26, 10, 14, 0.35)"}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <path className="group-hover/flag:stroke-[#9B2335] transition-colors duration-150" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                            <line className="group-hover/flag:stroke-[#9B2335] transition-colors duration-150" x1="4" y1="22" x2="4" y2="15" />
                          </motion.svg>
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-jost-family)",
                            fontSize: "clamp(0.5rem, 0.7vw, 0.6rem)",
                            fontWeight: 500,
                            color: favoriteIds.has(wine.id)
                              ? (isHovered ? "rgba(250, 246, 240, 0.7)" : "#9B2335")
                              : (isHovered ? "rgba(250, 246, 240, 0.45)" : "rgba(26, 10, 14, 0.35)"),
                            whiteSpace: "nowrap",
                            transition: "color 0.25s ease",
                          }}
                        >
                          {favoriteIds.has(wine.id) ? "Saved" : "Save"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="mt-0.5 capitalize truncate" style={{ color: subTextColor, fontSize: `calc(clamp(10px, 0.85vw, 0.8rem) * ${wineScale})`, marginLeft: "clamp(0.75rem, 1vw, 1.1rem)", transition: "color 0.25s ease" }}>
                    {wine.type}{wine.vintage ? ` \u00B7 ${wine.vintage}` : ""}{wine.region ? ` \u00B7 ${wine.region}` : ""}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Wine Detail Overlay — opens from wine card position */}
      <AnimatePresence>
        {detailWine && (
          <WineDetailOverlay
            wine={detailWine.wine}
            pairedDishes={
              pairings
                .filter((p) => p.wine_id === detailWine.wine.id)
                .map((p) => dishes.find((d) => d.id === p.dish_id))
                .filter((d): d is Dish => d !== undefined)
            }
            pairingReason={detailPairing?.reason}
            pairingDetailedReason={detailPairing?.detailed_reason}
            pairingDishName={detailPairing ? dishes.find((d) => d.id === detailPairing.dish_id)?.name : undefined}
            anchorPosition={detailWine.position}
            onClose={() => setDetailWine(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
