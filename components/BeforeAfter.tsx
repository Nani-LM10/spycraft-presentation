"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const BEFORE = [
  "Tagging creatives in spreadsheets, by hand",
  "Checking competitor ads weekly, ad-by-ad",
  "Discovering fatigue after CPA already spiked",
  "Designers burning hours on variations that flop",
  "Guessing what to make next",
];

const AFTER = [
  "Every ad auto-tagged across 9 dimensions, correlated to ROAS",
  "Competitor ads tracked and analysed daily, automatically",
  "Fatigue detected before performance drops",
  "Variations generated from proven signals, not guesswork",
  "Production-ready creatives in minutes, not days",
];

export default function BeforeAfter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <h2
            className="font-semibold tracking-tight mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
            }}
          >
            Your unfair advantage for ad creative.
          </h2>
          <p
            className="max-w-lg mx-auto text-base"
            style={{ color: "rgba(245,245,245,0.45)" }}
          >
            Stop starting from scratch every time. See what&apos;s working, know
            what&apos;s fading, and generate your next best ads — all in one
            place.
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-px overflow-hidden rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="p-10 lg:p-14"
            style={{ background: "rgba(4,4,4,0.8)" }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2l6 6M8 2l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: "rgba(245,245,245,0.5)" }}>
                Before Adden
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: "rgba(239,68,68,0.5)" }}>
              Manual everything. Performance after the fact.
            </p>
            <ul className="space-y-4">
              {BEFORE.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "rgba(245,245,245,0.4)" }}
                >
                  <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "rgba(239,68,68,0.4)" }} />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="p-10 lg:p-14"
            style={{ background: "rgba(8,16,20,0.9)" }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(110,231,255,0.1)", border: "1px solid rgba(110,231,255,0.2)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke="#6EE7FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: "rgba(110,231,255,0.8)" }}>
                After ADden
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider mb-6" style={{ color: "rgba(110,231,255,0.5)" }}>
              A system that learns. Creatives that compound.
            </p>
            <ul className="space-y-4">
              {AFTER.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.35 + i * 0.1, duration: 0.6 }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "rgba(245,245,245,0.7)" }}
                >
                  <span className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background: "#6EE7FF", boxShadow: "0 0 6px rgba(110,231,255,0.5)" }} />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
