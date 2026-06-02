"use client";

import React, {
  useRef,
  useMemo,
  Suspense,
  useEffect,
  useState,
} from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ─── JSX type declarations ────────────────────────────────────────────────────

declare module "@react-three/fiber" {
  interface ThreeElements {
    fluidMaterial: any;
  }
}

// ─── Fluid Shader Material ────────────────────────────────────────────────────

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

// ─── Fluid Orb (for hero/closing persistent canvas) ──────────────────────────

function FluidOrb({ scale = 1 }: { scale?: number }) {
  const matRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));

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
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({ color: "#ffffff", size: 0.05, transparent: true, opacity }),
    [opacity]
  );
  const geo = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return <points geometry={geo} material={mat} />;
}

// ─── Solar System ─────────────────────────────────────────────────────────────

const PLANETS = [
  {
    name: "Competitor Intel",
    desc: "Real-time ad library scraping, AI creative tagging, winning hook detection.",
    color: "#60a5fa",
    emissive: "#1d4ed8",
    speed: 0.38,
    radius: 1.3,
  },
  {
    name: "Discover Ads",
    desc: "Smart search, automatic transcription, catch trends before they peak.",
    color: "#2dd4bf",
    emissive: "#0f766e",
    speed: 0.27,
    radius: 2.0,
  },
  {
    name: "Analyze",
    desc: "Detect fatigue instantly, see which hooks and formats are working and why.",
    color: "#fbbf24",
    emissive: "#b45309",
    speed: 0.19,
    radius: 2.8,
  },
  {
    name: "Briefs",
    desc: "AI scripting and storyboarding, data-informed creative direction.",
    color: "#c084fc",
    emissive: "#7e22ce",
    speed: 0.13,
    radius: 3.6,
  },
  {
    name: "Craft",
    desc: "Generate production-ready creatives in minutes from proven performance signals.",
    color: "#f87171",
    emissive: "#b91c1c",
    speed: 0.09,
    radius: 4.3,
  },
];

function OrbitRing({ radius }: { radius: number }) {
  const obj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: "#ffffff", opacity: 0.07, transparent: true });
    return new THREE.LineLoop(geo, mat);
  }, [radius]);

  return <primitive object={obj} />;
}

function Planet({
  planet,
  index,
  hovered,
  onHover,
}: {
  planet: (typeof PLANETS)[0];
  index: number;
  hovered: number | null;
  onHover: (i: number | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleVal = useRef(1);
  const angle = useRef((index / PLANETS.length) * Math.PI * 2);

  const isHovered = hovered === index;
  const isDimmed = hovered !== null && !isHovered;

  useFrame(({ clock }) => {
    angle.current = (index / PLANETS.length) * Math.PI * 2 + clock.getElapsedTime() * planet.speed;
    if (!meshRef.current || !matRef.current) return;
    meshRef.current.position.x = Math.cos(angle.current) * planet.radius;
    meshRef.current.position.y = Math.sin(angle.current) * planet.radius;

    const targetScale = isHovered ? 2.4 : 1;
    scaleVal.current = THREE.MathUtils.lerp(scaleVal.current, targetScale, 0.12);
    meshRef.current.scale.setScalar(scaleVal.current);

    const targetEmissive = isDimmed ? 0.3 : isHovered ? 5 : 2.5;
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity,
      targetEmissive,
      0.1
    );
    matRef.current.opacity = THREE.MathUtils.lerp(
      matRef.current.opacity ?? 1,
      isDimmed ? 0.35 : 1,
      0.1
    );
  });

  return (
    <mesh
      ref={meshRef}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(index); }}
      onPointerLeave={() => onHover(null)}
    >
      <sphereGeometry args={[0.14, 24, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={planet.color}
        emissive={planet.color}
        emissiveIntensity={2.5}
        transparent
        opacity={1}
      />
      {isHovered && (
        <Html
          distanceFactor={10}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[20, 21]}
        >
          <div
            style={{
              width: 210,
              background: "rgba(5,5,15,0.88)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "14px 18px",
              backdropFilter: "blur(16px)",
              transform: "translate(18px, -50%)",
              boxShadow: `0 0 24px 0 ${planet.color}33`,
            }}
          >
            <p
              style={{
                color: planet.color,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6,
                fontFamily: "var(--font-geist-sans, sans-serif)",
              }}
            >
              {planet.name}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "0.78rem",
                lineHeight: 1.55,
                fontFamily: "var(--font-geist-sans, sans-serif)",
              }}
            >
              {planet.desc}
            </p>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function SolarSun() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.4;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.28, 32, 32]} />
      <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={4} />
    </mesh>
  );
}

