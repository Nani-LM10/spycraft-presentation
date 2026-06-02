"use client";

import { useEffect, useRef } from "react";

export function useMousePosition() {
  const position = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      position.current.x = e.clientX;
      position.current.y = e.clientY;
      position.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      position.current.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return position;
}
