import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, getColorScheme } from '../../game/store';

interface NodeCubeProps {
  letter: string;
  status: 'none' | 'correct' | 'misplaced' | 'wrong';
  position: [number, number, number];
  isCurrentFocus?: boolean;
}

export function NodeCube({ letter, status, position, isCurrentFocus }: NodeCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cursorRef = useRef<THREE.Mesh>(null);
  const colorBlindMode = useGameStore(s => s.colorBlindMode);

  const colors = getColorScheme(colorBlindMode);

  let statusColor = '#888';
  if (status === 'correct') statusColor = colors.correct.hexShadow;
  else if (status === 'misplaced') statusColor = colors.misplaced.hexShadow;
  else if (status === 'wrong') statusColor = colors.wrong.hexShadow;

  useFrame((state) => {
    if (meshRef.current) {
      if (status !== 'none') {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          Math.PI * 2,
          0.1
        );
      }
    }
    
    if (cursorRef.current) {
      cursorRef.current.visible = !!isCurrentFocus && Math.floor(state.clock.elapsedTime * 4) % 2 === 0;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh ref={meshRef}>
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
        
        {/* Input Cursor Indicator */}
        {isCurrentFocus && !letter && (
          <mesh ref={cursorRef} position={[0, 0, 0.5]}>
            <planeGeometry args={[0.5, 0.1]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
    </Float>
  );
}
