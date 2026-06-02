"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "@/lib/useMousePosition";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Node {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  connections: number[];
  pulseOffset: number;
  cluster: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NODE_COUNT = 280;
const PARTICLE_COUNT = 600;
const CLUSTER_COUNT = 6;
const BOUNDS = 18;
const CONNECTION_DISTANCE = 3.8;
const ACCENT = new THREE.Color("#6EE7FF");
const ACCENT_DIM = new THREE.Color("#1a4a5c");
const SIGNAL_COLOR = new THREE.Color("#6EE7FF");

// ─── Nodes mesh ──────────────────────────────────────────────────────────────

function Nodes({ nodes, mouse }: { nodes: Node[]; mouse: React.MutableRefObject<{ nx: number; ny: number }> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArr = useMemo(() => new Float32Array(NODE_COUNT * 3), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mesh = meshRef.current;
    if (!mesh) return;

    nodes.forEach((node, i) => {
      // Gentle drift
      node.position.add(node.velocity);

      // Bounds wrap
      ["x", "y", "z"].forEach((axis) => {
        const a = axis as "x" | "y" | "z";
        if (node.position[a] > BOUNDS) node.position[a] = -BOUNDS;
        if (node.position[a] < -BOUNDS) node.position[a] = BOUNDS;
      });

      // Mouse influence
      const mx = mouse.current.nx * 2;
      const my = mouse.current.ny * 2;
      const dx = mx - node.position.x * 0.1;
      const dy = my - node.position.y * 0.1;
      node.velocity.x += dx * 0.0001;
      node.velocity.y += dy * 0.0001;
      node.velocity.clampLength(0, 0.012);

      // Scale pulse
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + node.pulseOffset);
      const scale = 0.04 + pulse * 0.03;
      dummy.position.copy(node.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color — accent for active nodes
      const activity = 0.3 + pulse * 0.7;
      const col = new THREE.Color().lerpColors(ACCENT_DIM, ACCENT, activity * 0.6);
      col.toArray(colorArr, i * 3);
    });

    mesh.setColorAt(0, new THREE.Color());
    if (mesh.instanceColor) {
      mesh.instanceColor.array.set(colorArr);
      mesh.instanceColor.needsUpdate = true;
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
}

// ─── Connections ─────────────────────────────────────────────────────────────

function Connections({ nodes }: { nodes: Node[] }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const posArr = useMemo(() => {
    // Pre-compute connections
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (const j of nodes[i].connections) {
        if (j > i) pairs.push([i, j]);
      }
    }
    return { pairs, positions: new Float32Array(pairs.length * 6) };
  }, [nodes]);

  useFrame(({ clock }) => {
    const line = lineRef.current;
    if (!line) return;
    const t = clock.getElapsedTime();
    const { pairs, positions } = posArr;

    pairs.forEach(([i, j], idx) => {
      const a = nodes[i].position;
      const b = nodes[j].position;
      positions[idx * 6 + 0] = a.x;
      positions[idx * 6 + 1] = a.y;
      positions[idx * 6 + 2] = a.z;
      positions[idx * 6 + 3] = b.x;
      positions[idx * 6 + 4] = b.y;
      positions[idx * 6 + 5] = b.z;
    });

    const geo = line.geometry as THREE.BufferGeometry;
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    attr.array.set(positions);
    attr.needsUpdate = true;

    // Animate opacity
    const mat = line.material as THREE.LineBasicMaterial;
    mat.opacity = 0.10 + 0.04 * Math.sin(t * 0.5);
  });

  const maxPairs = useMemo(() => {
    let count = 0;
    for (const node of nodes) count += node.connections.length;
    return Math.ceil(count / 2);
  }, [nodes]);

  const initPositions = useMemo(() => new Float32Array(maxPairs * 6), [maxPairs]);

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initPositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={ACCENT} transparent opacity={0.1} />
    </lineSegments>
  );
}

// ─── Signal particles ─────────────────────────────────────────────────────────

function SignalParticles({ nodes }: { nodes: Node[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (const j of nodes[i].connections) {
        if (j > i) pairs.push([i, j]);
      }
    }
    return Array.from({ length: PARTICLE_COUNT }, (_, k) => ({
      pair: pairs[k % pairs.length] ?? [0, 1],
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      size: 0.015 + Math.random() * 0.02,
    }));
  }, [nodes]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    particles.forEach((p, i) => {
      p.t += p.speed;
      if (p.t > 1) p.t -= 1;

      const [ai, bi] = p.pair;
      const a = nodes[ai]?.position;
      const b = nodes[bi]?.position;
      if (!a || !b) return;

      const pos = new THREE.Vector3().lerpVectors(a, b, p.t);
      dummy.position.copy(pos);
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color={SIGNAL_COLOR} transparent opacity={0.9} />
    </instancedMesh>
  );
}

// ─── Camera controller ────────────────────────────────────────────────────────

function CameraController({
  mouse,
}: {
  mouse: React.MutableRefObject<{ nx: number; ny: number }>;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const camPos = useRef(new THREE.Vector3(0, 0, 22));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Slow cinematic drift
    const driftX = Math.sin(t * 0.07) * 3;
    const driftY = Math.cos(t * 0.05) * 1.5;
    const driftZ = 22 + Math.sin(t * 0.04) * 2;

    // Mouse influence (subtle)
    const targetX = driftX + mouse.current.nx * 1.5;
    const targetY = driftY + mouse.current.ny * 1.0;

    camPos.current.x += (targetX - camPos.current.x) * 0.025;
    camPos.current.y += (targetY - camPos.current.y) * 0.025;
    camPos.current.z += (driftZ - camPos.current.z) * 0.02;

    camera.position.copy(camPos.current);
    camera.lookAt(target.current);
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({ mouse }: { mouse: React.MutableRefObject<{ nx: number; ny: number }> }) {
  const nodes = useMemo<Node[]>(() => {
    const centers = Array.from({ length: CLUSTER_COUNT }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * BOUNDS * 1.2,
        (Math.random() - 0.5) * BOUNDS * 0.8,
        (Math.random() - 0.5) * BOUNDS * 0.6
      )
    );

    const ns: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => {
      const cluster = i % CLUSTER_COUNT;
      const center = centers[cluster];
      return {
        position: new THREE.Vector3(
          center.x + (Math.random() - 0.5) * 6,
          center.y + (Math.random() - 0.5) * 6,
          center.z + (Math.random() - 0.5) * 4
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.003
        ),
        connections: [],
        pulseOffset: Math.random() * Math.PI * 2,
        cluster,
      };
    });

    // Build connections within clusters + some cross-cluster
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dist = ns[i].position.distanceTo(ns[j].position);
        const sameCluster = ns[i].cluster === ns[j].cluster;
        const threshold = sameCluster ? CONNECTION_DISTANCE : CONNECTION_DISTANCE * 0.5;
        if (dist < threshold && ns[i].connections.length < 6) {
          ns[i].connections.push(j);
          ns[j].connections.push(i);
        }
      }
    }

    return ns;
  }, []);

  return (
    <>
      <CameraController mouse={mouse} />
      <Nodes nodes={nodes} mouse={mouse} />
      <Connections nodes={nodes} />
      <SignalParticles nodes={nodes} />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NetworkScene() {
  const mouse = useMousePosition();

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
