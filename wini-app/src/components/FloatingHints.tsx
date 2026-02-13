"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LEFT_HINTS = [
  "Pair your dish with the perfect wine",
  "Snap a photo of any menu",
  "Powered by sommelier intelligence",
  "From appetizer to dessert",
  "Red, white, rosé, or sparkling",
  "Discover wines you never knew existed",
  "Your personal sommelier, always ready",
  "Over 10,000 pairings analyzed",
  "Works with any cuisine in the world",
  "Simply describe what you are eating",
  "Every wine tells a story",
  "Life is too short for bad wine",
  "In vino veritas",
  "The art of pairing",
  "Trust the sommelier",
  "Wine is bottled poetry",
  "Elegance in every glass",
  "From vineyard to table",
  "A wine for every moment",
  "Let the wine speak",
  "Savor the experience",
  "Terroir matters",
  "Bold reds, crisp whites",
  "The perfect complement",
  "Wine makes any meal extraordinary",
  "Centuries of tradition, one recommendation",
  "From Bordeaux to Barossa",
  "The soul of the grape",
  "Vintage wisdom at your fingertips",
  "Every dish deserves its match",
  "Unlock hidden flavors",
  "Where food meets wine",
  "A sommelier in your pocket",
  "The right wine transforms a meal",
  "Explore beyond your comfort zone",
  "Aged to perfection",
  "The language of flavor",
  "Balance in every sip",
  "From casual to extraordinary",
  "Wine speaks to those who listen",
  "The ancient art of the vine",
  "Taste the landscape",
  "Where science meets pleasure",
  "The magic of fermentation",
  "Noble grapes, noble pairings",
  "First the food, then the wine",
  "A journey through the vineyards",
  "Wine wisdom, instantly",
  "Nectar of the gods",
  "The cellar remembers",
];

const RIGHT_HINTS = [
  "Get detailed tasting notes instantly",
  "Learn why each pairing works",
  "Save your favorite pairings",
  "From casual dining to fine wine",
  "Explore regions from Bordeaux to Barossa",
  "No sommelier? No problem",
  "Score-ranked recommendations",
  "For wine lovers and curious beginners",
  "Upload a photo or just type",
  "The smartest way to choose wine",
  "Tannins, acidity, and body explained",
  "Find your perfect glass",
  "Curated by artificial intelligence",
  "Wine pairing made effortless",
  "From Champagne to Chianti",
  "Understanding flavor profiles",
  "Your taste, perfected",
  "Decoding the wine list",
  "Beyond the obvious choices",
  "Every palate is unique",
  "The science of taste",
  "Confidence at every table",
  "Sommeliers approve",
  "New world meets old world",
  "Wine knowledge, simplified",
  "The perfect pour",
  "Grape by grape, region by region",
  "Elevate your dining experience",
  "Intelligent pairing suggestions",
  "The wine world at your fingertips",
  "Bold pairings, subtle nuances",
  "Discover your wine personality",
  "AI-powered taste analysis",
  "From the cellar to your glass",
  "Master the art of wine selection",
  "Every occasion, every budget",
  "The nose knows",
  "Old vines, new discoveries",
  "Your next favorite wine awaits",
  "The sommelier's secret weapon",
  "Varietal by varietal",
  "Structured tannins, silky finish",
  "Where tradition meets technology",
  "The cellar door is open",
  "Vintage after vintage",
  "Understanding terroir and climate",
  "Wine is an adventure",
  "From the first sip to the last",
  "A world of flavors in one glass",
  "Let your palate decide",
];

// Fisher-Yates shuffle — new order each page load
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Safe zones: avoid logo (top 25%), search bar (bottom ~30%), center bottles
const Y_MIN = 34;
const Y_MAX = 64;

type HintItem = {
  id: number;
  text: string;
  side: "left" | "right";
  xPercent: number;
  yPercent: number;
  rotation: number;
};

let nextId = 0;

