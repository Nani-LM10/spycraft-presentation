"use client";

import React, { useRef, useMemo, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ─── Shader Material ────────────────────────────────────────────────────────

const FluidMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uColorA: new THREE.Color("#8A2BE2"),
    uColorB: new THREE.Color("#4B0082"),
  },
  /* vertex */
  `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec3 vNormal;

    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);
      const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));
      vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);
      vec3 l=1.-g;
      vec3 i1=min(g.xyz,l.zxy);
      vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;
      vec3 x2=x0-i2+C.yyy;
      vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=0.142857142857;
      vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);
      vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;
      vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);
      vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;
      vec4 s1=floor(b1)*2.+1.;
      vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
      vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);
      vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z);
      vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
      m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main(){
      vNormal=normalize(normalMatrix*normal);
      float mouseDist=distance(position.xy,uMouse*2.);
      float displacement=snoise(position*2.5+uTime*0.2)*0.3;
      displacement-=smoothstep(0.,1.5,mouseDist)*0.5;
      vec3 newPosition=position+normal*displacement;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.);
    }
  `,
  /* fragment */
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vNormal;
    void main(){
      float fresnel=pow(1.+dot(vNormal,vec3(0.,0.,1.)),2.);
      vec3 color=mix(uColorA,uColorB,vNormal.y*.5+.5);
      gl_FragColor=vec4(color+fresnel*.2,1.);
    }
  `
);

extend({ FluidMaterial });

// JSX type for the extended material
declare module "@react-three/fiber" {
  interface ThreeElements {
    fluidMaterial: any;
  }
}

// ─── Fluid Orb Scene ─────────────────────────────────────────────────────────

function FluidOrb({ scale = 1 }: { scale?: number }) {
  const matRef = useRef<any>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uTime = clock.getElapsedTime();
      matRef.current.uMouse.lerp(mouse.current, 0.05);
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }
  });

  const colorA = useMemo(() => new THREE.Color("#8A2BE2"), []);
  const colorB = useMemo(() => new THREE.Color("#4B0082"), []);

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 64]} />
      <fluidMaterial
        ref={matRef}
        key={FluidMaterial.key}
        uColorA={colorA}
        uColorB={colorB}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </mesh>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ opacity = 1 }: { opacity?: number }) {
  const geo = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#FF8AFF",
        size: 0.06,
        transparent: true,
        opacity,
      }),
    [opacity]
  );

  return <points geometry={geo} material={mat} />;
}

// ─── Orbital Tool Dot ─────────────────────────────────────────────────────────

const TOOLS = [
  { name: "Higgsfield", desc: "AI-native video generation for ad creatives." },
  { name: "Klenty", desc: "Sales sequencing synced to your creative pipeline." },
  { name: "Meta Ads", desc: "Live creative performance from your ad account." },
  { name: "HubSpot", desc: "CRM signals that inform when creatives go stale." },
  { name: "Claude MCP", desc: "LLM reasoning layer over all your marketing data." },
];

// ─── Section 3 & 4: Solar system DOM layer ────────────────────────────────────

function SolarSystem({ activeToolIndex }: { activeToolIndex: number | null }) {
  return (
    <div
      style={{
        position: "relative",
        width: 420,
        height: 420,
      }}
    >
      {/* Sun */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "radial-gradient(circle, #a855f7 0%, #6d28d9 60%, transparent 100%)",
          boxShadow: "0 0 24px 8px rgba(168,85,247,0.5)",
        }}
      />
      {TOOLS.map((tool, i) => {
        const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
        const r = 170;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const isActive = activeToolIndex === i;
        const isDimmed = activeToolIndex !== null && !isActive;

        return (
          <div
            key={tool.name}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              transition: "opacity 0.6s ease",
              opacity: isDimmed ? 0.18 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: isActive ? 14 : 8,
                height: isActive ? 14 : 8,
                borderRadius: "50%",
                background: isActive
                  ? "radial-gradient(circle, #e2d9f3, #a855f7)"
                  : "radial-gradient(circle, rgba(255,255,255,0.9), rgba(168,85,247,0.5))",
                boxShadow: isActive
                  ? "0 0 18px 6px rgba(168,85,247,0.7)"
                  : "0 0 8px 3px rgba(168,85,247,0.3)",
                transition: "all 0.5s ease",
              }}
            />
            <span
              style={{
                fontSize: isActive ? "0.8rem" : "0.7rem",
                color: isActive ? "#FF8AFF" : "rgba(255,138,255,0.55)",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                transition: "all 0.5s ease",
              }}
            >
              {tool.name}
            </span>
          </div>
        );
      })}

      {/* Orbit ring — subtle dashed circle */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        viewBox="0 0 420 420"
      >
        <circle
          cx="210"
          cy="210"
          r="170"
          fill="none"
          stroke="rgba(168,85,247,0.08)"
          strokeWidth="1"
          strokeDasharray="3 6"
        />
      </svg>
    </div>
  );
}

// ─── Persistent Canvas ────────────────────────────────────────────────────────

function PersistentCanvas({
  orbScale,
  starsOpacity,
}: {
  orbScale: number;
  starsOpacity: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 75 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    >
      <Suspense fallback={null}>
        <FluidOrb scale={orbScale} />
        {starsOpacity > 0 && <Stars opacity={starsOpacity} />}
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* SpyCraft logo mark — purple bars */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="6" fill="#6d28d9" />
          <rect x="5" y="7" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="5" y="12" width="11" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="5" y="17" width="7" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        </svg>
        <span
          style={{
            color: "#FF8AFF",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
          }}
        >
          SpyCraft
        </span>
      </div>
      <a
        href="#access"
        style={{
          color: "#FF8AFF",
          background: "rgba(109,40,217,0.25)",
          border: "1px solid rgba(168,85,247,0.3)",
          fontSize: "0.78rem",
          fontWeight: 500,
          padding: "7px 18px",
          borderRadius: 6,
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          transition: "background 0.2s",
        }}
      >
        Request Access
      </a>
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Section tracking
  const [section, setSection] = useState(0);
  const [activeToolIndex, setActiveToolIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
      const s = Math.round(progress * 4); // 5 sections, 0-4
      setSection(Math.min(s, 4));
      if (s === 3) {
        const toolProgress = (progress - 0.6) / 0.2;
        const idx = Math.floor(toolProgress * TOOLS.length);
        setActiveToolIndex(Math.min(Math.max(idx, 0), TOOLS.length - 1));
      } else {
        setActiveToolIndex(null);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Orb scale: hero=1, transition shrinks to 0.15, solar=0.15, spotlight=0.15, closing expands back to 1.2
  const orbScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.8, 1],
    [1, 0.18, 0.15, 0.15, 1.4]
  );

  const starsOpacity = useTransform(scrollYProgress, [0.12, 0.25], [0, 0.9]);

  // Canvas gets reactive values via state (re-renders on scroll)
  const [orbScaleVal, setOrbScaleVal] = useState(1);
  const [starsOpacityVal, setStarsOpacityVal] = useState(0);

  useEffect(() => {
    const unsubOrb = orbScale.on("change", setOrbScaleVal);
    const unsubStars = starsOpacity.on("change", setStarsOpacityVal);
    return () => { unsubOrb(); unsubStars(); };
  }, [orbScale, starsOpacity]);

  return (
    <div style={{ background: "#05050f", color: "#FF8AFF" }}>
      <PersistentCanvas orbScale={orbScaleVal} starsOpacity={starsOpacityVal} />
      <Nav />

      {/* Scroll container */}
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ── Section 1: Hero ─────────────────────────── */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{
              fontSize: "clamp(2.6rem, 7vw, 6rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              maxWidth: 800,
              color: "#FF8AFF",
            }}
          >
            SpyCraft is the<br />context layer.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{
              marginTop: 24,
              fontSize: "1.15rem",
              color: "rgba(255,138,255,0.55)",
              letterSpacing: "0.02em",
              fontWeight: 400,
            }}
          >
            One intelligence. Every tool.
          </motion.p>
          <motion.a
            href="#access"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{
              marginTop: 44,
              display: "inline-block",
              background: "rgba(109,40,217,0.3)",
              border: "1px solid rgba(168,85,247,0.4)",
              color: "#FF8AFF",
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "12px 32px",
              borderRadius: 8,
              textDecoration: "none",
              backdropFilter: "blur(8px)",
              letterSpacing: "0.01em",
            }}
          >
            Request Access
          </motion.a>
        </section>

        {/* ── Section 2: Transition ───────────────────── */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <AnimatePresence>
            {section >= 1 && (
              <motion.p
                key="transition-text"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                style={{
                  fontSize: "clamp(1.8rem, 5vw, 3.6rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#FF8AFF",
                  maxWidth: 640,
                }}
              >
                At the center<br />of your stack.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* ── Section 3: Solar System ─────────────────── */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 48,
          }}
        >
          <AnimatePresence>
            {section >= 2 && (
              <motion.div
                key="solar-content"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 40,
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    letterSpacing: "0.18em",
                    color: "rgba(168,85,247,0.6)",
                    textTransform: "uppercase",
                  }}
                >
                  Connected integrations
                </p>
                <SolarSystem activeToolIndex={null} />
                <p
                  style={{
                    fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                    color: "rgba(255,138,255,0.45)",
                    letterSpacing: "0.01em",
                    maxWidth: 400,
                    textAlign: "center",
                  }}
                >
                  Five tools. One intelligence layer.<br />Zero context switching.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Section 4: Tool Spotlight ───────────────── */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 80,
            padding: "0 48px",
          }}
        >
          <AnimatePresence>
            {section >= 3 && (
              <motion.div
                key="spotlight-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 80,
                  width: "100%",
                  maxWidth: 960,
                }}
              >
                <SolarSystem activeToolIndex={activeToolIndex} />
                <div style={{ flex: 1, minWidth: 260 }}>
                  {TOOLS.map((tool, i) => (
                    <div
                      key={tool.name}
                      style={{
                        marginBottom: 28,
                        opacity: activeToolIndex === i ? 1 : 0.2,
                        transition: "opacity 0.5s ease",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          color: "#FF8AFF",
                          marginBottom: 4,
                        }}
                      >
                        {tool.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "rgba(255,138,255,0.5)",
                          lineHeight: 1.5,
                        }}
                      >
                        {tool.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Section 5: Closing ──────────────────────── */}
        <section
          id="access"
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <AnimatePresence>
            {section >= 4 && (
              <motion.div
                key="closing-content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}
              >
                <h2
                  style={{
                    fontSize: "clamp(2.4rem, 6.5vw, 5.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    color: "#FF8AFF",
                    maxWidth: 780,
                  }}
                >
                  Built for the teams<br />that move fast.
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "rgba(255,138,255,0.45)",
                    maxWidth: 440,
                    lineHeight: 1.6,
                  }}
                >
                  SpyCraft connects your entire marketing stack into one living intelligence layer — so you never lose context, never repeat work.
                </p>
                <a
                  href="mailto:hello@spycraft.ai"
                  style={{
                    display: "inline-block",
                    background: "#6d28d9",
                    color: "#FF8AFF",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    padding: "14px 36px",
                    borderRadius: 8,
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    marginTop: 8,
                  }}
                >
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
