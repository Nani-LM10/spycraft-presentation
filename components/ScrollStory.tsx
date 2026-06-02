"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sceneState, TOTAL_SECTIONS } from "@/lib/sceneState";

// ─── Section data ─────────────────────────────────────────────────────────────

const PLANET_COLORS: Record<string, string> = {
  "Claude MCP": "#E8D5A3",
  HubSpot: "#FF8060",
  Clying: "#6EE7FF",
  "Meta Ads": "#5B9EF5",
};

type Section =
  | { type: "hero" }
  | { type: "context" }
  | { type: "solar" }
  | { type: "planet"; planet: string; tagline: string; description: string }
  | { type: "cta" };

const SECTIONS: Section[] = [
  { type: "hero" },
  { type: "context" },
  { type: "solar" },
  {
    type: "planet",
    planet: "Claude MCP",
    tagline: "AI reasoning, in context.",
    description:
      "Native integration with Claude gives SpyCraft a reasoning layer that understands your entire marketing stack. Ask anything. Get answers grounded in your actual data.",
  },
  {
    type: "planet",
    planet: "HubSpot",
    tagline: "CRM intelligence, unified.",
    description:
      "Every contact, deal, and campaign flows into SpyCraft's context engine. CRM signals become creative intelligence — automatically.",
  },
  {
    type: "planet",
    planet: "Clying",
    tagline: "Creative signals, connected.",
    description:
      "Performance data from your creatives feeds directly into SpyCraft. What's working, what's fading — surfaced before you have to ask.",
  },
  {
    type: "planet",
    planet: "Meta Ads",
    tagline: "Ad intelligence, live.",
    description:
      "Real-time signals from Meta's ad ecosystem, flowing into SpyCraft's context layer. Competitor moves. Fatigue patterns. Market signals.",
  },
  { type: "cta" },
];

// ─── Framer variants ──────────────────────────────────────────────────────────

const fadeVariants = {
  initial: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(8px)",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const child = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Section content ──────────────────────────────────────────────────────────

function HeroContent() {
  return (
    <motion.div
      key="hero"
      variants={stagger}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center text-center max-w-2xl px-6"
    >
      <motion.div variants={child} className="flex items-center gap-2 mb-8">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "#FF8030" }}
        />
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(255,180,80,0.7)" }}
        >
          SpyCraft
        </span>
      </motion.div>

      <motion.h1
        variants={child}
        style={{
          fontSize: "clamp(3.2rem, 9vw, 7rem)",
          fontWeight: 600,
          color: "#F5F5F5",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          marginBottom: "1.5rem",
        }}
      >
        The context
        <br />
        <span
          style={{
            background:
              "linear-gradient(135deg, #FFB060 0%, #FF6020 60%, #FF3000 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          layer.
        </span>
      </motion.h1>

      <motion.p
        variants={child}
        style={{
          color: "rgba(245,245,245,0.45)",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
          maxWidth: 420,
        }}
      >
        Every signal. Every tool.
        <br />
        One intelligence.
      </motion.p>

      <motion.div
        variants={child}
        className="flex items-center gap-3"
        style={{ pointerEvents: "all" }}
      >
        <a
          href="#trial"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200"
          style={{ background: "#FF8030", color: "#040404" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FFB060";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FF8030";
          }}
        >
          Get started
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </a>
        <a
          href="#demo"
          className="inline-flex items-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200"
          style={{
            color: "rgba(245,245,245,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            pointerEvents: "all",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(245,245,245,0.6)";
          }}
        >
          See how it works
        </a>
      </motion.div>
    </motion.div>
  );
}

function ContextContent() {
  return (
    <motion.div
      key="context"
      variants={stagger}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-lg px-6"
      style={{ alignSelf: "flex-end", marginBottom: "12vh", marginLeft: "8vw" }}
    >
      <motion.p
        variants={child}
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: "rgba(255,140,60,0.6)" }}
      >
        Context layer
      </motion.p>
      <motion.h2
        variants={child}
        style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          fontWeight: 600,
          color: "#F5F5F5",
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
        }}
      >
        Not another tool.
      </motion.h2>
      <motion.p
        variants={child}
        style={{
          color: "rgba(245,245,245,0.45)",
          fontSize: "1rem",
          lineHeight: 1.7,
          maxWidth: 380,
        }}
      >
        SpyCraft sits beneath your entire stack — connecting, contextualizing,
        and amplifying every signal across every platform you use.
      </motion.p>
    </motion.div>
  );
}

function SolarContent() {
  return (
    <motion.div
      key="solar"
      variants={stagger}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-lg px-6"
      style={{ alignSelf: "flex-start", marginTop: "8vh", marginLeft: "8vw" }}
    >
      <motion.p
        variants={child}
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: "rgba(255,140,60,0.6)" }}
      >
        The system
      </motion.p>
      <motion.h2
        variants={child}
        style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          fontWeight: 600,
          color: "#F5F5F5",
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
          marginBottom: "1.25rem",
        }}
      >
        Your entire stack,
        <br />
        in orbit.
      </motion.h2>
      <motion.p
        variants={child}
        style={{
          color: "rgba(245,245,245,0.45)",
          fontSize: "1rem",
          lineHeight: 1.7,
          maxWidth: 340,
        }}
      >
        Every tool feeds SpyCraft. SpyCraft illuminates everything.
      </motion.p>
    </motion.div>
  );
}

