"use client";

import { useEffect } from "react";

export function useLenis() {
  useEffect(() => {
    let lenis: { destroy: () => void; raf: (time: number) => void } | null = null;
    let rafId: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}
