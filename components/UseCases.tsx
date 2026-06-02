"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const CASES = [
  {
    label: "Agencies",
    headline: "Deliver better results for clients with faster creative production.",
    bullets: [
      "Generate high-performing creatives with SpyCraft",
      "Manage multiple client campaigns efficiently",
      "Present clear, insight-driven reports",
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    label: "DTC Brands",
    headline: "Scale your brand with consistent creative testing.",
    bullets: [
      "Test creatives at scale with SpyCraft",
      "Understand what drives conversions",
      "Scale winning campaigns confidently",
    ],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
        <circle cx="9" cy="19" r="2" />
        <circle cx="20" cy="19" r="2" />
      </svg>
    ),
  },
];

const OUTCOME_STATS = [
  { value: "4X", label: "Faster Iteration" },
  { value: "20+", label: "Hours saved" },
  { value: "80%", label: "Faster insights" },
];

export default function UseCases() {
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
          className="mb-16"
        >
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(110,231,255,0.6)" }}>
            Usecases
          </p>
          <h2
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
            }}
          >
            Built for modern marketing teams.
          </h2>
        </motion.div>

        {/* Use case cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-20">
          {CASES.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                style={{
                  background: "rgba(110,231,255,0.07)",
                  color: "#6EE7FF",
                  border: "1px solid rgba(110,231,255,0.12)",
                }}
              >
                {c.icon}
              </div>
              <h3
                className="font-semibold mb-2 text-lg"
                style={{ color: "#F5F5F5", letterSpacing: "-0.02em" }}
              >
                {c.label}
              </h3>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "rgba(245,245,245,0.45)" }}
              >
                {c.headline}
              </p>
              <ul className="space-y-2.5">
                {c.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 text-sm"
                    style={{ color: "rgba(245,245,245,0.65)" }}
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: "#6EE7FF", opacity: 0.7 }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Outcome stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p
            className="text-xs tracking-widest uppercase mb-8 text-center"
            style={{ color: "rgba(245,245,245,0.3)" }}
          >
            The Result
          </p>
          <p
            className="text-center text-sm mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(245,245,245,0.45)" }}
          >
            Marketers saved hours every week by cutting analysis time, acting
            faster, improving creative performance, and scaling without growing
            their team.
          </p>
          <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            {OUTCOME_STATS.map((s) => (
              <div
                key={s.value}
                className="flex flex-col items-center py-10"
                style={{ background: "rgba(4,4,4,0.7)" }}
              >
                <span
                  className="font-semibold mb-1"
                  style={{
                    fontSize: "2.5rem",
                    color: "#6EE7FF",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.value}
                </span>
                <span
                  className="text-xs text-center"
                  style={{ color: "rgba(245,245,245,0.4)" }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
