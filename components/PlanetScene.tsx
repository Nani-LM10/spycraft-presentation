"use client";

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Mesh, Group } from 'three';
import * as THREE from 'three';

const PLANETS = [
  "Mars", "Jupiter", "Saturn", "Neptune", "Earth"
];

function PlanetGroup({ activeIndex }: { activeIndex: number }) {
  const groupRef = useRef<Group>(null);
  
  // Load all textures
  const textures = useLoader(TextureLoader, PLANETS.map(p => `/planets/${p}.png`));
  
  // We use standard React refs to access the materials
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth endless rotation
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.05;
    }
    
    // Smoothly animate opacity for cross-fading
    materialsRef.current.forEach((mat, i) => {
      if (!mat) return;
      const targetOpacity = i === activeIndex ? 1 : 0;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08); // Butter smooth lerp
      
      // Prevent depth sorting issues with transparent overlapping objects
      mat.depthWrite = mat.opacity > 0.5; 
    });
  });

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => (
        <mesh key={i}>
          {/* Sphere size and segments */}
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial 
            ref={(el) => { if(el) materialsRef.current[i] = el; }}
            map={texture} 
            transparent={true} 
            opacity={i === 0 ? 1 : 0} 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PlanetScene({ activeIndex }: { activeIndex: number }) {
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        {/* Cinematic lighting to give the planets realistic 3D volume */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 3, 5]} intensity={2.5} />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <PlanetGroup activeIndex={activeIndex} />
        </Suspense>
      </Canvas>
    </div>
  );
}
