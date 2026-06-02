"use client";

import React, { useRef, useState, useEffect } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import Orb from "../components/Orb";
import PlanetScene from "../components/PlanetScene";

// ─── Feature data ─────────────────────────────────────────────────────────────
const TOOLS = [
  { name: "Competitor Intel", tag: "01", planet: "Mars", integration: "Meta Ads", desc: "Real-time ad library scraping, AI creative tagging, winning hook detection.", stats: ["AD LIBRARY // SYNCED", "CREATIVES // ANALYZED"] },
  { name: "Context Layer", tag: "02", planet: "Jupiter", integration: "Claude MCP", desc: "Native integration gives SpyCraft a reasoning layer that understands your stack.", stats: ["REASONING // ACTIVE", "CONTEXT // OMNI"] },
  { name: "CRM Intelligence", tag: "03", planet: "Saturn", integration: "HubSpot", desc: "Every contact, deal, and campaign flows into the context engine automatically.", stats: ["SIGNALS // LIVE", "DEALS // TRACKED"] },
  { name: "Creative AI", tag: "04", planet: "Neptune", integration: "Higgsfield", desc: "Generate production-ready video creatives in minutes from data-informed briefs.", stats: ["VIDEO // GEN 3", "RENDER // FAST"] },
  { name: "Any Tool", tag: "05", planet: "Earth", integration: "Much more..", desc: "Seamlessly plug into Figma, Notion, Slack, Shopify, and any tool your team uses.", stats: ["ECOSYSTEM // OPEN", "PLUGINS // 50+"] },
];

