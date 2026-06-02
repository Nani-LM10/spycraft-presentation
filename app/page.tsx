"use client";

import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// ─── JSX types ───────────────────────────────────────────────────────────────
declare module "@react-three/fiber" {
  interface ThreeElements { fluidMaterial: any; }
}

// ─── Fluid Shader ─────────────────────────────────────────────────────────────
const FluidMaterial = shaderMaterial(
  { uTime: 0, uMouse: new THREE.Vector2(0, 0), uColorA: new THREE.Color("#8A2BE2"), uColorB: new THREE.Color("#4B0082") },
  `uniform float uTime;uniform vec2 uMouse;varying vec3 vNormal;
   vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
   vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
   vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
   vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
   float snoise(vec3 v){
     const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
     vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
     vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
     vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
     vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
     i=mod289(i);
     vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
     float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
     vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
     vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
     vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
     vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
     vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
     vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
     vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
     p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
     vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
     return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
   void main(){vNormal=normalize(normalMatrix*normal);
     float mouseDist=distance(position.xy,uMouse*2.);
     float displacement=snoise(position*2.5+uTime*0.2)*0.3;
     displacement-=smoothstep(0.,1.5,mouseDist)*0.5;
     vec3 newPosition=position+normal*displacement;
     gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);}`,
  `uniform vec3 uColorA;uniform vec3 uColorB;varying vec3 vNormal;
   void main(){float fresnel=pow(1.+dot(vNormal,vec3(0.,0.,1.)),2.);
     vec3 color=mix(uColorA,uColorB,vNormal.y*.5+.5);
     gl_FragColor=vec4(color+fresnel*.2,1.);}`
);
extend({ FluidMaterial });

// ─── Fluid Orb ────────────────────────────────────────────────────────────────
function FluidOrb({ scale = 1 }: { scale?: number }) {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  useFrame(({ clock }) => {
    if (matRef.current) { matRef.current.uTime = clock.getElapsedTime(); matRef.current.uMouse.lerp(mouse.current, 0.05); }
    if (meshRef.current) meshRef.current.scale.setScalar(scale);
  });
  const cA = useMemo(() => new THREE.Color("#8A2BE2"), []);
  const cB = useMemo(() => new THREE.Color("#4B0082"), []);
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 64]} />
      <fluidMaterial ref={matRef} key={FluidMaterial.key} uColorA={cA} uColorB={cB} blending={THREE.AdditiveBlending} transparent />
    </mesh>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ opacity = 1 }: { opacity?: number }) {
  const mat = useMemo(() => new THREE.PointsMaterial({ color: "#ffffff", size: 0.055, transparent: true, opacity }), [opacity]);
  const geo = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) { p[i*3]=(Math.random()-.5)*60; p[i*3+1]=(Math.random()-.5)*60; p[i*3+2]=(Math.random()-.5)*60; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  return <points geometry={geo} material={mat} />;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  { name: "Competitor Intel", desc: "Real-time ad library scraping, AI creative tagging, winning hook detection.", tag: "01" },
  { name: "Discover Ads",     desc: "Smart search, automatic transcription, catch trends before they peak.",       tag: "02" },
  { name: "Analyze",          desc: "Detect fatigue instantly, see which hooks and formats are working and why.",  tag: "03" },
  { name: "Briefs",           desc: "AI scripting and storyboarding, data-informed creative direction.",           tag: "04" },
  { name: "Craft",            desc: "Generate production-ready creatives in minutes from proven performance signals.", tag: "05" },
];

