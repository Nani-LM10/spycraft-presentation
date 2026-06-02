"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is SpyCraft?",
    a: "SpyCraft is an AI-powered creative intelligence platform that helps performance marketers track competitor ads, detect creative fatigue, and generate data-informed ad creatives — all in one place.",
  },
  {
    q: "Does SpyCraft make the ads for me?",
    a: "Yes. SpyCraft uses performance signals, competitor data, and creative patterns to generate production-ready scripts, storyboards, and briefs. You go from insight to launch without starting from scratch.",
  },
  {
    q: "Where does the competitor data come from?",
    a: "We scrape real-time data from major ad libraries including Meta, TikTok, and Google. All data is publicly available and refreshed daily.",
  },
  {
    q: "What does 14 axis tagging actually mean?",
    a: "Every ad is automatically analysed across 14 creative dimensions — hook type, format, visual style, emotion, CTA, messaging angle, and more — then correlated to ROAS so you know which attributes actually drive performance.",
  },
  {
    q: "What is the Winner Score?",
    a: "Winner Score is our proprietary signal that combines engagement rate, longevity, and performance data to rank creatives from 0–100. High scores mean it's working; watch creatives trend downward to catch fatigue early.",
  },
  {
    q: "How does fatigue detection work?",
    a: "Our model monitors frequency, CTR trends, and engagement decay to flag creatives heading toward burnout — before your CPA spikes. You get an alert and a suggestion for what to test next.",
  },
  {
    q: "Is my account data safe?",
    a: "Yes. We use read-only API connections, SOC 2-aligned security practices, and never share your data with third parties. Your performance data is yours.",
  },
  {
    q: "How is this different from a swipe file tool?",
    a: "Swipe files are static. SpyCraft is live intelligence — real-time tracking, AI analysis, fatigue detection, and generation all connected. It's not inspiration; it's infrastructure.",
  },
  {
    q: "Can I use SpyCraft inside Claude?",
    a: "Yes — SpyCraft has an MCP (Model Context Protocol) integration, which means you can access your competitive intelligence and creative data directly inside Claude and other AI tools.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span
          className="text-sm font-medium"
          style={{ color: open ? "#F5F5F5" : "rgba(245,245,245,0.7)" }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
          style={{
            background: open ? "rgba(110,231,255,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${open ? "rgba(110,231,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            color: open ? "#6EE7FF" : "rgba(245,245,245,0.4)",
            fontSize: "1.1rem",
            lineHeight: 1,
          }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="pb-5 text-sm leading-relaxed"
              style={{ color: "rgba(245,245,245,0.45)" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? FAQS : FAQS.slice(0, 5);

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(110,231,255,0.6)" }}>
            FAQs
          </p>
          <h2
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
            }}
          >
            Got Questions?
          </h2>
          <p className="mt-3 text-sm" style={{ color: "rgba(245,245,245,0.4)" }}>
            We have got answers.
          </p>
        </motion.div>

        <div>
          {visible.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        {!showAll && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm px-5 py-2.5 rounded-md transition-all duration-200"
              style={{
                color: "rgba(245,245,245,0.5)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.5)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