function PlanetContent({
  planet,
  tagline,
  description,
}: {
  planet: string;
  tagline: string;
  description: string;
}) {
  const color = PLANET_COLORS[planet] ?? "#6EE7FF";

  return (
    <motion.div
      key={`planet-${planet}`}
      variants={stagger}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-sm px-6"
      style={{ marginLeft: "8vw" }}
    >
      <motion.div variants={child} className="flex items-center gap-2 mb-5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(245,245,245,0.35)" }}
        >
          Orbiting SpyCraft
        </span>
      </motion.div>

      <motion.h2
        variants={child}
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 600,
          color,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: "0.75rem",
        }}
      >
        {planet}
      </motion.h2>

      <motion.p
        variants={child}
        style={{
          fontSize: "1.05rem",
          color: "#F5F5F5",
          marginBottom: "1rem",
          fontWeight: 500,
        }}
      >
        {tagline}
      </motion.p>

      <motion.p
        variants={child}
        style={{
          color: "rgba(245,245,245,0.4)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          maxWidth: 300,
        }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

function CTAContent() {
  return (
    <motion.div
      key="cta"
      variants={stagger}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center text-center max-w-2xl px-6"
    >
      <motion.h2
        variants={child}
        style={{
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: 600,
          color: "#F5F5F5",
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          marginBottom: "1.5rem",
        }}
      >
        Bring your stack
        <br />
        <span
          style={{
            background:
              "linear-gradient(135deg, #FFB060 0%, #FF6020 60%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          into orbit.
        </span>
      </motion.h2>

      <motion.p
        variants={child}
        style={{
          color: "rgba(245,245,245,0.4)",
          fontSize: "1.05rem",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
          maxWidth: 380,
        }}
      >
        SpyCraft connects every tool, every signal, every insight — into one
        intelligence layer.
      </motion.p>

      <motion.div
        variants={child}
        className="flex items-center gap-3"
        style={{ pointerEvents: "all" }}
      >
        <a
          href="#trial"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-medium transition-all duration-200"
          style={{ background: "#FF8030", color: "#040404" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FFB060";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#FF8030";
          }}
        >
          Get started — it&apos;s free
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </a>
        <a
          href="#demo"
          className="inline-flex items-center px-7 py-3.5 rounded-md text-sm font-medium transition-all duration-200"
          style={{
            color: "rgba(245,245,245,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLElement).style.color = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(245,245,245,0.6)";
          }}
        >
          Book a demo
        </a>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScrollStory() {
  const [currentSection, setCurrentSection] = useState(0);
  const snapTimeout = useRef<ReturnType<typeof setTimeout>>(null!);

  const goTo = useCallback((index: number) => {
    window.scrollTo({ top: index * window.innerHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const winH = window.innerHeight;
      const scrollY = window.scrollY;
      const raw = scrollY / winH;
      const sec = Math.max(0, Math.min(Math.round(raw), TOTAL_SECTIONS - 1));

      sceneState.section = raw;
      setCurrentSection(sec);

      // Debounced snap
      clearTimeout(snapTimeout.current);
      snapTimeout.current = setTimeout(() => {
        const nearest = Math.round(scrollY / winH) * winH;
        if (Math.abs(scrollY - nearest) > 4) {
          window.scrollTo({ top: nearest, behavior: "smooth" });
        }
      }, 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimeout.current);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo(Math.min(currentSection + 1, TOTAL_SECTIONS - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(Math.max(currentSection - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSection, goTo]);

  const section = SECTIONS[currentSection];

  return (
    <>
      {/* Scroll height container */}
      <div
        style={{
          height: `${TOTAL_SECTIONS * 100}vh`,
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, rgba(4,4,4,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems:
            section.type === "hero" || section.type === "cta"
              ? "center"
              : "flex-start",
          justifyContent:
            section.type === "context"
              ? "flex-end"
              : section.type === "solar"
              ? "flex-start"
              : "center",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="wait">
          {section.type === "hero" && <HeroContent key="hero" />}
          {section.type === "context" && <ContextContent key="context" />}
          {section.type === "solar" && <SolarContent key="solar" />}
          {section.type === "planet" && (
            <PlanetContent
              key={section.planet}
              planet={section.planet}
              tagline={section.tagline}
              description={section.description}
            />
          )}
          {section.type === "cta" && <CTAContent key="cta" />}
        </AnimatePresence>
      </div>

      {/* Section progress dots */}
      <div
        style={{
          position: "fixed",
          right: 28,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "all",
        }}
      >
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === currentSection ? 6 : 4,
              height: i === currentSection ? 6 : 4,
              borderRadius: "50%",
              background:
                i === currentSection
                  ? "#FF8030"
                  : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
              margin: "0 auto",
              display: "block",
            }}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint — only on hero */}
      <AnimatePresence>
        {currentSection === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 1 }}
            style={{
              position: "fixed",
              bottom: 36,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(245,245,245,0.2)",
              }}
            >
              Scroll
            </span>
            <div
              style={{
                width: 1,
                height: 48,
                background:
                  "linear-gradient(to bottom, rgba(255,128,48,0.4), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
