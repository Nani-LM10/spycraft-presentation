"use client";

import { useLenis } from "@/lib/useLenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useLenis();
  return <>{children}</>;
}
