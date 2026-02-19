"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SearchBarProps = {
  onSubmit: (images: File[], text: string) => void;
  position?: "center" | "bottom";
  placeholder?: string;
  language?: string;
  onTranslate?: () => void;
  isTranslating?: boolean;
  initialImages?: File[];
  initialPreviews?: string[];
  onClean?: () => void;
  needsRegeneration?: boolean;
  isRegenerating?: boolean;
  onRegenerate?: () => void;
  hideCamera?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Lightbox overlay ── */

type LightboxProps = {
  previews: string[];
  expandedPreview: number;
  onClose: () => void;
  onNavigate: (index: number | ((prev: number | null) => number)) => void;
};

function LightboxOverlay({ previews, expandedPreview, onClose, onNavigate }: LightboxProps) {
  // Escape key closes lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasMultiple = previews.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "rgba(13, 11, 14, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-label="Image preview"
    >
      {/* Flex row: [< arrow] [image + X + counter] [> arrow] */}
      <div
        className="flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left arrow */}
        {hasMultiple && (
          <button
            onClick={() => onNavigate((prev) => ((prev ?? 0) - 1 + previews.length) % previews.length)}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            style={{
              background: "rgba(13, 13, 13, 0.6)",
              color: "#FAF6F0",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Previous photo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Image container */}
        <motion.div
          key={expandedPreview}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.25, ease }}
          className="relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previews[expandedPreview]}
            alt={`Upload ${expandedPreview + 1}`}
            className="rounded-xl"
            style={{ maxWidth: "min(85vw, 520px)", maxHeight: "70vh", objectFit: "contain" }}
          />

          {/* Close button — burgundy */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-100 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            style={{
              background: "rgba(92, 10, 30, 0.85)",
              color: "#FAF6F0",
              opacity: 0.85,
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
            aria-label="Close preview"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Photo counter */}
          {hasMultiple && (
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs tracking-wider"
              style={{ fontFamily: "var(--font-jost-family)", color: "rgba(250, 246, 240, 0.5)" }}
            >
              {expandedPreview + 1} / {previews.length}
            </div>
          )}
        </motion.div>

        {/* Right arrow */}
        {hasMultiple && (
          <button
            onClick={() => onNavigate((prev) => ((prev ?? 0) + 1) % previews.length)}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
            style={{
              background: "rgba(13, 13, 13, 0.6)",
              color: "#FAF6F0",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Next photo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function SearchBar({ onSubmit, position = "center", placeholder, language, onTranslate, isTranslating, initialImages, initialPreviews, onClean, needsRegeneration, isRegenerating, onRegenerate, hideCamera }: SearchBarProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>(() => initialImages ?? []);
  const [previews, setPreviews] = useState<string[]>(() => initialPreviews ?? []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [expandedPreview, setExpandedPreview] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedPlaceholder = placeholder ?? (isDesktop ? "Upload a photo of food & wine menu" : "Take a photo of food & wine menu");

  const isBottom = position === "bottom";

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input value so onChange fires even when re-selecting the same file
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (images.length === 0 && !text.trim()) return;
    onSubmit(images, text);
    setText("");
    setImages([]);
    setPreviews([]);
  };

  const handleClean = () => {
    setImages([]);
    setPreviews([]);
    setText("");
    onClean?.();
  };

  const showCleanButton = images.length > 0;

  return (
    <>
    {/* Hidden file input — outside motion containers to avoid layout animation triggers */}
    {!hideCamera && (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple
      onChange={handleFiles}
      className="hidden"
    />
    )}
    <motion.div
      layout
      animate={{
        y: 0,
      }}
      transition={{ duration: 0.4, ease }}
      className={`w-full mx-auto px-4 ${
        isBottom
          ? "fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom,0.5rem)] pt-3"
          : "max-w-2xl"
      }`}
      style={isBottom ? {
        background: "rgba(13, 11, 14, 0.5)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      } : undefined}
    >
      <div className={`relative ${isBottom ? "max-w-2xl mx-auto" : ""}`}>
        {/* Image previews — stacked above the pill */}
        {!hideCamera && previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full left-0 right-0 flex gap-2 pb-3 overflow-x-auto justify-center"
          >
            {previews.map((src, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-white/20 cursor-pointer"
                onClick={() => setExpandedPreview(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-burgundy rounded-full flex items-center justify-center text-xs text-white"
                >
                  x
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search bar row — regen + translate icons outside pill */}
        <div className="flex items-center gap-2">
          {/* Regenerate button — wine bottle with reverse arrow */}
          {needsRegeneration && onRegenerate && (
            <div className="relative shrink-0 group">
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
                  width: "clamp(2.75rem, 8vw, 4rem)",
                  height: "clamp(2.75rem, 8vw, 4rem)",
                  background: "#1A1A1A",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                  cursor: isRegenerating ? "wait" : "pointer",
                }}
                aria-label={isRegenerating ? "Regenerating pairings..." : "Regenerate pairings"}
              >
                <motion.svg
                  style={{ width: "clamp(26px, 5.5vw, 38px)", height: "clamp(26px, 5.5vw, 38px)" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                  {/* Circular reverse arrow — smooth rotation when regenerating */}
                  <motion.g
                    style={{ transformOrigin: "center" }}
                    animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
                    transition={isRegenerating
                      ? { duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                      : { duration: 0 }
                    }
                  >
                    <path d="M12 3a9 9 0 1 1-6.36 2.64" strokeWidth="1.6" fill="none" />
                    <path d="M9 1.5L5.64 5.64L9.5 6.5" strokeWidth="1.6" fill="none" />
                  </motion.g>
                  {/* Wine bottle — stays stationary */}
                  <g strokeWidth="1.4" fill="none">
                    <path d="M11 7v2.5c0 0-2 1-2 3v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4c0-2-2-3-2-3V7" />
                    <path d="M11 7h2" />
                  </g>
                </motion.svg>
              </motion.button>
              {/* Permanent label below button */}
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap pointer-events-none"
                style={{
                  fontFamily: "var(--font-cormorant-family)",
                  fontWeight: 600,
                  fontSize: "clamp(0.6rem, 1.5vw, 0.75rem)",
                  color: "rgba(250, 246, 240, 0.55)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                }}
              >
                Regenerate
              </span>
            </div>
          )}

          {/* Translate button — outside pill, shown for non-English results */}
          {language && language !== "en" && onTranslate && (
            <div className="relative shrink-0 group">
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onTranslate}
                disabled={isTranslating}
                className="shrink-0 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                style={{
                  width: "clamp(2.75rem, 8vw, 4rem)",
                  height: "clamp(2.75rem, 8vw, 4rem)",
                  background: "#1A1A1A",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                }}
                aria-label="Translate to English"
              >
                {isTranslating ? (
                  <svg style={{ width: "clamp(18px, 3.5vw, 28px)", height: "clamp(18px, 3.5vw, 28px)" }} viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="1.8" className="animate-spin">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg style={{ width: "clamp(18px, 3.5vw, 28px)", height: "clamp(18px, 3.5vw, 28px)" }} viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 8l6 6" />
                    <path d="M4 14l6-6 2-3" />
                    <path d="M2 5h12" />
                    <path d="M7 2h1" />
                    <path d="M22 22l-5-10-5 10" />
                    <path d="M14 18h6" />
                  </svg>
                )}
              </motion.button>
              {/* Hover tooltip */}
              <span
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  fontFamily: "var(--font-jost-family)",
                  background: "rgba(13, 13, 13, 0.9)",
                  color: "#FAF6F0",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Translate
              </span>
            </div>
          )}

          {/* Search pill */}
          <motion.div
            initial={isBottom ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: isBottom ? 0 : 0.4, ease }}
            className="relative flex-1 flex items-center rounded-full"
            style={{
              gap: "clamp(0.5rem, 2vw, 0.75rem)",
              padding: "clamp(0.5rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)",
              background: "linear-gradient(to right, rgba(255,255,255,0.05) 55%, rgba(0,0,0,0.2) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
          {/* Camera button — opens file picker (hidden in results mode) */}
          {!hideCamera && (
          <div className="shrink-0 relative flex items-center" style={{ gap: "0.35rem" }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
              className="shrink-0 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                width: "clamp(2.75rem, 8vw, 4rem)",
                height: "clamp(2.75rem, 8vw, 4rem)",
                background: "#1A1A1A",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
              aria-label="Add photos"
            >
              <svg style={{ width: "clamp(18px, 3.5vw, 28px)", height: "clamp(18px, 3.5vw, 28px)" }} viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>

            {/* Clean button — pulsing, clears images */}
            {showCleanButton && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                onClick={handleClean}
                className="shrink-0 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white/15"
                style={{
                  width: "1.6rem",
                  height: "1.6rem",
                  background: "rgba(250, 246, 240, 0.08)",
                  border: "1px solid rgba(250, 246, 240, 0.15)",
                }}
                aria-label="Clear photos and start fresh"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="rgba(250, 246, 240, 0.6)" strokeWidth="1.5" strokeLinecap="round">
                  {/* X */}
                  <line x1="3" y1="3" x2="9" y2="9" />
                  <line x1="9" y1="3" x2="3" y2="9" />
                  {/* Sparkle lines */}
                  <line x1="6" y1="0.5" x2="6" y2="2" strokeWidth="1" opacity="0.5" />
                  <line x1="11.5" y1="6" x2="10" y2="6" strokeWidth="1" opacity="0.5" />
                  <line x1="0.5" y1="6" x2="2" y2="6" strokeWidth="1" opacity="0.5" />
                  <line x1="6" y1="10" x2="6" y2="11.5" strokeWidth="1" opacity="0.5" />
                </svg>
              </motion.button>
            )}
          </div>
          )}

          {/* Text input with split-color placeholder */}
          <div className="relative flex-1">
            {!text && (
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 pointer-events-none select-none"
                style={{
                  fontFamily: "var(--font-jost-family)",
                  fontSize: "clamp(0.8rem, 2vw, 1rem)",
                  fontWeight: 400,
                  top: "50%",
                  transform: "translateY(-55%)",
                  color: "var(--cream-lightest)",
                  textShadow: "0 0 12px rgba(250, 246, 240, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {resolvedPlaceholder}
              </span>
            )}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="relative w-full bg-transparent outline-none text-cream-lightest"
              style={{ fontFamily: "var(--font-jost-family)", fontSize: "clamp(0.8rem, 2vw, 1rem)" }}
            />
          </div>

          {/* Send button */}
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{
              width: "clamp(2.75rem, 8vw, 4rem)",
              height: "clamp(2.75rem, 8vw, 4rem)",
              background: images.length > 0 || text.trim() ? "#1A1A1A" : "rgba(26, 26, 26, 0.6)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
            aria-label="Search"
          >
            <svg style={{ width: "clamp(16px, 3vw, 22px)", height: "clamp(16px, 3vw, 22px)" }} viewBox="0 0 24 24" fill="none" stroke={images.length > 0 || text.trim() ? "#FAF6F0" : "rgba(250, 246, 240, 0.6)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>

    {/* Lightbox overlay for expanded image preview */}
    {!hideCamera && (
    <AnimatePresence>
      {expandedPreview !== null && previews[expandedPreview] && (
        <LightboxOverlay
          previews={previews}
          expandedPreview={expandedPreview}
          onClose={() => setExpandedPreview(null)}
          onNavigate={setExpandedPreview}
        />
      )}
    </AnimatePresence>
    )}
    </>
  );
}
