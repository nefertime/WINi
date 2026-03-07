"use client";

import { useEffect } from "react";
import { BOTTLES } from "@/lib/bottles";

/**
 * Preload bottle images for snappy carousel transitions.
 * First 4 bottles load immediately (visible on home), rest via requestIdleCallback.
 */
export function useBottlePreload() {
  useEffect(() => {
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };

    // Preload first 4 immediately (above the fold)
    const immediate = BOTTLES.slice(0, 4);
    for (const bottle of immediate) {
      preload(bottle.src);
    }

    // Preload remaining in idle time
    const remaining = BOTTLES.slice(4);
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(
        () => {
          for (const bottle of remaining) {
            preload(bottle.src);
          }
        },
        { timeout: 5000 }
      );
      return () => cancelIdleCallback(id);
    } else {
      // Fallback: preload after a short delay
      const timer = setTimeout(() => {
        for (const bottle of remaining) {
          preload(bottle.src);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);
}
