"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dish } from "@/lib/types";

type CuttingBoardProps = {
  dishes: Dish[];
  onAdd: (dishId: string) => void;
  maxActive: number;
  activeCount: number;
  needsRegeneration: boolean;
  isRegenerating: boolean;
  onRegenerate: () => void;
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

export default function CuttingBoard({
  dishes,
  onAdd,
  maxActive,
  activeCount,
  needsRegeneration,
  isRegenerating,
  onRegenerate,
}: CuttingBoardProps) {
  const MAX_VISIBLE = 5;
  const atCap = activeCount >= maxActive;
  const hasDishes = dishes.length > 0;
  const visibleDishes = dishes.slice(0, MAX_VISIBLE);
  const extraCount = Math.max(0, dishes.length - MAX_VISIBLE);

  if (!hasDishes && !needsRegeneration) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease }}
      className="flex items-center justify-center gap-1.5 mx-auto"
    >
      {/* Regenerate button — left of board */}
      {needsRegeneration && (
        <div className="relative shrink-0 flex flex-col items-center">
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: isRegenerating ? 1 : [1, 1.06, 1],
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: isRegenerating
                ? { duration: 0.2 }
                : { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
            }}
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="shrink-0 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
            style={{
              width: "clamp(2.2rem, 7vw, 3rem)",
              height: "clamp(2.2rem, 7vw, 3rem)",
              background: "#1A1A1A",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              cursor: isRegenerating ? "wait" : "pointer",
            }}
            aria-label={isRegenerating ? "Regenerating pairings..." : "Regenerate pairings"}
          >
            <motion.svg
              style={{ width: "clamp(16px, 3vw, 22px)", height: "clamp(16px, 3vw, 22px)" }}
              viewBox="0 0 24 24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              animate={{
                stroke: isRegenerating
                  ? "#FAF6F0"
                  : ["#FAF6F0", "#9B2335", "#FAF6F0"],
              }}
              transition={isRegenerating
                ? { duration: 0 }
                : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <motion.g
                style={{ transformOrigin: "center" }}
                animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
                transition={isRegenerating
                  ? { duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0 }
                }
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </motion.g>
            </motion.svg>
          </motion.button>
          <span
            className="whitespace-nowrap pointer-events-none mt-1"
            style={{
              fontFamily: "var(--font-cormorant-family)",
              fontWeight: 600,
              fontSize: "clamp(0.5rem, 1.2vw, 0.65rem)",
              color: "rgba(250, 246, 240, 0.55)",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            Regenerate
          </span>
        </div>
      )}

      {/* Cutting board image + dish pills */}
      <div
        className="relative"
        style={{ width: "clamp(280px, 70vw, 500px)" }}
      >
        <div className="relative rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cutting-board.webp"
            alt=""
            className="w-full h-auto"
            style={{
              minHeight: hasDishes ? "clamp(140px, 28vw, 240px)" : "clamp(60px, 10vw, 90px)",
              objectFit: "cover",
              filter: "brightness(0.85)",
            }}
            draggable={false}
          />

          {/* Dish pills overlay — vertical list, max 5, constrained within board */}
          {hasDishes && (
            <div
              className="absolute flex flex-col items-center justify-center overflow-hidden"
              style={{
                top: "10%",
                left: "8%",
                right: "8%",
                bottom: "14%",
                gap: "0.25rem",
              }}
            >
              <AnimatePresence>
                {visibleDishes.map((dish) => (
                  <motion.button
                    key={dish.id}
                    initial={{ opacity: 0, scale: 0.8, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 6 }}
                    transition={{ duration: 0.25, ease }}
                    onClick={() => !atCap && onAdd(dish.id)}
                    disabled={atCap}
                    className="flex items-center rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed max-w-[85%]"
                    style={{
                      background: "rgba(26, 10, 14, 0.65)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(250, 246, 240, 0.2)",
                      padding: "clamp(0.3rem, 0.8vw, 0.4rem) clamp(0.6rem, 1.2vw, 0.7rem)",
                      gap: "0.3rem",
                      cursor: atCap ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                    aria-label={atCap ? `Cannot add ${dish.name} (max ${maxActive} dishes)` : `Add ${dish.name}`}
                  >
                    <span className="shrink-0" style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)" }}>
                      {categoryIcons[dish.category] || "\u{1F37D}"}
                    </span>
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "var(--font-cormorant-family)",
                        fontSize: "clamp(0.65rem, 1.4vw, 0.75rem)",
                        fontWeight: 600,
                        color: "var(--cream-lightest)",
                        textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {dish.name}
                    </span>
                    {!atCap && (
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: "clamp(0.55rem, 1.1vw, 0.65rem)",
                          color: "rgba(201, 168, 76, 0.8)",
                          fontWeight: 600,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
              {extraCount > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-cormorant-family)",
                    fontSize: "clamp(0.55rem, 1.2vw, 0.65rem)",
                    fontWeight: 600,
                    color: "rgba(250, 246, 240, 0.5)",
                  }}
                >
                  +{extraCount} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
