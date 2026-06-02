"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";

const NetworkScene = dynamic(() => import("./NetworkScene"), { ssr: false });

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="relative py-40 px-6 overflow-hidden">
      {/* Subtle network background */}
      <div
        className="absolute inset-0"
        style={{ opacity: 0.3 }}
      >
        <NetworkScene />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, #040404 85%)",
          }}
        />
      </div>

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(110,231,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center" style={{ zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h2
            className="font-semibold tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
            }}
          >
            Supercharge Your
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6EE7FF 0%, #93C5FD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Creative Game.
            </span>
          </h2>
          <p
            className="text-base mb-10 max-w-md mx-auto"
            style={{ color: "rgba(245,245,245,0.45)" }}
          >
            Track every ad. Tag performance patterns. Get creatives grounded in
            real data, not guesswork.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#trial"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{ background: "#6EE7FF", color: "#040404" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#a5f0ff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#6EE7FF"; }}
            >
              Get started. It&apos;s Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M7 3l4 4-4 4" />
              </svg>
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                color: "rgba(245,245,245,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.7)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              Book a Demo
            </a>
          </div>
          <p
            className="mt-5 text-xs"
            style={{ color: "rgba(245,245,245,0.25)" }}
          >
            No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