export default function FloatingHints() {
  const [hints, setHints] = useState<HintItem[]>([]);

  // Shuffle once on mount so order is random each page load
  const shuffledLeft = useMemo(() => shuffle(LEFT_HINTS), []);
  const shuffledRight = useMemo(() => shuffle(RIGHT_HINTS), []);

  const leftIndexRef = useRef(0);
  const rightIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addHint = useCallback(() => {
    setHints((prev) => {
      if (prev.length >= 4) return prev;

      const side = Math.random() > 0.5 ? "left" : "right";
      const sideCount = prev.filter((h) => h.side === side).length;
      if (sideCount >= 2) return prev;

      let text: string;
      if (side === "left") {
        text = shuffledLeft[leftIndexRef.current % shuffledLeft.length];
        leftIndexRef.current++;
      } else {
        text = shuffledRight[rightIndexRef.current % shuffledRight.length];
        rightIndexRef.current++;
      }

      if (prev.some((h) => h.text === text)) return prev;

      // Pick y position, avoiding existing hints on same side (min 12% apart)
      const sameSideYs = prev.filter((h) => h.side === side).map((h) => h.yPercent);
      let yPercent = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
      for (let attempt = 0; attempt < 10; attempt++) {
        const tooClose = sameSideYs.some((y) => Math.abs(y - yPercent) < 12);
        if (!tooClose) break;
        yPercent = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
      }

      // Random x position within safe zone (avoiding center bottles ~42-58%)
      // Left: left offset 3-25%. Right: right offset 3-25% (anchored from right edge)
      // With max-w-[20%], left hints span 3-45%, right hints span 55-97%
      const xPercent = side === "left"
        ? 3 + Math.random() * 22   // left: 3% to 25%
        : 3 + Math.random() * 22;  // right: 3% to 25% from right edge

      // Slight random rotation for editorial feel (-3 to +3 degrees)
      const rotation = (Math.random() - 0.5) * 6;

      return [...prev, { id: nextId++, text, side, xPercent, yPercent, rotation }];
    });
  }, [shuffledLeft, shuffledRight]);

  const removeHint = useCallback((id: number) => {
    setHints((prev) => prev.filter((h) => h.id !== id));
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      addHint();
      setTimeout(addHint, 400);
    }, 600);

    intervalRef.current = setInterval(() => {
      addHint();
    }, 1800 + Math.random() * 1000);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [addHint]);

  return (
    <div className="fixed inset-0 pointer-events-none z-5 hidden sm:block">
      <AnimatePresence>
        {hints.map((hint) => (
          <FloatingHintItem
            key={hint.id}
            hint={hint}
            onComplete={() => removeHint(hint.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FloatingHintItem({
  hint,
  onComplete,
}: {
  hint: HintItem;
  onComplete: () => void;
}) {
  useEffect(() => {
    const lingerTime = 2500 + Math.random() * 1500;
    const timer = setTimeout(onComplete, 1200 + lingerTime);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const isLeft = hint.side === "left";

  return (
    <motion.p
      initial={{ opacity: 0, y: 10, rotate: hint.rotation }}
      animate={{ opacity: 1, y: 0, rotate: hint.rotation }}
      exit={{ opacity: 0, y: -8, rotate: hint.rotation }}
      transition={{
        opacity: { duration: 1.0, ease: "easeInOut" },
        y: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
      }}
      className="absolute max-w-[20%]"
      style={{
        top: `${hint.yPercent}%`,
        left: isLeft ? `${hint.xPercent}%` : undefined,
        right: isLeft ? undefined : `${hint.xPercent}%`,
        textAlign: isLeft ? "left" : "right",
        fontFamily: "var(--font-cormorant-family)",
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
        lineHeight: 1.5,
        color: isLeft ? "rgba(250, 246, 240, 0.85)" : "rgba(26, 10, 14, 0.75)",
      }}
    >
      {hint.text}
    </motion.p>
  );
}
