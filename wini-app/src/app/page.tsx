"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import BottleCarousel, { BottleCarouselRef } from "@/components/BottleCarousel";
import SearchBar from "@/components/SearchBar";
import ScanningAnimation from "@/components/ScanningAnimation";
import InlinePairingResults from "@/components/InlinePairingResults";
import FloatingHints from "@/components/FloatingHints";
import MenuButton from "@/components/MenuButton";
import HamburgerMenu from "@/components/HamburgerMenu";
import WineDetailOverlay from "@/components/WineDetailOverlay";
import DishShelf from "@/components/DishShelf";
import AuthModal from "@/components/AuthModal";
import { AnalyzeResponse, Dish, Session, Wine } from "@/lib/types";
import { saveSession, deleteSession, generateId } from "@/lib/storage";

type AppState = "home" | "scanning" | "results";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [pairingData, setPairingData] = useState<AnalyzeResponse | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [menuDetailWine, setMenuDetailWine] = useState<{ wine: Wine; pairedDishes?: Dish[] } | null>(null);
  const carouselRef = useRef<BottleCarouselRef>(null);
  const [layoutMode, setLayoutMode] = useState<"home" | "results">("home");
  const layoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showResultsLayout = layoutMode === "results";
  const [dismissedDishIds, setDismissedDishIds] = useState<Set<string>>(new Set());
  const [addedDishIds, setAddedDishIds] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPairingSaved, setIsPairingSaved] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"signin" | "signup">("signin");

  // Image preservation for back + regeneration
  const [lastBase64Images, setLastBase64Images] = useState<string[]>([]);
  const [lastImages, setLastImages] = useState<File[]>([]);
  const [lastPreviews, setLastPreviews] = useState<string[]>([]);
  const isLocalPairingUpdate = useRef(false);

  // Reset dish management when new pairing data arrives (API call, restore)
  // Skip reset when pairingData changes from local dismiss/regen
  useEffect(() => {
    if (isLocalPairingUpdate.current) {
      isLocalPairingUpdate.current = false;
      return;
    }
    setDismissedDishIds(new Set());
    setAddedDishIds(new Set());
  }, [pairingData]);

  // Derived state: all dishes from response
  const allDishes = [...(pairingData?.dishes ?? []), ...(pairingData?.otherDishes ?? [])];
  const originalDishIds = new Set(pairingData?.dishes.map((d) => d.id) ?? []);
  const pairedDishIds = useMemo(() => new Set(pairingData?.pairings.map((p) => p.dish_id) ?? []), [pairingData?.pairings]);

  // Active = (original + user-added) minus dismissed
  const activeDishes = allDishes.filter((d) =>
    (originalDishIds.has(d.id) || addedDishIds.has(d.id)) && !dismissedDishIds.has(d.id)
  );
  const activeDishIdSet = new Set(activeDishes.map((d) => d.id));

  // Shelf = everything not active
  const shelfDishes = allDishes.filter((d) => !activeDishIdSet.has(d.id));

  // Needs regeneration when any active dish has no pairings
  const needsRegeneration = activeDishes.some((d) => !pairedDishIds.has(d.id));

  // Only show wines that have pairings with active dishes
  const relevantWines = useMemo(() => {
    if (!pairingData) return [];
    return pairingData.wines.filter((w) =>
      pairingData.pairings.some((p) => p.wine_id === w.id && activeDishIdSet.has(p.dish_id))
    );
  }, [pairingData, activeDishIdSet]);

  const handleDismissDish = useCallback((dishId: string) => {
    setDismissedDishIds((prev) => new Set(prev).add(dishId));
    // Strip pairings so re-adding requires regeneration
    isLocalPairingUpdate.current = true;
    setPairingData((prev) => {
      if (!prev) return prev;
      const newPairings = prev.pairings.filter((p) => p.dish_id !== dishId);
      const usedWineIds = new Set(newPairings.map((p) => p.wine_id));
      const newWines = prev.wines.filter((w) => usedWineIds.has(w.id));
      return { ...prev, pairings: newPairings, wines: newWines };
    });
  }, []);

  // Add a dish from the shelf to active
  const handleAddDish = useCallback((dishId: string) => {
    setDismissedDishIds((prev) => { const n = new Set(prev); n.delete(dishId); return n; });
    setAddedDishIds((prev) => new Set(prev).add(dishId));
  }, []);

  const handleSubmit = useCallback(async (images: File[], text: string) => {
    setState("scanning");
    setLayoutMode("home");
    if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);

    // Preserve images for back navigation + regeneration
    setLastImages(images);
    const newPreviews = await Promise.all(
      images.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
    setLastPreviews(newPreviews);
    setLastBase64Images(newPreviews);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newPreviews, text }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data: AnalyzeResponse = await res.json();
      const newId = generateId();
      setPairingData(data);
      setSessionId(newId);
      setIsPairingSaved(false);
      setState("results");
      layoutTimerRef.current = setTimeout(() => setLayoutMode("results"), 500);
    } catch (error) {
      console.error("Submit error:", error);
      const demoData = getDemoData();
      const newId = generateId();
      setPairingData(demoData);
      setSessionId(newId);
      setIsPairingSaved(false);
      setState("results");
      layoutTimerRef.current = setTimeout(() => setLayoutMode("results"), 500);
    }
  }, []);

  const handleRestore = useCallback((session: Session) => {
    if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    setPairingData({
      dishes: session.dishes,
      wines: session.wines,
      pairings: session.pairings,
      language: session.language,
      otherDishes: session.otherDishes,
    });
    setSessionId(session.id);
    setState("results");
    setLayoutMode("results");
    setIsPairingSaved(true);
  }, []);

  const handleSavePairing = useCallback(() => {
    if (!pairingData || !sessionId) return;
    if (isPairingSaved) {
      deleteSession(sessionId);
      setIsPairingSaved(false);
    } else {
      saveSession({
        id: sessionId,
        timestamp: Date.now(),
        dishes: activeDishes,
        wines: relevantWines,
        pairings: pairingData.pairings,
        selections: [],
        preview: activeDishes[0]?.name || "Wine Pairing",
        language: pairingData.language,
        otherDishes: shelfDishes,
      });
      setIsPairingSaved(true);
    }
  }, [pairingData, sessionId, activeDishes, relevantWines, shelfDishes, isPairingSaved]);

  const handleTranslate = useCallback(async () => {
    if (!pairingData || !pairingData.language || pairingData.language === "en") return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: pairingData,
          sourceLanguage: pairingData.language,
        }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const translated: AnalyzeResponse = await res.json();
      setPairingData(translated);
    } catch (error) {
      console.error("Translate error:", error);
    } finally {
      setIsTranslating(false);
    }
  }, [pairingData]);

  const handleBack = useCallback(() => {
    if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    setLayoutMode("home");
    // After reverse animation completes, reset data state (but keep images)
    layoutTimerRef.current = setTimeout(() => {
      setState("home");
      setPairingData(null);
    }, 600);
  }, []);

  const handleClean = useCallback(() => {
    setLastImages([]);
    setLastPreviews([]);
    setLastBase64Images([]);
  }, []);

  // Pairing matrix: max wines per dish based on dish count
  const getMaxWinesPerDish = useCallback((count: number) => {
    if (count <= 1) return 5;
    if (count === 2) return 4;
    if (count === 3) return 3;
    return 2;
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!pairingData || lastBase64Images.length === 0) return;
    setIsRegenerating(true);

    try {
      const dishesNeedingPairings = activeDishes.filter((d) => !pairedDishIds.has(d.id));
      const prevPairedCount = activeDishes.length - dishesNeedingPairings.length;
      const matrixChanged = getMaxWinesPerDish(prevPairedCount) !== getMaxWinesPerDish(activeDishes.length);

      // Full regen if matrix threshold changed, partial otherwise
      const dishNamesToSend = matrixChanged
        ? activeDishes.map((d) => d.name)
        : dishesNeedingPairings.map((d) => d.name);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: lastBase64Images, dishNames: dishNamesToSend }),
      });

      if (!res.ok) throw new Error("Regeneration failed");
      const data: AnalyzeResponse = await res.json();

      // Remap API dish IDs → our existing dish IDs (API generates its own d1, d2...)
      const dishesToMatch = matrixChanged ? activeDishes : dishesNeedingPairings;
      const apiDishIdMap = new Map<string, string>();
      for (const apiDish of data.dishes ?? []) {
        const match = dishesToMatch.find((d) => d.name.toLowerCase() === apiDish.name.toLowerCase());
        if (match) apiDishIdMap.set(apiDish.id, match.id);
      }

      isLocalPairingUpdate.current = true;
      setPairingData((prev) => {
        if (!prev) return prev;

        // Remap wine IDs: match existing wines by name, generate unique IDs for new ones
        const existingWineByName = new Map(prev.wines.map((w) => [w.name.toLowerCase(), w]));
        const usedWineIds = new Set(prev.wines.map((w) => w.id));
        const apiWineIdMap = new Map<string, string>();
        const winesFromApi: Wine[] = [];

        for (const apiWine of data.wines ?? []) {
          const existing = existingWineByName.get(apiWine.name.toLowerCase());
          if (existing) {
            apiWineIdMap.set(apiWine.id, existing.id);
          } else {
            // Generate unique ID that won't collide
            let newId = apiWine.id;
            let counter = 1;
            while (usedWineIds.has(newId)) {
              newId = `${apiWine.id}_r${counter++}`;
            }
            usedWineIds.add(newId);
            apiWineIdMap.set(apiWine.id, newId);
            winesFromApi.push({ ...apiWine, id: newId });
          }
        }

        // Remap pairings to use our dish + wine IDs
        const remappedPairings = data.pairings.map((p) => ({
          ...p,
          dish_id: apiDishIdMap.get(p.dish_id) ?? p.dish_id,
          wine_id: apiWineIdMap.get(p.wine_id) ?? p.wine_id,
        }));

        // For full regen: collect all wines (reused existing + genuinely new)
        // For partial: merge new wines with existing
        if (matrixChanged) {
          const reusedWines = prev.wines.filter((w) =>
            [...apiWineIdMap.values()].includes(w.id)
          );
          return {
            ...prev,
            wines: [...reusedWines, ...winesFromApi],
            pairings: remappedPairings,
            dishes: activeDishes,
            otherDishes: shelfDishes,
          };
        }

        return {
          ...prev,
          wines: [...prev.wines, ...winesFromApi],
          pairings: [...prev.pairings, ...remappedPairings],
          dishes: activeDishes,
          otherDishes: shelfDishes,
        };
      });
    } catch (error) {
      console.error("Regenerate error:", error);
    } finally {
      setIsRegenerating(false);
    }
  }, [pairingData, lastBase64Images, activeDishes, shelfDishes, pairedDishIds, getMaxWinesPerDish]);

  // Click on background → cycle bottle (home only)
  const handlePageClick = useCallback((e: React.MouseEvent) => {
    if (state !== "home") return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a, label, [role="button"], [role="dialog"]')) return;
    carouselRef.current?.cycleRed();
  }, [state]);

  useEffect(() => {
    return () => {
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    };
  }, []);

  // isResults = data is ready; showResultsLayout = visual layout has transitioned
  const isResults = state === "results";

  return (
    <main className="min-h-dvh relative overflow-x-hidden" style={{ background: "var(--charcoal)" }} onClick={handlePageClick}>
      {/* Menu button - always visible */}
      <MenuButton
        onClick={() => setMenuOpen((prev) => !prev)}
        isOpen={menuOpen}
      />

      {/* Hamburger menu */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRestore={handleRestore}
        onWineDetail={(wine, pairedDishes) => setMenuDetailWine({ wine, pairedDishes })}
        onOpenAuth={(view) => {
          setAuthModalView(view ?? "signin");
          setAuthModalOpen(true);
        }}
      />

      {/* Background: Split — always visible */}
      <div
        className="fixed inset-0"
        style={{ background: "linear-gradient(to right, var(--burgundy) 50%, var(--cream) 50%)" }}
      >
        {/* Subtle gradient overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        {/* Bottom fade — darkens both halves so search bar glassmorphism reads uniformly */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: "35%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* Subtle darkening overlay in results for readability */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: showResultsLayout ? 1 : 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ background: "rgba(0, 0, 0, 0.12)" }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center min-h-dvh" style={{ paddingBottom: "env(safe-area-inset-bottom, 0.5rem)" }}>
        {/* Logo */}
        <motion.div
          className="w-full"
          animate={{
            paddingTop: showResultsLayout ? "clamp(1.25rem, 3vh, 2rem)" : "clamp(2rem, 6vh, 5rem)",
          }}
          transition={{ duration: 0.7, ease }}
        >
          <Logo variant={showResultsLayout ? "compact" : "split"} />
        </motion.div>

        {/* Bottle Carousel — hidden in results */}
        <motion.div
          className="w-full flex justify-center overflow-hidden"
          style={{ maxHeight: 500 }}
          animate={{
            marginTop: showResultsLayout ? "0" : "0.5rem",
            opacity: showResultsLayout ? 0 : 1,
            maxHeight: showResultsLayout ? 0 : 500,
          }}
          transition={{ duration: 0.6, ease }}
        >
          <BottleCarousel ref={carouselRef} isCompact={showResultsLayout} />
        </motion.div>

        {/* Inline pairing results */}
        <AnimatePresence>
          {showResultsLayout && pairingData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.2, duration: 0.6, ease }}
              className="w-full"
              style={{ marginTop: "clamp(0.75rem, 2vh, 1.5rem)" }}
            >
              <InlinePairingResults
                dishes={activeDishes}
                wines={relevantWines}
                pairings={pairingData.pairings}
                dismissedDishIds={dismissedDishIds}
                onDismissDish={handleDismissDish}
                isPairingSaved={isPairingSaved}
                onSavePairing={handleSavePairing}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar — always in DOM, faded during scanning, scales down in results */}
        <motion.div
          className="w-full max-w-2xl px-4"
          animate={{
            marginTop: showResultsLayout ? "clamp(1.5rem, 4vh, 3.5rem)" : "1.5rem",
            opacity: state === "scanning" ? 0 : 1,
            scale: showResultsLayout ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease }}
          style={{ pointerEvents: state === "scanning" ? "none" : "auto", marginBottom: "clamp(1rem, 3vh, 2rem)" }}
        >
          {showResultsLayout && shelfDishes.length > 0 && (
            <DishShelf
              dishes={shelfDishes}
              onAdd={handleAddDish}
              maxActive={5}
              activeCount={activeDishes.length}
            />
          )}
          <SearchBar
            onSubmit={handleSubmit}
            position="center"
            placeholder={showResultsLayout ? "What do you think of the pairing ideas?" : undefined}
            language={pairingData?.language}
            onTranslate={handleTranslate}
            isTranslating={isTranslating}
            initialImages={lastImages}
            initialPreviews={lastPreviews}
            onClean={handleClean}
            needsRegeneration={needsRegeneration && lastBase64Images.length > 0}
            isRegenerating={isRegenerating}
            onRegenerate={handleRegenerate}
          />
        </motion.div>

        {/* Back button — next to avatar, results mode only */}
        <AnimatePresence>
          {isResults && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.3, duration: 0.25, ease }}
              onClick={handleBack}
              className="fixed z-50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                top: "1rem",
                left: "calc(1rem + clamp(2.75rem, 8vw, 4rem) + 0.5rem)",
                width: "clamp(2.75rem, 8vw, 4rem)",
                height: "clamp(2.75rem, 8vw, 4rem)",
                background: "#1A1A1A",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
              aria-label="Back to home"
            >
              <svg style={{ width: "clamp(18px, 3.5vw, 28px)", height: "clamp(18px, 3.5vw, 28px)" }} viewBox="0 0 24 24" fill="none" stroke="#FAF6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating hints - home only */}
      <AnimatePresence>
        {state === "home" && (
          <motion.div
            key="hints"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <FloatingHints />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanning animation overlay */}
      <AnimatePresence>
        {state === "scanning" && (
          <ScanningAnimation key="scanning" />
        )}
      </AnimatePresence>

      {/* Wine detail overlay from hamburger menu favorites */}
      <AnimatePresence>
        {menuDetailWine && (
          <WineDetailOverlay
            wine={menuDetailWine.wine}
            pairedDishes={menuDetailWine.pairedDishes}
            onClose={() => { setMenuDetailWine(null); setMenuOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* Auth modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
      />
    </main>
  );
}

// Demo data for development/fallback when API is not configured
// Follows the pairing matrix: 5 dishes → max 2 wines/dish, all scores ≥ 0.85
// Wines are deduplicated — shared across dishes via separate pairing entries
function getDemoData(): AnalyzeResponse {
  return {
    dishes: [
      { id: "d1", name: "Grilled Lamb Rack", description: "Rosemary jus, roasted vegetables", category: "meat" },
      { id: "d2", name: "Pan-Seared Salmon", description: "Citrus beurre blanc, asparagus", category: "fish" },
      { id: "d3", name: "Wild Mushroom Risotto", description: "Truffle oil, aged parmesan", category: "vegetarian" },
      { id: "d4", name: "Beef Tenderloin", description: "Red wine reduction, potato gratin", category: "meat" },
      { id: "d5", name: "Lobster Thermidor", description: "Classic French preparation", category: "fish" },
    ],
    otherDishes: [
      { id: "d6", name: "Truffle Burrata", description: "Aged balsamic, micro herbs", category: "appetizer" },
      { id: "d7", name: "Seared Scallops", description: "Cauliflower puree, brown butter", category: "fish" },
    ],
    wines: [
      { id: "w1", name: "Chateau Margaux", type: "red", grape: "Cabernet Sauvignon blend", region: "Bordeaux", vintage: "2018" },
      { id: "w2", name: "Cloudy Bay Sauvignon Blanc", type: "white", grape: "Sauvignon Blanc", region: "Marlborough", vintage: "2022" },
      { id: "w3", name: "Barolo Riserva", type: "red", grape: "Nebbiolo", region: "Piedmont", vintage: "2016" },
      { id: "w4", name: "Chablis Premier Cru", type: "white", grape: "Chardonnay", region: "Burgundy", vintage: "2020" },
      { id: "w5", name: "Whispering Angel", type: "rosé", grape: "Grenache blend", region: "Provence", vintage: "2023" },
    ],
    pairings: [
      // d1 Lamb → w1 Margaux (top pick), w3 Barolo
      { dish_id: "d1", wine_id: "w1", score: 0.96, reason: "The structured tannins of Margaux embrace the lamb's richness while dark fruit echoes the rosemary.", detailed_reason: "Chateau Margaux's elegant structure provides the perfect counterpoint to grilled lamb. The wine's dark fruit — cassis, blackberry — mirrors the herbaceous rosemary jus, while its refined tannins cut through the meat's fat." },
      { dish_id: "d1", wine_id: "w3", score: 0.91, reason: "Barolo's firm tannins and earthy complexity complement the lamb's depth beautifully.", detailed_reason: "Nebbiolo's naturally high tannins and complex aromas of tar, roses, and dried herbs create a sophisticated pairing with grilled lamb. The wine's earthy undertones enhance the roasted vegetables." },
      // d2 Salmon → w2 Cloudy Bay (top pick), w4 Chablis
      { dish_id: "d2", wine_id: "w2", score: 0.94, reason: "Vibrant Sauvignon Blanc lifts the salmon with citrus that mirrors the beurre blanc.", detailed_reason: "Cloudy Bay's zesty citrus and herbaceous notes create a natural bridge to the citrus beurre blanc. The wine's crisp acidity cuts through the salmon's oils while tropical undertones complement the asparagus." },
      { dish_id: "d2", wine_id: "w4", score: 0.89, reason: "Chablis brings mineral elegance that enhances the salmon without overwhelming it.", detailed_reason: "Premier Cru Chablis with its flinty minerality provides an elegant backdrop for pan-seared salmon. Its subtle oak influence complements the beurre blanc while acidity keeps things fresh." },
      // d3 Risotto → w3 Barolo (shared with d1, top pick), w4 Chablis (shared with d2)
      { dish_id: "d3", wine_id: "w3", score: 0.93, reason: "Barolo's earthy, truffle-like character is a natural soulmate for mushroom risotto.", detailed_reason: "Nebbiolo's inherent earthiness — dried mushroom, truffle, forest floor — creates a spiritual connection with wild mushroom risotto. The wine's acidity cuts through the creaminess beautifully." },
      { dish_id: "d3", wine_id: "w4", score: 0.85, reason: "Chablis adds a refreshing counterpoint to the rich, creamy risotto.", detailed_reason: "The mineral-driven purity of Chablis provides a clean counterbalance to mushroom risotto's richness. Its acidity refreshes the palate after each creamy bite." },
      // d4 Beef → w1 Margaux (shared with d1, top pick), w3 Barolo (shared with d1/d3)
      { dish_id: "d4", wine_id: "w1", score: 0.97, reason: "Chateau Margaux and beef tenderloin — both embody refined power. A legendary pairing.", detailed_reason: "Beef tenderloin with red wine reduction is the ultimate Bordeaux-beef partnership. Margaux's velvety tannins and dark fruit create a harmonious dialogue with the tender beef." },
      { dish_id: "d4", wine_id: "w3", score: 0.90, reason: "Barolo's power and complexity stand up beautifully to the tenderloin's richness.", detailed_reason: "Barolo Riserva brings dried cherry, leather, and spice that elevate beef tenderloin. The wine's firm tannins provide structure for the red wine reduction." },
      // d5 Lobster → w4 Chablis (shared with d2/d3, top pick), w5 Whispering Angel
      { dish_id: "d5", wine_id: "w4", score: 0.92, reason: "Premier Cru Chablis has the weight and mineral depth to match lobster's sweetness.", detailed_reason: "Lobster Thermidor demands white wine with elegance and substance. Chablis Premier Cru delivers: mineral-laden palate complements the lobster's sweetness while crisp acidity cuts through the sauce." },
      { dish_id: "d5", wine_id: "w5", score: 0.88, reason: "Whispering Angel's delicate fruit and crisp acidity complement lobster's sweetness.", detailed_reason: "A premium Provence rosé brings subtle peach and citrus notes that enhance lobster without competing. The wine's Mediterranean character suits the rich Thermidor sauce beautifully." },
    ],
  };
}
