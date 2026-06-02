"use client";

import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// ─── Module-level singleton — R3F reads this in useFrame (zero React re-renders) ──
const gScene = {
  orbScale: 1,
  starsOpacity: 0,
  planetActive: 0,   // 0-4 integer, section 3 active planet
  s3Visible: false,  // is section 3 in view?
};

// ─── JSX type declarations ────────────────────────────────────────────────────
declare module "@react-three/fiber" {
  interface ThreeElements {
    fluidMaterial: any;
    planetMaterial: any;
  }
}

// ─── Shared GLSL noise ────────────────────────────────────────────────────────
const GLSL_NOISE = `
  vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289v3(i);
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
`;

// ─── Fluid Material (orb) ─────────────────────────────────────────────────────
const FluidMaterial = shaderMaterial(
  { uTime: 0, uMouse: new THREE.Vector2(0, 0), uColorA: new THREE.Color("#8A2BE2"), uColorB: new THREE.Color("#4B0082") },
  GLSL_NOISE + `
    uniform float uTime; uniform vec2 uMouse; varying vec3 vNormal;
    void main(){
      vNormal=normalize(normalMatrix*normal);
      float d=distance(position.xy,uMouse*2.);
      float disp=snoise(position*2.5+uTime*0.2)*0.3-smoothstep(0.,1.5,d)*0.5;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*disp,1.);}`,
  `uniform vec3 uColorA;uniform vec3 uColorB;varying vec3 vNormal;
    void main(){
      float f=pow(1.+dot(vNormal,vec3(0.,0.,1.)),2.);
      vec3 c=mix(uColorA,uColorB,vNormal.y*.5+.5);
      gl_FragColor=vec4(c+f*.2,1.);}`
);
extend({ FluidMaterial });

// ─── Planet Material ──────────────────────────────────────────────────────────
const PlanetMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color(0.76, 0.27, 0.05),
    uColorB: new THREE.Color(0.44, 0.15, 0.02),
    uRim:    new THREE.Color(0.95, 0.55, 0.35),
    uBands:  0.08,
  },
  // vertex
  GLSL_NOISE + `
    uniform float uTime; varying vec3 vNormal; varying vec3 vPos;
    void main(){
      vNormal=normalize(normalMatrix*normal); vPos=position;
      float d=snoise(position*1.4+uTime*0.025)*0.035;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*d,1.);}`,
  // fragment
  GLSL_NOISE + `
    uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uRim;
    uniform float uBands; uniform float uTime;
    varying vec3 vNormal; varying vec3 vPos;
    void main(){
      float n=snoise(vPos*2.2+uTime*0.018)*.5+.5;
      float n2=snoise(vPos*5.5-uTime*0.009)*.5+.5;
      float noise=n*.65+n2*.35;
      float band=sin(vPos.y*15.+snoise(vPos*.9)*.8)*.5+.5;
      float surface=mix(noise,band,uBands);
      vec3 color=mix(uColorA,uColorB,surface);
      float fresnel=pow(1.-abs(dot(vNormal,vec3(0.,0.,1.))),3.2);
      color+=uRim*fresnel*0.75;
      gl_FragColor=vec4(color,1.);}`
);
extend({ PlanetMaterial });

// ─── Planet configs ───────────────────────────────────────────────────────────
const PLANET_TYPES = [
  { colorA: new THREE.Color(0.76,0.27,0.05), colorB: new THREE.Color(0.44,0.15,0.02), rim: new THREE.Color(0.95,0.55,0.35), bands:0.08, scale:1.75, ring:false },
  { colorA: new THREE.Color(0.78,0.55,0.23), colorB: new THREE.Color(0.92,0.80,0.62), rim: new THREE.Color(0.9,0.65,0.4),   bands:0.88, scale:2.05, ring:false },
  { colorA: new THREE.Color(0.72,0.63,0.45), colorB: new THREE.Color(0.50,0.43,0.28), rim: new THREE.Color(0.85,0.78,0.58), bands:0.42, scale:1.55, ring:true  },
  { colorA: new THREE.Color(0.09,0.20,0.75), colorB: new THREE.Color(0.04,0.08,0.42), rim: new THREE.Color(0.25,0.55,1.0),  bands:0.22, scale:1.65, ring:false },
  { colorA: new THREE.Color(0.15,0.45,0.25), colorB: new THREE.Color(0.08,0.28,0.52), rim: new THREE.Color(0.45,0.75,1.0),  bands:0.04, scale:1.80, ring:false },
];

