"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dish } from "@/lib/types";

type DishShelfProps = {
  dishes: Dish[];
  onAdd: (dishId: string) => void;
  maxActive?: number;
  activeCount?: number;
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

export default function DishShelf({ dishes, onAdd, maxActive = 5, activeCount = 0 }: DishShelfProps) {
  if (dishes.length === 0) return null;

  const atCap = activeCount >= maxActive;

  return (
    <div
      className="flex flex-wrap items-center mb-2"
      style={{ gap: "0.4rem" }}
    >
      <span
        style={{
          fontFamily: "var(--font-jost-family)",
          fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
          color: "rgba(250, 246, 240, 0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginRight: "0.15rem",
        }}
      >
        Menu
      </span>
      <AnimatePresence>
        {dishes.map((dish) => (
          <motion.button
            key={dish.id}
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 6 }}
            transition={{ duration: 0.25, ease }}
            onClick={() => !atCap && onAdd(dish.id)}
            disabled={atCap}
            className="inline-flex items-center rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(250, 246, 240, 0.12)",
              border: "1px solid rgba(250, 246, 240, 0.18)",
              backdropFilter: "blur(8px)",
              padding: "0.5rem 0.75rem",
              gap: "0.3rem",
              cursor: atCap ? "not-allowed" : "pointer",
            }}
            aria-label={atCap ? `Cannot add ${dish.name} (max ${maxActive} dishes)` : `Add ${dish.name}`}
          >
            <span style={{ fontSize: "0.7rem" }}>
              {categoryIcons[dish.category] || "\u{1F37D}"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-cormorant-family)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(250, 246, 240, 0.65)",
                whiteSpace: "nowrap",
              }}
            >
              {dish.name}
            </span>
            {!atCap && (
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(201, 168, 76, 0.6)",
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
    </div>
  );
}
