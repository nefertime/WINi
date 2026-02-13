"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dish, Wine, Pairing } from "@/lib/types";
import WineDetailOverlay from "./WineDetailOverlay";
import { saveFavorite, removeFavorite, isFavorite } from "@/lib/storage";

type InlinePairingResultsProps = {
  dishes: Dish[];
  wines: Wine[];
  pairings: Pairing[];
  dismissedDishIds?: Set<string>;
  onDismissDish?: (dishId: string) => void;
  isPairingSaved?: boolean;
  onSavePairing?: () => void;
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

const ease = [0.16, 1, 0.3, 1] as const;

export default function InlinePairingResults({
  dishes,
  wines,
  pairings,
  dismissedDishIds = new Set(),
  onDismissDish,
  isPairingSaved,
  onSavePairing,
}: InlinePairingResultsProps) {
  const activeDishes = dishes.filter((d) => !dismissedDishIds.has(d.id));
  const canDismiss = activeDishes.length > 1;
  const pairedDishIdSet = new Set(pairings.map((p) => p.dish_id));

  const [activeItem, setActiveItem] = useState<{ id: string; type: "dish" | "wine" } | null>(
    () => activeDishes.length === 1 ? { id: activeDishes[0].id, type: "dish" } : null
  );
  const [isHolding, setIsHolding] = useState(false);
  const [detailWine, setDetailWine] = useState<{ wine: Wine; position: { x: number; y: number; right: number } } | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    const favs = wines.filter((w) => isFavorite(w));
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

  // Top pick: highest-scored wine for the currently selected dish
  const topPickWineId = activeItem?.type === "dish"
    ? pairings
        .filter((p) => p.dish_id === activeItem.id)
        .sort((a, b) => b.score - a.score)[0]?.wine_id ?? null
    : null;

  const connections = activeItem
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
    const isFav = favoriteIds.has(wine.id);
    if (isFav) {
      removeFavorite(wine);
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(wine.id); return next; });
    } else {
      // Find all dishes this wine is paired with for context
      const pairedDishIds = pairings.filter((p) => p.wine_id === wine.id).map((p) => p.dish_id);
      const pairedDishes = pairedDishIds.map((id) => dishes.find((d) => d.id === id)).filter((d): d is Dish => d !== undefined);
      const dishName = pairedDishes[0]?.name;
      saveFavorite(wine, dishName, pairedDishes);
      setFavoriteIds((prev) => new Set(prev).add(wine.id));
    }
  }, [favoriteIds, pairings, dishes]);

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
                    <span style={{ fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)" }}>{categoryIcons[dish.category] || "\u{1F37D}"}</span>
                    <span
                      className="leading-tight truncate"
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
                        top: "0.3rem",
                        right: "0.3rem",
                        width: "1.3rem",
                        height: "1.3rem",
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
                style={{ fontFamily: "var(--font-jost-family)", color: "rgba(26, 10, 14, 0.8)", fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)" }}
              >
                Wines
              </h3>
              {onSavePairing && (
                <motion.button
                  onClick={onSavePairing}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.2, ease }}
                  className="flex items-center justify-center gap-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    padding: "0.15rem clamp(0.45rem, 0.9vw, 0.65rem)",
                    fontFamily: "var(--font-jost-family)",
                    fontSize: "clamp(0.55rem, 0.7vw, 0.65rem)",
                    fontWeight: 500,
                    lineHeight: 1,
                    minWidth: "4.5rem",
                    background: isPairingSaved ? "#C9A84C" : "rgba(201, 168, 76, 0.08)",
                    border: `1px solid ${isPairingSaved ? "#C9A84C" : "rgba(201, 168, 76, 0.4)"}`,
                    color: isPairingSaved ? "#FAF6F0" : "rgba(26, 10, 14, 0.7)",
                    cursor: "pointer",
                  }}
                  aria-label={isPairingSaved ? "Remove saved pairing" : "Save this pairing"}
                >
                  {isPairingSaved ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                  <span>{isPairingSaved ? "Saved" : "Save"}</span>
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
              const heartStroke = isHovered ? "rgba(250, 246, 240, 0.5)" : "rgba(26, 10, 14, 0.35)";

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
                  className="text-left rounded-lg cursor-pointer"
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
                  <div className="flex items-center" style={{ gap: "clamp(0.35rem, 0.6vw, 0.6rem)" }}>
                    <div
                      className="rounded-full shrink-0"
                      style={{ background: typeColors[wine.type] || "#C9A84C", width: "clamp(0.4rem, 0.6vw, 0.55rem)", height: "clamp(0.4rem, 0.6vw, 0.55rem)" }}
                    />
                    <span
                      className="leading-tight truncate min-w-0"
                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 500, color: textColor, fontSize: `calc(clamp(0.8rem, 1.3vw, 1.05rem) * ${wineScale})`, transition: "color 0.25s ease" }}
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
                    {/* Heart + Top Pick star — star absolutely positioned below heart */}
                    <div className="shrink-0 relative flex flex-col items-center" style={{ width: "clamp(14px, 1.3vw, 19px)", marginTop: "2px" }}>
                      <button
                        onClick={(e) => handleToggleFavorite(wine, e)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110 group/heart"
                        aria-label={favoriteIds.has(wine.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg className="transition-colors duration-150" style={{ width: "clamp(14px, 1.3vw, 19px)", height: "clamp(14px, 1.3vw, 19px)" }} viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          fill={favoriteIds.has(wine.id) ? "#9B2335" : "none"}
                          stroke={favoriteIds.has(wine.id) ? "#9B2335" : heartStroke}
                        >
                          <path className="group-hover/heart:fill-[#9B2335] group-hover/heart:stroke-[#9B2335] transition-colors duration-150" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {topPickWineId === wine.id && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15, ease }}
                            style={{ position: "absolute", top: "100%", marginTop: "1px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Top pick"
                          >
                            <svg style={{ width: "clamp(14px, 1.3vw, 19px)", height: "clamp(14px, 1.3vw, 19px)" }} viewBox="0 0 24 24" fill="#C9A84C" stroke="rgba(26, 10, 14, 0.35)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </motion.span>
                        )}
                      </AnimatePresence>
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
