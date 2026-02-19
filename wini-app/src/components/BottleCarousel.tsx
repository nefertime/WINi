"use client";

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BOTTLES, isSparklingBottle, BOTTLE_INFO } from "@/lib/bottles";
import BubbleParticles from "./BubbleParticles";

type BottleCarouselProps = {
  isCompact?: boolean;
};

export type BottleCarouselRef = {
  cycleRed: () => void;
  cycleWhite: () => void;
};

const ease = [0.16, 1, 0.3, 1] as const;
const HOVER_COOLDOWN = 500;

const BottleCarousel = forwardRef<BottleCarouselRef, BottleCarouselProps>(
  function BottleCarousel({ isCompact = false }, ref) {
    const [index, setIndex] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const lastCycleRef = useRef(0);

    const cycle = useCallback(() => {
      setIndex((i) => (i + 1) % BOTTLES.length);
      setShowInfo(false);
      lastCycleRef.current = Date.now();
    }, []);

    const handleHover = useCallback(() => {
      if (isCompact) return;
      if (Date.now() - lastCycleRef.current < HOVER_COOLDOWN) return;
      cycle();
    }, [isCompact, cycle]);

    // Keep external API compatible — both cycle the same bottle
    useImperativeHandle(ref, () => ({ cycleRed: cycle, cycleWhite: cycle }));

    const current = BOTTLES[index];
    const info = BOTTLE_INFO[current.name];
    const showBubbles = isSparklingBottle(current.name);

    const bottleWidth = isCompact ? "clamp(40px, 8vw, 60px)" : "clamp(120px, 18vw, 160px)";
    const containerHeight = isCompact ? "clamp(60px, 10vh, 100px)" : "clamp(240px, 40vh, 400px)";

    return (
      <motion.div
        className="relative flex justify-center items-center"
        animate={{
          height: containerHeight,
          opacity: isCompact ? 0.6 : 1,
        }}
        transition={{ duration: 0.4, ease }}
        style={{ height: containerHeight }}
      >
        <motion.div
          className="relative overflow-visible"
          animate={{ width: bottleWidth, height: containerHeight }}
          transition={{ duration: 0.4, ease }}
        >
          <AnimatePresence>
            <motion.div
              key={`bottle-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={cycle}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cycle(); }}}
              onMouseEnter={() => { handleHover(); setIsPulsing(true); setShowInfo(true); }}
              onMouseLeave={() => { setIsPulsing(false); setShowInfo(false); }}
              role="button"
              tabIndex={0}
              aria-label={`${current.name} — hover or click to change`}
            >
              <Image
                src={current.src}
                alt={current.name}
                width={400}
                height={800}
                className="w-full h-full"
                priority
                unoptimized
                style={{ objectFit: "contain", objectPosition: "center" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Info "i" button — top right of bottle */}
          {!isCompact && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo((prev) => !prev);
              }}
              onMouseEnter={() => setIsPulsing(true)}
              onMouseLeave={() => setIsPulsing(false)}
              animate={isPulsing && !showInfo ? {
                scale: [1, 1.18, 1, 1.12, 1],
              } : { scale: 1 }}
              transition={isPulsing && !showInfo ? {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              } : { duration: 0.2 }}
              className="absolute z-10 flex items-center justify-center"
              style={{
                top: "60%",
                right: "clamp(-2rem, -3vw, -1rem)",
                width: "clamp(3.8rem, 7.8vw, 5rem)",
                height: "clamp(3.8rem, 7.8vw, 5rem)",
                borderRadius: "50%",
                background: "transparent",
                border: "none",
              }}
              aria-label="Wine information"
            >
              <span
                style={{
                  fontFamily: "var(--font-cormorant-family)",
                  fontWeight: 600,
                  fontStyle: "italic",
                  fontSize: "clamp(2.2rem, 3.8vw, 2.8rem)",
                  color: "#5C0A1E",
                  lineHeight: 1,
                  position: "relative",
                  top: "0.5px",
                }}
              >
                i
              </span>
            </motion.button>
          )}

          {/* Info popup */}
          <AnimatePresence>
            {showInfo && info && !isCompact && (
              <motion.div
                key="bottle-info"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.2, ease }}
                className="absolute z-20"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                style={{
                  top: "20%",
                  right: "clamp(-8rem, -12vw, -12rem)",
                  width: "13rem",
                  background: "rgba(13, 13, 13, 0.92)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "0.75rem",
                  padding: "0.875rem",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
                }}
              >
                <h4
                  className="text-sm text-cream-lightest leading-tight mb-1"
                  style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600 }}
                >
                  {current.name}
                </h4>
                <p className="text-[11px] text-cream/40 mb-2 capitalize">
                  {current.type} · {info.grape}
                </p>
                <p className="text-[11px] text-cream/50 mb-1">
                  {info.region}
                </p>
                <p
                  className="text-xs text-cream/65 leading-relaxed mb-3"
                  style={{ fontFamily: "var(--font-cormorant-family)", fontStyle: "italic" }}
                >
                  {info.description}
                </p>
                <a
                  href={info.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-gold transition-colors duration-300 hover:text-cream-lightest"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Find on Vivino
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bubble particles for sparkling wines */}
          {showBubbles && !isCompact && <BubbleParticles active={showBubbles} />}
        </motion.div>
      </motion.div>
    );
  }
);

export default BottleCarousel;
