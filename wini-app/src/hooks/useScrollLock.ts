import { useEffect } from "react";

/** Prevents body scroll while `isOpen` is true. Restores on cleanup. */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prev = body.style.cssText;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";

    return () => {
      body.style.cssText = prev;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
}
