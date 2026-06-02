"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "Craft changed how we approach creative testing. We used to spend hours manually checking which ads were dying. Now it just tells us — and offers to fix it. That time goes back to strategy.",
    name: "Sarah K.",
    role: "Head of Paid Media",
    company: "Performance Agency",
  },
  {
    quote:
      "The competitor intelligence feature alone is worth it. We see what's working for brands in our space and brief creatives with actual data. No more guessing what hook to test next.",
    name: "James M.",
    role: "CMO",
    company: "DTC Consumer Brand",
  },
  {
    quote:
      "I manage 12 accounts. Craft is like having a creative director watching every single one 24/7. Fatigue alerts before clients notice, generation ready, launch without leaving the platform.",
    name: "Lena P.",
    role: "Media Buyer",
    company: "Independent Agency",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(110,231,255,0.6)" }}>
            What teams are saying
          </p>
          <h2
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
            }}
          >
            Real teams. Real results.
          </h2>
          <p className="mt-3 text-sm" style={{ color: "rgba(245,245,245,0.4)" }}>
            From agency media buyers to in-house brand teams.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + i * 0.12,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="flex flex-col p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="12" height="12" viewBox="0 0 12 12" fill="#6EE7FF">
                    <path d="M6 1l1.236 2.504L10 3.927l-2 1.95.472 2.75L6 7.254 3.528 8.627 4 5.878l-2-1.95 2.764-.423z" />
                  </svg>
                ))}
              </div>

              <blockquote
                className="flex-1 text-sm leading-relaxed mb-8"
                style={{ color: "rgba(245,245,245,0.6)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: "rgba(110,231,255,0.1)",
                    color: "#6EE7FF",
                    border: "1px solid rgba(110,231,255,0.15)",
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#F5F5F5" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(245,245,245,0.35)" }}>
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
