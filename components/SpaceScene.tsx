"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/lib/useMousePosition";
import { sceneState } from "@/lib/sceneState";

// ─── Planet data ──────────────────────────────────────────────────────────────

interface PlanetData {
  name: string;
  color: string;
  emissiveColor: string;
  size: number;
  orbitR: number;
  phase: number;
  orbitSpeed: number;
}

const PLANETS: PlanetData[] = [
  {
    name: "Claude MCP",
    color: "#E8D5A3",
    emissiveColor: "#C49030",
    size: 0.22,
    orbitR: 3.8,
    phase: 0.8,
    orbitSpeed: 0.5,
  },
  {
    name: "HubSpot",
    color: "#FF8060",
    emissiveColor: "#CC3810",
    size: 0.28,
    orbitR: 5.7,
    phase: 2.1,
    orbitSpeed: 0.32,
  },
  {
    name: "Clying",
    color: "#6EE7FF",
    emissiveColor: "#18AACC",
    size: 0.24,
    orbitR: 7.4,
    phase: 3.9,
    orbitSpeed: 0.21,
  },
  {
    name: "Meta Ads",
    color: "#5B9EF5",
    emissiveColor: "#1A55DD",
    size: 0.30,
    orbitR: 9.2,
    phase: 5.3,
    orbitSpeed: 0.14,
  },
];

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars() {
  const positions = useMemo(() => {
    const count = 3500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 70 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const sizes = useMemo(() => {
    const count = 3500;
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.05 + Math.random() * 0.25;
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#ffffff"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Sun ──────────────────────────────────────────────────────────────────────

function Sun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const corona1Ref = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.0 + 0.5 * Math.sin(t * 1.1);
    }
    if (corona1Ref.current) {
      corona1Ref.current.scale.setScalar(1 + 0.04 * Math.sin(t * 0.8));
    }
    if (corona2Ref.current) {
      corona2Ref.current.scale.setScalar(1 + 0.06 * Math.sin(t * 0.5 + 1));
    }
  });

  return (
    <group>
      <pointLight color="#FFB060" intensity={5} distance={80} decay={1.4} />
      <pointLight color="#FF6020" intensity={2} distance={20} decay={2} />

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#FF9220"
          emissive="#FF5800"
          emissiveIntensity={2.0}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Inner corona */}
      <mesh ref={corona1Ref}>
        <sphereGeometry args={[1.55, 20, 20]} />
        <meshBasicMaterial
          color="#FF7020"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Mid corona */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshBasicMaterial
          color="#FF4800"
          transparent
          opacity={0.065}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[3.8, 12, 12]} />
        <meshBasicMaterial
          color="#FF2800"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Far outer haze */}
      <mesh>
        <sphereGeometry args={[6, 8, 8]} />
        <meshBasicMaterial
          color="#FF1000"
          transparent
          opacity={0.008}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Orbit ring ───────────────────────────────────────────────────────────────

function OrbitRing({
  radius,
  index,
  ringMatRefs,
}: {
  radius: number;
  index: number;
  ringMatRefs: React.MutableRefObject<(THREE.LineBasicMaterial | null)[]>;
}) {
  const positions = useMemo(() => {
    const segments = 128;
    const arr = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      arr[i * 3 + 0] = Math.cos(a) * radius;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = Math.sin(a) * radius;
    }
    return arr;
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        ref={(el) => {
          ringMatRefs.current[index] = el;
        }}
        color="#6EE7FF"
        transparent
        opacity={0}
      />
    </line>
  );
}

// ─── Planet ───────────────────────────────────────────────────────────────────

function Planet({
  planet,
  index,
  planetGroupRefs,
}: {
  planet: PlanetData;
  index: number;
  planetGroupRefs: React.MutableRefObject<(THREE.Group | null)[]>;
}) {
  return (
    <group
      ref={(el) => {
        planetGroupRefs.current[index] = el;
      }}
    >
      {/* Core */}
      <mesh>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissiveColor}
          emissiveIntensity={0.3}
          roughness={0.55}
          metalness={0.1}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Focus glow */}
      <mesh>
        <sphereGeometry args={[planet.size * 2.2, 16, 16]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere rim */}
      <mesh>
        <sphereGeometry args={[planet.size * 1.15, 16, 16]} />
        <meshBasicMaterial
          color={planet.color}
          transparent
          opacity={0}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Scene controller ─────────────────────────────────────────────────────────