// ─── Section 3: Reference UI (Split Screen) ───────────────────────────────────
function Section3() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 5 tools, so segments of 0.2
    let idx = Math.floor(latest * 5);
    if (idx >= 5) idx = 4;
    if (idx !== active) setActive(idx);
  });

  return (
    <div id="section3" ref={containerRef} style={{ height: "300vh", position: "relative", background: "#05050f" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex" }}>

        {/* Subtle background glow */}
        <div style={{
          position: "absolute", top: "20%", right: "10%", width: "40vw", height: "40vw",
          background: "radial-gradient(circle, rgba(255,138,255,0.06) 0%, rgba(255,138,255,0.02) 40%, transparent 60%)",
          pointerEvents: "none", zIndex: 0
        }} />

        {/* Left Half: Text and Integration Info */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", paddingLeft: "10vw", zIndex: 2 }}>

          {/* Vertical Decor Text */}
          <div style={{ position: "absolute", left: "3vw", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "2rem", color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", letterSpacing: "0.4em", writingMode: "vertical-rl" }}>
            <span>I N T E L L I G E N C E</span>
            <span>L A Y E R</span>
          </div>

          <div style={{ maxWidth: "500px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${active}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <span style={{ padding: "6px 12px", background: "rgba(255,138,255,0.15)", borderRadius: 6, color: "#FF8AFF", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em" }}>
                    {TOOLS[active].tag}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    {TOOLS[active].integration}
                  </span>
                </div>

                <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
                  {TOOLS[active].name}
                </h2>

                <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, fontWeight: 300 }}>
                  {TOOLS[active].desc}
                </p>

                <div style={{ marginTop: 48, display: "flex", gap: 12 }}>
                  {TOOLS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: active === i ? 40 : 12, opacity: active === i ? 1 : 0.3 }}
                      style={{ height: 2, background: "#FF8AFF", borderRadius: 2 }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Half: Rotating Planet & Tech Lines */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <div style={{ position: "relative", width: "clamp(300px, 40vw, 600px)", aspectRatio: "1/1" }}>

            {/* Real 3D Planet Scene */}
            <div style={{ position: "absolute", inset: 0, transform: "scale(1.15)" }}>
              <PlanetScene activeIndex={active} />
            </div>

            {/* Tech callout line 1 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`callout1-${active}`}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", top: "15%", right: "-10%", height: 1, background: "rgba(255,138,255,0.4)", willChange: "width, opacity" }}
              >
                <span style={{ position: "absolute", right: 0, top: -20, fontSize: "0.6rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  {TOOLS[active].stats[0]}
                </span>
                <div style={{ position: "absolute", left: -30, top: 20, width: 1, height: 40, background: "rgba(255,138,255,0.4)", transform: "rotate(45deg)" }} />
              </motion.div>
            </AnimatePresence>

            {/* Tech callout line 2 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`callout2-${active}`}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 120, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{ position: "absolute", bottom: "25%", left: "-5%", height: 1, background: "rgba(255,138,255,0.4)", willChange: "width, opacity" }}
              >
                <span style={{ position: "absolute", left: 0, top: 10, fontSize: "0.6rem", color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  {TOOLS[active].stats[1]}
                </span>
                <div style={{ position: "absolute", right: -30, top: -20, width: 1, height: 40, background: "rgba(255,138,255,0.4)", transform: "rotate(45deg)" }} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Vertical Decor Text Right */}
          <div style={{ position: "absolute", right: "3vw", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "2rem", color: "rgba(255,255,255,0.1)", fontSize: "0.75rem", letterSpacing: "0.4em", writingMode: "vertical-rl" }}>
            <span>O R B I T A L</span>
            <span>{TOOLS[active].tag}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{ 
      position: "fixed", 
      top: 24, 
      left: "50%", 
      transform: "translateX(-50%)", 
      width: "calc(100% - 48px)", 
      maxWidth: 900, 
      zIndex: 100, 
      padding: "12px 24px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      background: "rgba(255, 255, 255, 0.03)", 
      backdropFilter: "blur(20px)", 
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)", 
      borderRadius: 100,
      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="6" fill="#6d28d9" />
          <rect x="5" y="7" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="5" y="12" width="11" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="5" y="17" width="7" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        </svg>
        <span style={{ color: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.025em" }}>SpyCraft</span>
      </div>
      
      <button 
        onClick={() => document.getElementById("section3")?.scrollIntoView({ behavior: "smooth" })}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", letterSpacing: "0.02em", fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      >
        Explore
      </button>
    </nav>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  const { scrollY } = useScroll();
  const orbScale = useTransform(scrollY, [0, 600], [1, 3]);
  const orbOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const orbY = useTransform(scrollY, [0, 600], [0, 300]);

  return (
    <div style={{ background: "#05050f", minHeight: "100vh", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Nav />

      {/* ── S1: Hero ── */}
      <section style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", position: "relative", overflow: "hidden" }}>

        {/* Orb Background */}
        <motion.div
          style={{
            position: "absolute",
            width: "100%",
            height: "800px",
            zIndex: 0,
            scale: orbScale,
            opacity: orbOpacity,
            y: orbY
          }}
        >
          <Orb
            hoverIntensity={0.5}
            rotateOnHover={true}
            hue={270}
            forceHoverState={false}
            backgroundColor="#05050f"
          />
        </motion.div>

        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(109,40,217,0.05) 0%, #05050f 80%)", pointerEvents: "none", zIndex: 1 }} />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 900, zIndex: 1 }}
        >
          SpyCraft is the<br />context layer.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          style={{ marginTop: 24, fontSize: "1.5rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em", zIndex: 1 }}
        >
          One intelligence. Every tool.
        </motion.p>
      </section>

      {/* ── S2: Transition ── */}
      <section style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.9)", maxWidth: 700 }}
        >
          At the center<br />of your stack.
        </motion.p>
      </section>

      {/* ── S3: Split Screen Reference UI ── */}
      <Section3 />



      {/* ── S5: Closing ── */}
      <section id="access" style={{ height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,138,255,0.2), transparent)" }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
        >
          <h2 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 800 }}>
            Built for the teams<br />that move fast.
          </h2>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", maxWidth: 500, lineHeight: 1.65 }}>
            SpyCraft connects your entire marketing stack into one living intelligence layer.
          </p>
        </motion.div>
      </section>

      {/* ── Massive Footer Text ── */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-end", paddingTop: "5vh" }}>

        {/* Glows */}
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(140,30,80,0.6) 0%, rgba(140,30,80,0.2) 40%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(30,50,150,0.6) 0%, rgba(30,50,150,0.2) 40%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Text Container with Edge Masking */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          zIndex: 1
        }}>
          <div style={{
            fontSize: "23vw",
            fontWeight: 700,
            lineHeight: 0.75,
            letterSpacing: "-0.04em",
            background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.01) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            userSelect: "none",
            paddingBottom: "15vh"
          }}>
            spycraft
          </div>
        </div>
      </div>

    </div>
  );
}