// ─── Section 3: Solar System with sticky scroll focus ─────────────────────────
function Section3({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => {
      const vh = container.clientHeight;
      // Section 3 starts at 2×vh (after sections 1+2), spans 6×vh (600vh)
      const rel = container.scrollTop - vh * 2;
      const progress = Math.max(0, Math.min(1, rel / (vh * 6)));
      setActive(Math.min(Math.floor(progress * 5.4), 4));
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, [containerRef]);

  return (
    <div ref={outerRef} style={{ height: "600vh", position: "relative" }}>
      {/* ── Sticky viewport ── */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Glassmorphism backdrop */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(4,4,14,0.55)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }} />

        {/* Thin top border line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,138,255,0.15), transparent)" }} />

        {/* Content grid */}
        <div style={{
          position: "relative", zIndex: 1,
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          padding: "0 clamp(32px, 6vw, 96px)",
          gap: "clamp(32px, 5vw, 80px)",
        }}>

          {/* ── Left: Text ── */}
          <div>
            {/* Section label */}
            <p style={{ color: "rgba(255,138,255,0.38)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>
              SpyCraft Intelligence Layer
            </p>

            {/* Counter */}
            <p style={{ fontVariantNumeric: "tabular-nums", fontSize: "0.82rem", color: "rgba(255,138,255,0.35)", marginBottom: 18, letterSpacing: "0.1em" }}>
              {TOOLS[active].tag} / 05
            </p>

            {/* Animated tool name + desc */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              >
                <h2 style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.9rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#FF8AFF",
                  lineHeight: 1.05,
                  marginBottom: 20,
                }}>
                  {TOOLS[active].name}
                </h2>
                <p style={{
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  color: "rgba(255,138,255,0.52)",
                  lineHeight: 1.7,
                  maxWidth: 390,
                }}>
                  {TOOLS[active].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress pills */}
            <div style={{ display: "flex", gap: 8, marginTop: 44, alignItems: "center" }}>
              {TOOLS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: active === i ? 36 : 7,
                    opacity: active === i ? 1 : 0.28,
                    background: active === i ? "#FF8AFF" : "rgba(255,138,255,0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  style={{ height: 6, borderRadius: 3 }}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Solar Diagram ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 360, height: 360 }}>

              {/* Orbit ring */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 360 360">
                <circle cx="180" cy="180" r="148" fill="none" stroke="rgba(255,138,255,0.08)" strokeWidth="1" strokeDasharray="4 7" />
              </svg>

              {/* Sun */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 22, height: 22, borderRadius: "50%",
                background: "radial-gradient(circle, #FF8AFF 0%, #a855f7 55%, transparent 100%)",
                boxShadow: "0 0 32px 10px rgba(255,138,255,0.35)",
              }} />

              {/* Planet dots */}
              {TOOLS.map((tool, i) => {
                const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
                const r = 148;
                const cx = 180 + Math.cos(angle) * r;
                const cy = 180 + Math.sin(angle) * r;
                const isActive = active === i;

                return (
                  <motion.div
                    key={tool.name}
                    animate={{
                      width: isActive ? 22 : 9,
                      height: isActive ? 22 : 9,
                      opacity: active === i ? 1 : 0.28,
                      boxShadow: isActive
                        ? ["0 0 0 0 rgba(255,138,255,0.9)", "0 0 0 16px rgba(255,138,255,0)", "0 0 0 0 rgba(255,138,255,0)"]
                        : "0 0 5px 2px rgba(255,138,255,0.18)",
                      background: isActive
                        ? "radial-gradient(circle, #ffe0ff, #FF8AFF)"
                        : "rgba(255,138,255,0.55)",
                    }}
                    transition={{
                      width:  { type: "spring", stiffness: 220, damping: 22 },
                      height: { type: "spring", stiffness: 220, damping: 22 },
                      opacity: { duration: 0.4 },
                      boxShadow: isActive
                        ? { repeat: Infinity, duration: 1.8, ease: "easeOut" }
                        : { duration: 0.3 },
                      background: { duration: 0.3 },
                    }}
                    style={{
                      position: "absolute",
                      top: cy,
                      left: cx,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                    }}
                  />
                );
              })}

              {/* Tool labels around the orbit */}
              {TOOLS.map((tool, i) => {
                const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
                const labelR = 174;
                const lx = 180 + Math.cos(angle) * labelR;
                const ly = 180 + Math.sin(angle) * labelR;
                const isActive = active === i;
                return (
                  <motion.span
                    key={tool.name + "-label"}
                    animate={{ opacity: isActive ? 0.85 : 0.2, scale: isActive ? 1.08 : 1 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      position: "absolute",
                      top: ly,
                      left: lx,
                      transform: "translate(-50%, -50%)",
                      fontSize: "0.62rem",
                      fontWeight: isActive ? 600 : 400,
                      color: "#FF8AFF",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.04em",
                      pointerEvents: "none",
                      // push label outward past the dot
                      marginTop: Math.sin(angle) * 14,
                      marginLeft: Math.cos(angle) * 14,
                    }}
                  >
                    {tool.name}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <p style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", color: "rgba(255,138,255,0.25)", fontSize: "0.66rem", letterSpacing: "0.18em", zIndex: 2 }}>
          SCROLL TO EXPLORE ↓
        </p>
      </div>
    </div>
  );
}

// ─── Section 4: Spotlight — one tool at a time, full frame ────────────────────
function Section4({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => {
      const vh = container.clientHeight;
      // Section 4 starts at 8×vh (2+6), spans 6×vh
      const rel = container.scrollTop - vh * 8;
      const progress = Math.max(0, Math.min(1, rel / (vh * 6)));
      setActive(Math.min(Math.floor(progress * 5.4), 4));
    };
    container.addEventListener("scroll", handler, { passive: true });
    return () => container.removeEventListener("scroll", handler);
  }, [containerRef]);

  return (
    <div style={{ height: "600vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Glassmorphism backdrop */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(4,4,14,0.6)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }} />

        {/* Ghost outline number — decorative */}
        <div style={{
          position: "absolute",
          right: "-2vw",
          top: "50%",
          transform: "translateY(-52%)",
          fontSize: "clamp(160px, 28vw, 340px)",
          fontWeight: 900,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,138,255,0.06)",
          userSelect: "none",
          pointerEvents: "none",
          lineHeight: 1,
          zIndex: 0,
          transition: "opacity 0.4s",
        }}>
          {TOOLS[active].tag}
        </div>

        {/* Thin top border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,138,255,0.12), transparent)" }} />

        {/* Center stage */}
        <div style={{
          position: "relative", zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(32px, 8vw, 120px)",
          textAlign: "center",
        }}>
          {/* Section eyebrow */}
          <p style={{ color: "rgba(255,138,255,0.38)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28 }}>
            Adden Features
          </p>

          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -32, filter: "blur(8px)" }}
              transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
            >
              <h2 style={{
                fontSize: "clamp(3rem, 9vw, 7.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                lineHeight: 0.95,
                color: "#FF8AFF",
                maxWidth: 900,
              }}>
                {TOOLS[active].name}
              </h2>

              {/* Divider */}
              <div style={{ width: 48, height: 2, background: "rgba(255,138,255,0.3)", borderRadius: 1, margin: "6px 0" }} />

              <p style={{
                fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                color: "rgba(255,138,255,0.5)",
                lineHeight: 1.7,
                maxWidth: 520,
              }}>
                {TOOLS[active].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 10, alignItems: "center" }}>
            {TOOLS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: active === i ? 34 : 7,
                  opacity: active === i ? 1 : 0.25,
                  background: active === i ? "#FF8AFF" : "rgba(255,138,255,0.5)",
                }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{ height: 6, borderRadius: 3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="6" fill="#6d28d9" />
          <rect x="5" y="7" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="5" y="12" width="11" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="5" y="17" width="7" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        </svg>
        <span style={{ color: "#FF8AFF", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "-0.025em" }}>SpyCraft</span>
      </div>
      <a href="#access" style={{ color: "#FF8AFF", background: "rgba(109,40,217,0.25)", border: "1px solid rgba(168,85,247,0.3)", fontSize: "0.78rem", fontWeight: 500, padding: "7px 18px", borderRadius: 6, textDecoration: "none", backdropFilter: "blur(8px)" }}>
        Request Access
      </a>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Orb + stars driven from raw scroll position
  const [orbScale, setOrbScale] = useState(1);
  const [starsOpacity, setStarsOpacity] = useState(0);
  const [section, setSection] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const vh = el.clientHeight;
      const top = el.scrollTop;
      // total: 100+100+600+600+100 = 1500vh
      const total = vh * 14; // scrollable distance (1500-100)

      // which coarse section are we in (0-4)
      if (top < vh) setSection(0);
      else if (top < vh * 2) setSection(1);
      else if (top < vh * 8) setSection(2);
      else if (top < vh * 14) setSection(3);
      else setSection(4);

      // orb scale
      const pct = top / total;
      let scale = 1;
      if (pct < 0.07)       scale = 1 - pct / 0.07 * 0.82;     // 1→0.18
      else if (pct < 0.9)   scale = 0.13;
      else                  scale = 0.13 + (pct - 0.9) / 0.1 * 1.4; // 0.13→1.5
      setOrbScale(Math.max(0.08, scale));

      // stars
      const starPct = Math.max(0, Math.min(1, (top - vh * 0.8) / (vh * 0.8)));
      setStarsOpacity(starPct * 0.85);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "#05050f", color: "#FF8AFF" }}>

      {/* Fixed canvas: fluid orb + stars */}
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <FluidOrb scale={orbScale} />
          {starsOpacity > 0 && <Stars opacity={starsOpacity} />}
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <Nav />

      {/* Scroll container — no snap on S3/S4 since they're sticky */}
      <div ref={containerRef} style={{ height: "100vh", overflowY: "scroll", position: "relative", zIndex: 10 }}>

        {/* ── S1: Hero (100vh) ─────────────────────────── */}
        <section style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 800, color: "#FF8AFF" }}
          >
            SpyCraft is the<br />context layer.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
            style={{ marginTop: 24, fontSize: "1.15rem", color: "rgba(255,138,255,0.5)", letterSpacing: "0.02em" }}
          >
            One intelligence. Every tool.
          </motion.p>
          <motion.a
            href="#access"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{ marginTop: 44, display: "inline-block", background: "rgba(109,40,217,0.3)", border: "1px solid rgba(168,85,247,0.4)", color: "#FF8AFF", fontSize: "0.9rem", fontWeight: 600, padding: "12px 32px", borderRadius: 8, textDecoration: "none", backdropFilter: "blur(8px)", letterSpacing: "0.01em" }}
          >
            Request Access
          </motion.a>
        </section>

        {/* ── S2: Transition (100vh) ───────────────────── */}
        <section style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <AnimatePresence>
            {section >= 1 && (
              <motion.p
                key="t"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
                style={{ fontSize: "clamp(1.8rem, 5vw, 3.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#FF8AFF", maxWidth: 640 }}
              >
                At the center<br />of your stack.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ── S3: Solar System sticky (600vh) ─────────── */}
        <Section3 containerRef={containerRef} />

        {/* ── S4: Tool Spotlight sticky (600vh) ──────── */}
        <Section4 containerRef={containerRef} />

        {/* ── S5: Closing (100vh) ──────────────────────── */}
        <section id="access" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <AnimatePresence>
            {section >= 4 && (
              <motion.div
                key="close"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
              >
                <h2 style={{ fontSize: "clamp(2.4rem, 6.5vw, 5.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#FF8AFF", maxWidth: 780 }}>
                  Built for the teams<br />that move fast.
                </h2>
                <p style={{ fontSize: "1rem", color: "rgba(255,138,255,0.42)", maxWidth: 440, lineHeight: 1.65 }}>
                  SpyCraft connects your entire marketing stack into one living intelligence layer — so you never lose context, never repeat work.
                </p>
                <a href="mailto:hello@spycraft.ai" style={{ display: "inline-block", background: "#6d28d9", color: "#FF8AFF", fontSize: "0.9rem", fontWeight: 600, padding: "14px 36px", borderRadius: 8, textDecoration: "none", letterSpacing: "0.01em", marginTop: 8 }}>
                  Request Early Access
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
}
