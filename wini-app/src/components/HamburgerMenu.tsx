"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Dish, Session, FavoriteWine, Wine } from "@/lib/types";
import { getSessions, deleteSession, getFavorites, removeFavorite } from "@/lib/storage";
import AccountPanel from "@/components/AccountPanel";

type HamburgerMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (session: Session) => void;
  onWineDetail?: (wine: Wine, pairedDishes?: Dish[]) => void;
  onOpenAuth?: (view?: "signin" | "signup") => void;
};

const ease = [0.16, 1, 0.3, 1] as const;

type MenuSection = "pairings" | "saved" | "account" | "about" | null;

const menuItems: { id: MenuSection; label: string; icon: string }[] = [
  { id: "account", label: "Account", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
  { id: "pairings", label: "Previous Pairings", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { id: "saved", label: "Saved Wines", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "about", label: "About WINi", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const typeColors: Record<string, string> = {
  red: "#9B2335",
  white: "#C9A84C",
  "rosé": "#D4707A",
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

// Organic wine-puddle SVG path (objectBoundingBox coords 0-1)
// Wider at bottom (gravity pooling), irregular edges, slight asymmetry
const SPILL_PATH =
  "M 0.03 0.008 C 0.22 -0.004 0.58 0.006 0.97 0.008 C 1.02 0.02 1.015 0.08 1.008 0.2 C 1.0 0.38 1.02 0.52 1.012 0.68 C 1.005 0.8 1.03 0.92 0.96 1.01 C 0.88 1.04 0.68 0.985 0.5 1.015 C 0.32 1.035 0.15 0.995 0.05 1.02 C -0.015 1.03 -0.01 0.94 -0.005 0.8 C 0.0 0.64 -0.018 0.48 0.0 0.32 C 0.012 0.18 -0.008 0.08 0.008 0.025 C 0.015 0.012 0.02 0.007 0.03 0.008 Z";

export default function HamburgerMenu({ isOpen, onClose, onRestore, onWineDetail, onOpenAuth }: HamburgerMenuProps) {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWine[]>([]);
  const [activeSection, setActiveSection] = useState<MenuSection>(null);
  const [selectedFav, setSelectedFav] = useState<{ fav: FavoriteWine; top: number } | null>(null);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const savedSectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Auto-expand Saved Wines when menu opens — sync state with prop change
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate prop-to-state sync
      setFavorites(getFavorites());
      setActiveSection("saved");
      setSelectedFav(null);
      setAccountPanelOpen(false);
    } else {
      setActiveSection(null);
      setSelectedFav(null);
      setAccountPanelOpen(false);
    }
  }, [isOpen]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Spill animation: scale from origin near button, with liquid settle overshoot
  const spillAnimation = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, scale: 0, y: -16 },
        animate: { opacity: 1, scale: [0, 1.015, 1], y: [-16, 2, 0] },
        exit: { opacity: 0, scale: 0.85, y: -8 },
        transition: {
          duration: 0.45,
          ease,
          scale: { times: [0, 0.7, 1], duration: 0.45 },
          y: { times: [0, 0.7, 1], duration: 0.45 },
        },
      };

  // Stagger delay for menu items — appears as spill grows
  const itemDelay = reducedMotion ? 0 : 0.15;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* SVG clip-path definition (zero-size, doesn't affect layout) */}
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <clipPath id="wine-spill-clip" clipPathUnits="objectBoundingBox">
                <path d={SPILL_PATH} />
              </clipPath>
            </defs>
          </svg>

          {/* Invisible backdrop to close on outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Wine spill menu — cream puddle flowing from button */}
          <motion.div
            initial={spillAnimation.initial}
            animate={spillAnimation.animate}
            exit={spillAnimation.exit}
            transition={spillAnimation.transition}
            className="fixed z-50"
            style={{
              top: "calc(1rem + clamp(2.75rem, 8vw, 4rem) + 0.5rem)",
              left: "1rem",
              width: "18rem",
              background: "#E8DCC8",
              clipPath: "url(#wine-spill-clip)",
              transformOrigin: "12% 0%",
              filter: "drop-shadow(0 8px 32px rgba(92, 10, 30, 0.18))",
            }}
          >
            {/* Menu items — each with its expanded section directly below */}
            <nav className="py-1.5">
              {menuItems.map((item, i) => (
                <div key={item.id}>
                  <motion.button
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemDelay + i * 0.05, duration: 0.2, ease }}
                    onClick={() => {
                      const next = activeSection === item.id ? null : item.id;
                      if (next === "pairings") setSessions(getSessions());
                      if (next === "saved") setFavorites(getFavorites());
                      setActiveSection(next);
                      setSelectedFav(null);
                      setAccountPanelOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left transition-colors duration-200"
                    style={{
                      background: activeSection === item.id ? "rgba(92, 10, 30, 0.08)" : "transparent",
                    }}
                  >
                    <span
                      className="text-base"
                      style={{
                        fontFamily: "var(--font-jost-family)",
                        fontWeight: activeSection === item.id ? 500 : 400,
                        color: activeSection === item.id ? "#5C0A1E" : "#1A1A1A",
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.button>

                  <AnimatePresence mode="wait">
                    {activeSection === "account" && item.id === "account" && (
                      <motion.div
                        key="account"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: "rgba(92, 10, 30, 0.1)" }}
                      >
                        <div className="px-4 py-3">
                          {session?.user ? (
                            <>
                              <p
                                className="text-base font-medium"
                                style={{ fontFamily: "var(--font-jost-family)", color: "#1A1A1A" }}
                              >
                                {session.user.name || session.user.email}
                              </p>
                              {session.user.name && session.user.email && (
                                <p
                                  className="text-sm mt-0.5"
                                  style={{ fontFamily: "var(--font-jost-family)", color: "rgba(26, 26, 26, 0.5)" }}
                                >
                                  {session.user.email}
                                </p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => setAccountPanelOpen((prev) => !prev)}
                                  className="text-sm py-1.5 px-3 rounded-lg transition-colors duration-200"
                                  style={{
                                    fontFamily: "var(--font-jost-family)",
                                    fontWeight: 500,
                                    color: "#5C0A1E",
                                    background: "rgba(92, 10, 30, 0.08)",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Edit Profile
                                </button>
                                <button
                                  onClick={() => signOut()}
                                  className="text-sm py-1.5 px-3 rounded-lg transition-colors duration-200"
                                  style={{
                                    fontFamily: "var(--font-jost-family)",
                                    fontWeight: 400,
                                    color: "rgba(26, 26, 26, 0.5)",
                                    background: "transparent",
                                    border: "1px solid rgba(26, 26, 26, 0.12)",
                                    cursor: "pointer",
                                  }}
                                >
                                  Sign Out
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p
                                className="text-base italic mb-3"
                                style={{ fontFamily: "var(--font-cormorant-family)", color: "rgba(26, 26, 26, 0.45)" }}
                              >
                                Sign in to sync your pairings across devices
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    onClose();
                                    onOpenAuth?.("signin");
                                  }}
                                  className="text-sm py-1.5 px-3 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                                  style={{
                                    fontFamily: "var(--font-jost-family)",
                                    fontWeight: 500,
                                    color: "var(--charcoal)",
                                    background: "var(--gold)",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  Sign In
                                </button>
                                <button
                                  onClick={() => {
                                    onClose();
                                    onOpenAuth?.("signup");
                                  }}
                                  className="text-sm py-1.5 px-3 rounded-lg transition-colors duration-200"
                                  style={{
                                    fontFamily: "var(--font-jost-family)",
                                    fontWeight: 400,
                                    color: "#5C0A1E",
                                    background: "transparent",
                                    border: "1px solid rgba(92, 10, 30, 0.15)",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "2px",
                                  }}
                                >
                                  Create Account
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeSection === "pairings" && item.id === "pairings" && (
                      <motion.div
                        key="pairings"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: "rgba(92, 10, 30, 0.1)" }}
                      >
                        <div className="px-3 py-2 max-h-48 overflow-y-auto">
                          {sessions.length === 0 ? (
                            <p
                              className="text-sm py-2 px-1 italic"
                              style={{ fontFamily: "var(--font-cormorant-family)", color: "rgba(26, 26, 26, 0.45)" }}
                            >
                              No saved pairings yet
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              {sessions.map((s) => (
                                <div
                                  key={s.id}
                                  role="button"
                                  tabIndex={0}
                                  className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors duration-200 group"
                                  style={{ background: "transparent" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(92,10,30,0.06)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  onClick={() => {
                                    onRestore(s);
                                    onClose();
                                  }}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRestore(s); onClose(); }}}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-base truncate"
                                      style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "#1A1A1A" }}
                                    >
                                      {s.preview}
                                    </p>
                                    <p className="text-sm mt-0.5" style={{ fontFamily: "var(--font-jost-family)", color: "#5C0A1E" }}>
                                      {formatDate(s.timestamp)} · {s.dishes.length} dishes
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(s.id);
                                    }}
                                    className="opacity-60 hover:opacity-100 transition-opacity shrink-0 rounded-full flex items-center justify-center"
                                    style={{ color: "#5C0A1E", padding: "2px", cursor: "pointer" }}
                                    aria-label={`Delete ${s.preview}`}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeSection === "saved" && item.id === "saved" && (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: "rgba(92, 10, 30, 0.1)" }}
                      >
                        <div ref={savedSectionRef} className="px-3 py-2 max-h-64 overflow-y-auto">
                          {favorites.length === 0 ? (
                            <p
                              className="text-sm py-2 px-1 italic"
                              style={{ fontFamily: "var(--font-cormorant-family)", color: "rgba(26, 26, 26, 0.45)" }}
                            >
                              Tap the heart on any wine to save it here
                            </p>
                          ) : (
                            <div className="space-y-0.5">
                              {favorites.map((fav) => {
                                const typeColor = typeColors[fav.wine.type] || "#C9A84C";
                                const isSelected = selectedFav?.fav.id === fav.id;
                                return (
                                  <div
                                    key={fav.id}
                                    role="button"
                                    tabIndex={0}
                                    className="flex items-center gap-2 px-2 py-2 rounded-lg transition-colors duration-200 group cursor-pointer"
                                    style={{ background: isSelected ? "rgba(92,10,30,0.1)" : "transparent" }}
                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(92,10,30,0.06)"; }}
                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                    onClick={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setSelectedFav(isSelected ? null : { fav, top: rect.top });
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setSelectedFav(isSelected ? null : { fav, top: rect.top });
                                      }
                                    }}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ background: typeColor, boxShadow: `0 0 8px ${typeColor}` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-base truncate"
                                        style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 600, color: "#1A1A1A" }}
                                      >
                                        {fav.wine.name}
                                      </p>
                                      <p className="text-sm mt-0.5 capitalize" style={{ fontFamily: "var(--font-jost-family)", fontWeight: 500, color: typeColor }}>
                                        {fav.wine.type}{fav.wine.vintage ? ` · ${fav.wine.vintage}` : ""}{fav.wine.region ? ` · ${fav.wine.region}` : ""}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavorite(fav.wine);
                                        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
                                        if (selectedFav?.fav.id === fav.id) setSelectedFav(null);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded-full flex items-center justify-center"
                                      style={{ color: "rgba(26, 26, 26, 0.35)", padding: "2px", cursor: "pointer" }}
                                      aria-label={`Remove ${fav.wine.name} from saved`}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {activeSection === "about" && item.id === "about" && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease }}
                        className="overflow-hidden border-t"
                        style={{ borderColor: "rgba(92, 10, 30, 0.1)" }}
                      >
                        <div className="px-4 py-3">
                          <p
                            className="text-base leading-relaxed"
                            style={{ fontFamily: "var(--font-cormorant-family)", fontStyle: "italic", color: "#0D0D0D" }}
                          >
                            &ldquo;We are wine enthusiasts who love going to restaurants but always forget
                            which wines were good for pairing. Sometimes at the table we forget what
                            sommelier said, hence we decided to create WINi, a pocket sized wine
                            pairing buddy!&rdquo;
                          </p>
                          <p
                            className="text-base mt-2"
                            style={{ fontFamily: "var(--font-jost-family)", fontWeight: 500, color: "#5C0A1E" }}
                          >
                            — Alfred & Yasmine
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </motion.div>

          {/* Favorite action popup — dark glassmorphic (contrast with cream menu) */}
          <AnimatePresence>
            {selectedFav && activeSection === "saved" && (
              <motion.div
                key="fav-popup"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease }}
                className="fixed z-50 rounded-xl px-5 py-4"
                style={{
                  width: 220,
                  left: "19.5rem",
                  top: Math.max(60, selectedFav.top - 8),
                  background: "rgba(13, 13, 13, 0.92)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Paired with */}
                {(selectedFav.fav.pairedDishData?.length || selectedFav.fav.pairedWith) && (
                  <div className="mb-3">
                    <p
                      className="text-[10px] uppercase tracking-wider text-gold/50 mb-1"
                      style={{ fontFamily: "var(--font-jost-family)" }}
                    >
                      Paired with
                    </p>
                    {selectedFav.fav.pairedDishData?.length ? (
                      selectedFav.fav.pairedDishData.map((dish) => (
                        <div key={dish.id} className="flex items-center gap-1.5 mt-0.5">
                          <span style={{ fontSize: "0.7rem" }}>{categoryIcons[dish.category] || categoryIcons.other}</span>
                          <span
                            className="text-xs text-cream/70 leading-tight"
                            style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 500 }}
                          >
                            {dish.name}
                          </span>
                        </div>
                      ))
                    ) : selectedFav.fav.pairedWith ? (
                      <span
                        className="text-xs text-cream/70 leading-tight"
                        style={{ fontFamily: "var(--font-cormorant-family)", fontWeight: 500 }}
                      >
                        {selectedFav.fav.pairedWith}
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Divider */}
                <div className="w-full h-px mb-3" style={{ background: "rgba(255, 255, 255, 0.06)" }} />

                {/* Action buttons — stacked for narrow popup */}
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      onWineDetail?.(selectedFav.fav.wine, selectedFav.fav.pairedDishData);
                      setSelectedFav(null);
                      onClose();
                    }}
                    className="text-left text-xs text-gold/80 transition-colors duration-200 hover:text-gold py-1"
                    style={{ fontFamily: "var(--font-jost-family)" }}
                  >
                    More about this wine
                  </button>
                  <button
                    onClick={() => {
                      window.open(
                        `https://www.vivino.com/search/wines?q=${encodeURIComponent(selectedFav.fav.wine.name)}`,
                        "_blank"
                      );
                    }}
                    className="text-left text-xs text-gold/80 transition-colors duration-200 hover:text-gold py-1"
                    style={{ fontFamily: "var(--font-jost-family)" }}
                  >
                    Buy this wine &rarr;
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account editing panel */}
          <AccountPanel
            isOpen={accountPanelOpen}
            onClose={() => setAccountPanelOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