// ─── Fluid Orb (reads gScene, no props) ──────────────────────────────────────
function FluidOrb() {
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
    if (meshRef.current) meshRef.current.scale.setScalar(gScene.orbScale);
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

// ─── Stars (reads gScene) ─────────────────────────────────────────────────────
function Stars() {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) { p[i*3]=(Math.random()-.5)*60; p[i*3+1]=(Math.random()-.5)*60; p[i*3+2]=(Math.random()-.5)*60; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame(() => { if (matRef.current) matRef.current.opacity = gScene.starsOpacity; });
  return (
    <points geometry={geo}>
      <pointsMaterial ref={matRef} color="#ffffff" size={0.055} transparent opacity={0} />
    </points>
  );
}

// ─── Planet mesh (reads gScene, lerps between planet types) ──────────────────
function PlanetScene() {
  const meshRef    = useRef<THREE.Mesh>(null);
  const matRef     = useRef<any>(null);
  const ringRef    = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const cur = useRef({
    colorA:      new THREE.Color().copy(PLANET_TYPES[0].colorA),
    colorB:      new THREE.Color().copy(PLANET_TYPES[0].colorB),
    rim:         new THREE.Color().copy(PLANET_TYPES[0].rim),
    bands:       PLANET_TYPES[0].bands,
    scale:       PLANET_TYPES[0].scale,
    ringOpacity: 0,
    visible:     0, // 0=hidden, 1=shown  (lerped for fade-in)
  });

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime();
    const idx = gScene.planetActive;
    const tgt = PLANET_TYPES[idx];
    const c   = cur.current;
    const sp  = 0.045;

    c.colorA.lerp(tgt.colorA as THREE.Color, sp);
    c.colorB.lerp(tgt.colorB as THREE.Color, sp);
    c.rim.lerp(tgt.rim as THREE.Color, sp);
    c.bands       = THREE.MathUtils.lerp(c.bands,       tgt.bands,              sp);
    c.scale       = THREE.MathUtils.lerp(c.scale,       tgt.scale,              sp);
    c.ringOpacity = THREE.MathUtils.lerp(c.ringOpacity, tgt.ring ? 0.6 : 0,     sp * 1.8);
    c.visible     = THREE.MathUtils.lerp(c.visible,     gScene.s3Visible ? 1 : 0, 0.06);

    if (matRef.current) {
      matRef.current.uTime = t;
      matRef.current.uColorA.copy(c.colorA);
      matRef.current.uColorB.copy(c.colorB);
      matRef.current.uRim.copy(c.rim);
      matRef.current.uBands = c.bands;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(c.scale * c.visible);
      meshRef.current.rotation.y = t * 0.11;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, gScene.s3Visible ? 2.6 : 0, 0.04);
    }
    if (ringRef.current && ringMatRef.current) {
      ringRef.current.scale.setScalar(c.scale * c.visible);
      ringRef.current.position.x = meshRef.current?.position.x ?? 2.6;
      ringRef.current.rotation.y = t * 0.11;
      ringMatRef.current.opacity = c.ringOpacity * c.visible;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 80, 80]} />
        <planetMaterial ref={matRef} key={PlanetMaterial.key} />
      </mesh>
      {/* Saturn ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2 - 0.42, 0, 0.28]}>
        <ringGeometry args={[1.55, 2.75, 90]} />
        <meshBasicMaterial ref={ringMatRef} color="#c8b87a" opacity={0} transparent side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ─── Feature data ─────────────────────────────────────────────────────────────
const TOOLS = [
  { name: "Competitor Intel", tag: "01", planet: "Mars",    desc: "Real-time ad library scraping, AI creative tagging, winning hook detection." },
  { name: "Discover Ads",     tag: "02", planet: "Jupiter", desc: "Smart search, automatic transcription, catch trends before they peak." },
  { name: "Analyze",          tag: "03", planet: "Saturn",  desc: "Detect fatigue instantly, see which hooks and formats are working and why." },
  { name: "Briefs",           tag: "04", planet: "Neptune", desc: "AI scripting and storyboarding, data-informed creative direction." },
  { name: "Craft",            tag: "05", planet: "Earth",   desc: "Generate production-ready creatives in minutes from proven performance signals." },
];

// ─── Section 3 ────────────────────────────────────────────────────────────────
function Section3({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId = 0;
    const handler = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vh = el.clientHeight;
        const rel = el.scrollTop - vh * 2;        // S3 starts at 2×vh
        const progress = Math.max(0, Math.min(1, rel / (vh * 6)));
        const idx = Math.min(Math.floor(progress * 5.4), 4);
        const newActive = Math.max(0, idx);
        gScene.planetActive = newActive;
        gScene.s3Visible = progress > 0 && progress < 0.98;
        setActive(prev => prev === newActive ? prev : newActive);
      });
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => { el.removeEventListener("scroll", handler); cancelAnimationFrame(rafId); };
  }, [containerRef]);

  return (
    <div style={{ height: "600vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Glass — left half only, so right half stays transparent for the 3D planet */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "50%",
          background: "linear-gradient(to right, rgba(4,4,14,0.72) 70%, transparent 100%)",
          backdropFilter: "blur(26px)",
          WebkitBackdropFilter: "blur(26px)",
          zIndex: 0,
        }} />

        {/* Subtle full-width dark vignette so planet feels embedded */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 120% 100% at 75% 50%, transparent 40%, rgba(4,4,14,0.55) 100%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,138,255,0.18), transparent)", zIndex: 1 }} />

        {/* Left — text content */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "46%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 clamp(32px, 5vw, 80px)",
          zIndex: 2,
        }}>
          <p style={{ color: "rgba(255,138,255,0.35)", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28 }}>
            Intelligence Layer
          </p>

          {/* Planet type badge */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`badge-${active}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              style={{ color: "rgba(255,138,255,0.45)", fontSize: "0.78rem", letterSpacing: "0.12em", marginBottom: 10, fontVariantNumeric: "tabular-nums" }}
            >
              {TOOLS[active].tag} / 05 · {TOOLS[active].planet}
            </motion.p>
          </AnimatePresence>

          {/* Feature name */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={`name-${active}`}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -22, filter: "blur(5px)" }}
              transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              style={{
                fontSize: "clamp(2.1rem, 4.8vw, 4.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#FF8AFF",
                lineHeight: 1.04,
                marginBottom: 22,
              }}
            >
              {TOOLS[active].name}
            </motion.h2>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${active}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              style={{ fontSize: "clamp(0.88rem, 1.4vw, 1.02rem)", color: "rgba(255,138,255,0.5)", lineHeight: 1.72, maxWidth: 360 }}
            >
              {TOOLS[active].desc}
            </motion.p>
          </AnimatePresence>

          {/* Progress pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 42, alignItems: "center" }}>
            {TOOLS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: active === i ? 34 : 7, opacity: active === i ? 1 : 0.28, background: active === i ? "#FF8AFF" : "rgba(255,138,255,0.5)" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{ height: 5, borderRadius: 3 }}
              />
            ))}
          </div>
        </div>

        {/* Right label overlay (planet name faint) */}
        <AnimatePresence>
          <motion.p
            key={`plabel-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute", bottom: 36, right: 36, zIndex: 3,
              fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.2em",
              color: "rgba(255,138,255,0.22)", textTransform: "uppercase",
            }}
          >
            {TOOLS[active].planet}
          </motion.p>
        </AnimatePresence>

        {/* Scroll hint */}
        <p style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", color: "rgba(255,138,255,0.2)", fontSize: "0.64rem", letterSpacing: "0.18em", zIndex: 3 }}>
          SCROLL TO EXPLORE ↓
        </p>
      </div>
    </div>
  );
}