function Scene({
  mouse,
}: {
  mouse: React.MutableRefObject<{ nx: number; ny: number }>;
}) {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 0, 4.5));
  const camLook = useRef(new THREE.Vector3(0, 0, 0));
  const orbitAngles = useRef(PLANETS.map((p) => p.phase));

  const planetGroupRefs = useRef<(THREE.Group | null)[]>(
    Array(PLANETS.length).fill(null)
  );
  const ringMatRefs = useRef<(THREE.LineBasicMaterial | null)[]>(
    Array(PLANETS.length).fill(null)
  );

  useFrame((_, dt) => {
    const sec = Math.max(0, Math.min(Math.round(sceneState.section), 7));

    // ── Camera target ──────────────────────────────────────────────────────
    let tx = 0,
      ty = 0,
      tz = 4.5;
    let lx = 0,
      ly = 0,
      lz = 0;

    if (sec === 0) {
      tz = 4.5;
    } else if (sec === 1) {
      tz = 8.5;
      ty = 0.5;
    } else if (sec === 2) {
      tz = 20;
      ty = 4;
    } else if (sec >= 3 && sec <= 6) {
      const p = PLANETS[sec - 3];
      tz = p.orbitR + 3.8;
      ty = 0.6;
      lz = p.orbitR;
    } else if (sec === 7) {
      tz = 26;
      ty = 6;
    }

    // Subtle mouse parallax
    tx += mouse.current.nx * (sec >= 2 ? 0.6 : 0.25);
    ty += mouse.current.ny * (sec >= 2 ? 0.3 : 0.15);

    camPos.current.lerp(new THREE.Vector3(tx, ty, tz), 0.035);
    camLook.current.lerp(new THREE.Vector3(lx, ly, lz), 0.035);
    camera.position.copy(camPos.current);
    camera.lookAt(camLook.current);

    // ── Orbits & planet state ──────────────────────────────────────────────
    PLANETS.forEach((planet, i) => {
      const planetSec = i + 3;
      const focused = sec === planetSec;
      const solarVisible = sec >= 2;

      // Orbit angle
      if (focused) {
        // Lerp planet to front (PI/2 = positive z)
        const target = Math.PI / 2;
        let diff = target - orbitAngles.current[i];
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        orbitAngles.current[i] += diff * 0.025;
      } else {
        orbitAngles.current[i] += planet.orbitSpeed * dt * 0.22;
      }

      const angle = orbitAngles.current[i];
      const px = Math.cos(angle) * planet.orbitR;
      const pz = Math.sin(angle) * planet.orbitR;

      // Update group
      const group = planetGroupRefs.current[i];
      if (group) {
        group.position.set(px, 0, pz);

        const targetScale = focused ? 1.35 : 1.0;
        group.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.05
        );

        // Core mesh
        const core = group.children[0] as THREE.Mesh;
        if (core?.material) {
          const mat = core.material as THREE.MeshStandardMaterial;
          const targetOp = solarVisible ? 1 : 0;
          mat.opacity += (targetOp - mat.opacity) * 0.055;
          const targetEm = focused ? 1.1 : 0.25;
          mat.emissiveIntensity +=
            (targetEm - mat.emissiveIntensity) * 0.05;
        }

        // Focus glow
        const glow = group.children[1] as THREE.Mesh;
        if (glow?.material) {
          const mat = glow.material as THREE.MeshBasicMaterial;
          mat.opacity += ((focused ? 0.09 : 0) - mat.opacity) * 0.05;
        }

        // Atmosphere rim
        const rim = group.children[2] as THREE.Mesh;
        if (rim?.material) {
          const mat = rim.material as THREE.MeshBasicMaterial;
          mat.opacity +=
            ((focused ? 0.18 : solarVisible ? 0.04 : 0) - mat.opacity) *
            0.05;
        }
      }

      // Ring opacity
      const ringMat = ringMatRefs.current[i];
      if (ringMat) {
        const targetOp = solarVisible
          ? focused
            ? 0.18
            : 0.055
          : 0;
        ringMat.opacity += (targetOp - ringMat.opacity) * 0.055;
      }
    });
  });

  return (
    <>
      <Stars />
      <Sun />
      {PLANETS.map((planet, i) => (
        <group key={planet.name}>
          <OrbitRing
            radius={planet.orbitR}
            index={i}
            ringMatRefs={ringMatRefs}
          />
          <Planet
            planet={planet}
            index={i}
            planetGroupRefs={planetGroupRefs}
          />
        </group>
      ))}
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SpaceScene() {
  const mouse = useMousePosition();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "#040404",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50, near: 0.1, far: 600 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
