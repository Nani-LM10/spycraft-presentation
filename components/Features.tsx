"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  {
    tag: "COMPETITOR INTEL",
    headline: "Track your competitors,\neffortlessly.",
    body: "See which hooks, formats, angles and 12 other attributes are working for brands in your space — updated daily, automatically.",
    bullets: [
      "Real-time Ad Library Scraper",
      "AI Creative Tagging",
      "Identify winning hooks",
    ],
    accent: "#6EE7FF",
    visual: <CompetitorVisual />,
  },
  {
    tag: "DISCOVER ADS",
    headline: "Search any ad,\nanytime, anywhere.",
    body: "Find any brand or creative and catch all trends quickly. Smart search with automatic transcription across the entire ad ecosystem.",
    bullets: [
      "Smart Search",
      "Automatic Transcription",
      "Catch trends before they peak",
    ],
    accent: "#7DD3FC",
    visual: <DiscoverVisual />,
  },
  {
    tag: "ANALYZE",
    headline: "Know what's working\nand why.",
    body: "See which hooks, formats, and messages are working and when creatives are fatiguing. Act before performance drops.",
    bullets: [
      "Detect Fatigue Instantly",
      "Build & Share Reports",
    ],
    accent: "#93C5FD",
    visual: <AnalyzeVisual />,
  },
  {
    tag: "BRIEFS",
    headline: "From concept to\nlaunch in minutes.",
    body: "Data-informed briefs and AI scripting that transforms performance signals into production-ready creative direction.",
    bullets: [
      "AI Scripting & Storyboarding",
      "Data-Informed Creative Direction",
    ],
    accent: "#6EE7FF",
    visual: <BriefVisual />,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="features" className="py-32 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mb-24"
        >
          <p
            className="text-xs tracking-widest uppercase mb-4"
            style={{ color: "rgba(110,231,255,0.6)" }}
          >
            Our Features
          </p>
          <h2
            className="font-semibold tracking-tight max-w-xl"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#F5F5F5",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Everything you need to crush your competitors.
          </h2>
        </motion.div>

        {/* Feature rows */}
        <div className="flex flex-col gap-px" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16 }}>
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.tag} feature={feature} index={i} reversed={i % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  feature,
  index,
  reversed,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  reversed: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`grid md:grid-cols-2 gap-0 overflow-hidden ${
        reversed ? "md:[direction:rtl]" : ""
      }`}
      style={{
        background: "rgba(4,4,4,0.7)",
        borderRadius: index === 0 ? "16px 16px 0 0" : index === 3 ? "0 0 16px 16px" : 0,
      }}
    >
      {/* Text side */}
      <div
        className="flex flex-col justify-center p-10 lg:p-16"
        style={{ direction: "ltr" }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-5"
          style={{ color: feature.accent, opacity: 0.8 }}
        >
          {feature.tag}
        </p>
        <h3
          className="font-semibold tracking-tight mb-5 whitespace-pre-line"
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            color: "#F5F5F5",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
        >
          {feature.headline}
        </h3>
        <p
          className="leading-relaxed mb-8 max-w-sm"
          style={{ color: "rgba(245,245,245,0.45)", fontSize: "0.95rem" }}
        >
          {feature.body}
        </p>
        <ul className="flex flex-col gap-2.5 mb-10">
          {feature.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(245,245,245,0.7)" }}>
              <span
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: feature.accent }}
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <a
            href="#trial"
            className="text-sm px-4 py-2 rounded-md font-medium transition-all duration-200"
            style={{ background: feature.accent, color: "#040404" }}
          >
            Start free trial
          </a>
          <a
            href="#demo"
            className="text-sm px-4 py-2 rounded-md transition-all duration-200"
            style={{
              color: "rgba(245,245,245,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Book a demo
          </a>
        </div>
      </div>

      {/* Visual side */}
      <div
        className="relative flex items-center justify-center p-8 min-h-72 md:min-h-0"
        style={{
          direction: "ltr",
          borderLeft: reversed ? "none" : "1px solid rgba(255,255,255,0.04)",
          borderRight: reversed ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}
      >
        {feature.visual}
      </div>
    </motion.div>
  );
}

// ─── Feature Visuals ──────────────────────────────────────────────────────────

function CompetitorVisual() {
  const brands = [
    { name: "Nike", hooks: ["emotion", "performance", "lifestyle"], score: 94 },
    { name: "Adidas", hooks: ["sport", "culture"], score: 87 },
    { name: "Puma", hooks: ["speed", "style"], score: 72 },
  ];
  return (
    <div className="w-full max-w-sm space-y-2">
      {brands.map((brand, i) => (
        <motion.div
          key={brand.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 + 0.3, duration: 0.6 }}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(110,231,255,0.08)", color: "#6EE7FF" }}
          >
            {brand.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "#F5F5F5" }}>
                {brand.name}
              </span>
              <span className="text-xs" style={{ color: "rgba(110,231,255,0.8)" }}>
                {brand.score}
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {brand.hooks.map((h) => (
                <span
                  key={h}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(110,231,255,0.06)",
                    color: "rgba(110,231,255,0.6)",
                    fontSize: "0.65rem",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
      <div
        className="text-center text-xs mt-3 py-2 rounded-md"
        style={{
          color: "rgba(110,231,255,0.4)",
          border: "1px dashed rgba(110,231,255,0.1)",
        }}
      >
        +247 competitors tracked
      </div>
    </div>
  );
}

function DiscoverVisual() {
  const results = [
    { brand: "Glossier", type: "Video", hook: "UGC testimonial", age: "2d" },
    { brand: "Rare Beauty", type: "Static", hook: "Product close-up", age: "3d" },
    { brand: "Fenty", type: "Carousel", hook: "Before/after", age: "1d" },
  ];
  return (
    <div className="w-full max-w-sm">
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,245,245,0.3)"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="text-sm" style={{ color: "rgba(245,245,245,0.3)" }}>
          Search any brand or ad…
        </span>
      </div>
      <div className="space-y-2">
        {results.map((r, i) => (
          <motion.div
            key={r.brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.4, duration: 0.5 }}
            className="flex items-center gap-3 p-2.5 rounded-md"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="w-10 h-10 rounded-md flex-shrink-0"
              style={{ background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.1)" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "#F5F5F5" }}>
                  {r.brand}
                </span>
                <span className="text-xs" style={{ color: "rgba(245,245,245,0.3)" }}>
                  {r.age}
                </span>
              </div>
              <span className="text-xs" style={{ color: "rgba(125,211,252,0.6)" }}>
                {r.hook}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnalyzeVisual() {
  const creatives = [
    { name: "Hook v3", score: 89, trend: "up", fatigue: 12 },
    { name: "Hook v7", score: 76, trend: "flat", fatigue: 45 },
    { name: "Hook v1", score: 41, trend: "down", fatigue: 88 },
  ];
  const trendColors: Record<string, string> = { up: "#6EE7FF", flat: "#7DD3FC", down: "#ef4444" };
  return (
    <div className="w-full max-w-sm space-y-2.5">
      {creatives.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12 + 0.3, duration: 0.6 }}
          className="p-3 rounded-lg"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "#F5F5F5" }}>
              {c.name}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: trendColors[c.trend] }}
            >
              {c.score}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.score}%` }}
                transition={{ delay: i * 0.12 + 0.5, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ background: trendColors[c.trend] }}
              />
            </div>
            <span
              className="text-xs flex-shrink-0"
              style={{
                color: c.fatigue > 70 ? "#ef4444" : "rgba(245,245,245,0.3)",
                fontSize: "0.65rem",
              }}
            >
              {c.fatigue}% fatigue
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BriefVisual() {
  return (
    <div className="w-full max-w-sm">
      <div
        className="p-4 rounded-lg"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#6EE7FF" }}
          />
          <span className="text-xs tracking-wide" style={{ color: "rgba(110,231,255,0.7)" }}>
            Generating brief
          </span>
        </div>
        {[
          { label: "Hook", value: "Problem agitation" },
          { label: "Format", value: "15s vertical video" },
          { label: "Angle", value: "Before/after transformation" },
          { label: "CTA", value: "Shop now — limited drop" },
        ].map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 + 0.3 }}
            className="flex items-start gap-3 py-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span
              className="text-xs w-16 flex-shrink-0 pt-0.5"
              style={{ color: "rgba(245,245,245,0.35)" }}
            >
              {row.label}
            </span>
            <span className="text-xs" style={{ color: "rgba(245,245,245,0.75)" }}>
              {row.value}
            </span>
          </motion.div>
        ))}
        <div className="mt-4 text-center">
          <span
            className="text-xs px-3 py-1.5 rounded-md"
            style={{ background: "rgba(110,231,255,0.08)", color: "#6EE7FF" }}
          >
            Ready to export
          </span>
        </div>
      </div>
    </div>
  );
}