// ─── Section 4 ────────────────────────────────────────────────────────────────
function Section4({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId = 0;
    const handler = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vh = el.clientHeight;
        const rel = el.scrollTop - vh * 8;        // S4 starts at 8×vh (after S1+S2+S3)
        const progress = Math.max(0, Math.min(1, rel / (vh * 6)));
        const newActive = Math.max(0, Math.min(Math.floor(progress * 5.4), 4));
        setActive(prev => prev === newActive ? prev : newActive);
      });
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => { el.removeEventListener("scroll", handler); cancelAnimationFrame(rafId); };
  }, [containerRef]);

  return (
    <div style={{ height: "600vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* Full-frame glass */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(4,4,14,0.62)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,138,255,0.14), transparent)" }} />

        {/* Ghost number */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`ghost-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute", right: "-1vw", top: "50%", transform: "translateY(-52%)",
              fontSize: "clamp(140px, 26vw, 320px)", fontWeight: 900, letterSpacing: "-0.06em",
              color: "transparent", WebkitTextStroke: "1px rgba(255,138,255,0.055)",
              userSelect: "none", pointerEvents: "none", lineHeight: 1, zIndex: 0,
            }}
          >
            {TOOLS[active].tag}
          </motion.div>
        </AnimatePresence>

        {/* Center content */}
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 clamp(28px, 8vw, 120px)" }}>
          <p style={{ color: "rgba(255,138,255,0.35)", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 28 }}>
            Adden Features
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`spot-${active}`}
              initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -36, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
            >
              <h2 style={{ fontSize: "clamp(3rem, 9.5vw, 8rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.93, color: "#FF8AFF", maxWidth: 900 }}>
                {TOOLS[active].name}
              </h2>
              <div style={{ width: 44, height: 2, background: "rgba(255,138,255,0.28)", borderRadius: 1 }} />
              <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.12rem)", color: "rgba(255,138,255,0.48)", lineHeight: 1.7, maxWidth: 500 }}>
                {TOOLS[active].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 10 }}>
            {TOOLS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: active === i ? 34 : 7, opacity: active === i ? 1 : 0.25, background: active === i ? "#FF8AFF" : "rgba(255,138,255,0.45)" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{ height: 5, borderRadius: 3 }}
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

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId = 0;
    let lastSection = 0;
    const handler = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vh = el.clientHeight;
        const top = el.scrollTop;
        const total = vh * 14; // scrollable px (total 1500vh - 100vh viewport)

        // Continuous values → singleton, no React state
        const pct = top / total;
        if (pct < 0.07)     gScene.orbScale = 1 - (pct / 0.07) * 0.84;
        else if (pct < 0.9) gScene.orbScale = 0.13;
        else                gScene.orbScale = 0.13 + ((pct - 0.9) / 0.1) * 1.4;
        gScene.orbScale = Math.max(0.08, gScene.orbScale);
        gScene.starsOpacity = Math.max(0, Math.min(0.85, (top - vh * 0.7) / (vh * 0.8)));

        // Discrete section → React state (only when it changes)
        let s = 0;
        if (top >= vh * 14) s = 4;
        else if (top >= vh * 8) s = 3;
        else if (top >= vh * 2) s = 2;
        else if (top >= vh)     s = 1;
        if (s !== lastSection) { lastSection = s; setSection(s); }
      });
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => { el.removeEventListener("scroll", handler); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div style={{ background: "#05050f" }}>
      {/* Single canvas — orb, stars, planet all in one WebGL context */}
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <FluidOrb />
          <Stars />
          <PlanetScene />
          <EffectComposer>
            <Bloom intensity={1.6} luminanceThreshold={0.08} luminanceSmoothing={0.85} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <Nav />

      <div ref={containerRef} style={{ height: "100vh", overflowY: "scroll", position: "relative", zIndex: 10 }}>

        {/* ── S1: Hero (100vh) ── */}
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

        {/* ── S2: Transition (100vh) ── */}
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

        {/* ── S3: Solar System sticky (600vh) ── */}
        <Section3 containerRef={containerRef} />

        {/* ── S4: Tool Spotlight sticky (600vh) ── */}
        <Section4 containerRef={containerRef} />

        {/* ── S5: Closing (100vh) ── */}
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
                  SpyCraft connects your entire marketing stack into one living intelligence layer.
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
