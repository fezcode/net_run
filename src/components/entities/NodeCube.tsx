import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NodeCubeProps {
  letter: string;
  status: 'none' | 'correct' | 'misplaced' | 'wrong';
  position: [number, number, number];
}

export function NodeCube({ letter, status, position }: NodeCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colors = {
    none: '#222',
    correct: '#00ff00',
    misplaced: '#ffff00',
    wrong: '#ff0000',
  };

  const statusColor = colors[status];

  useFrame(() => {
    if (meshRef.current) {
      if (status !== 'none') {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          Math.PI * 2,
          0.1
        );
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position} ref={meshRef}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <MeshWobbleMaterial
          color={statusColor}
          factor={status === 'none' ? 0.05 : 0.2}
          speed={2}
          wireframe={status === 'none'}
          transparent
          opacity={status === 'none' ? 0.4 : 0.8}
        />
        {letter && (
          <Text
            position={[0, 0, 0.51]}
            fontSize={0.6}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {letter}
          </Text>
        )}
      </mesh>
    </Float>
  );
}