function SolarScene() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 3]} intensity={3} color="#a855f7" />
      <SolarSun />
      {PLANETS.map((planet, i) => (
        <React.Fragment key={planet.name}>
          <OrbitRing radius={planet.radius} />
          <Planet planet={planet} index={i} hovered={hovered} onHover={setHovered} />
        </React.Fragment>
      ))}
    </>
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
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect width="26" height="26" rx="6" fill="#6d28d9" />
          <rect x="5" y="7" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="5" y="12" width="11" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="5" y="17" width="7" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
        </svg>
        <span style={{ color: "#ffffff", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "-0.025em" }}>
          SpyCraft
        </span>
      </div>
      <a
        href="#access"
        style={{
          color: "#ffffff",
          background: "rgba(109,40,217,0.3)",
          border: "1px solid rgba(168,85,247,0.35)",
          fontSize: "0.78rem",
          fontWeight: 500,
          padding: "7px 18px",
          borderRadius: 6,
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          letterSpacing: "0.01em",
        }}
      >
        Request Access
      </a>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Track scroll section (0–3)
  const [section, setSection] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setSection(Math.min(Math.round(pct * 3), 3));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Orb scale — large in hero, shrinks on section 1, tiny in 2, expands in 3
  const orbScale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 0.18, 0.12, 0.12, 1.5]);
  const starsOpacity = useTransform(scrollYProgress, [0.1, 0.28], [0, 0.85]);

  const [orbScaleVal, setOrbScaleVal] = useState(1);
  const [starsOpacityVal, setStarsOpacityVal] = useState(0);
  useEffect(() => {
    const u1 = orbScale.on("change", setOrbScaleVal);
    const u2 = starsOpacity.on("change", setStarsOpacityVal);
    return () => { u1(); u2(); };
  }, [orbScale, starsOpacity]);

  return (
    <div style={{ background: "#05050f" }}>
      {/* Fixed background canvas — orb + stars */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 75 }}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      >
        <Suspense fallback={null}>
          {/* Hide orb behind solar section (section 2) */}
          {section !== 2 && <FluidOrb scale={orbScaleVal} />}
          {starsOpacityVal > 0 && <Stars opacity={starsOpacityVal} />}
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <Nav />

      {/* Scroll container — 4 snap sections */}
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
        {/* ── 1. Hero ──────────────────────────────────────── */}
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
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{
              fontSize: "clamp(2.8rem, 7.5vw, 6.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1.03,
              color: "#ffffff",
              maxWidth: 820,
            }}
          >
            SpyCraft is the<br />context layer.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            style={{
              marginTop: 28,
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.01em",
              fontWeight: 400,
            }}
          >
            One intelligence. Every tool.
          </motion.p>
          <motion.a
            href="#access"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.9 }}
            style={{
              marginTop: 48,
              display: "inline-block",
              background: "rgba(109,40,217,0.28)",
              border: "1px solid rgba(168,85,247,0.4)",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 600,
              padding: "13px 34px",
              borderRadius: 8,
              textDecoration: "none",
              backdropFilter: "blur(8px)",
              letterSpacing: "0.01em",
            }}
          >
            Request Access
          </motion.a>
        </section>

        {/* ── 2. Transition ────────────────────────────────── */}
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
              <motion.div
                key="transition"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <p
                  style={{
                    fontSize: "clamp(1.9rem, 5.5vw, 4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.035em",
                    color: "#ffffff",
                    lineHeight: 1.1,
                    maxWidth: 600,
                  }}
                >
                  At the center<br />of your stack.
                </p>
                <p
                  style={{
                    marginTop: 20,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "1rem",
                    letterSpacing: "0.01em",
                  }}
                >
                  Every tool. One intelligence layer.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── 3. Solar System ──────────────────────────────── */}
        <section
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            background: "#05050f", // opaque to cover persistent canvas
            overflow: "hidden",
          }}
        >
          {/* Three.js canvas for planets */}
          <div style={{ position: "absolute", inset: 0 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 54 }}>
              <Suspense fallback={null}>
                <SolarScene />
                <EffectComposer>
                  <Bloom intensity={2.5} luminanceThreshold={0.05} luminanceSmoothing={0.6} />
                </EffectComposer>
              </Suspense>
            </Canvas>
          </div>

          {/* Text overlay — above canvas */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: "80px 48px 0",
              pointerEvents: "none",
            }}
          >
            <AnimatePresence>
              {section >= 2 && (
                <motion.div
                  key="solar-label"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <p
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      color: "rgba(168,85,247,0.7)",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    SpyCraft integrations
                  </p>
                  <p
                    style={{
                      fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      color: "#ffffff",
                      lineHeight: 1.1,
                      maxWidth: 420,
                    }}
                  >
                    Five features.<br />One context layer.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom hint */}
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.72rem", letterSpacing: "0.12em" }}>
              HOVER A PLANET TO EXPLORE
            </p>
          </div>
        </section>

        {/* ── 4. Closing ───────────────────────────────────── */}
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
            {section >= 3 && (
              <motion.div
                key="closing"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
              >
                <h2
                  style={{
                    fontSize: "clamp(2.6rem, 7vw, 5.8rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.045em",
                    lineHeight: 1.04,
                    color: "#ffffff",
                    maxWidth: 800,
                  }}
                >
                  Built for the teams<br />that move fast.
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "rgba(255,255,255,0.42)",
                    maxWidth: 440,
                    lineHeight: 1.65,
                    marginTop: 4,
                  }}
                >
                  SpyCraft connects your entire marketing stack into one living intelligence layer — so you never lose context, never repeat work.
                </p>
                <a
                  href="mailto:hello@spycraft.ai"
                  style={{
                    display: "inline-block",
                    background: "#6d28d9",
                    color: "#ffffff",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    padding: "14px 38px",
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
