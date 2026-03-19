import { Canvas, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { NodeGrid } from './components/environment/NodeGrid';
import { HUD } from './components/ui/HUD';
import { KeyboardHandler } from './components/ui/KeyboardHandler';
import { AudioPlayer } from './components/ui/AudioPlayer';
import { useGameStore } from './game/store';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

function Scene() {
  const gameStatus = useGameStore(s => s.gameStatus);
  const glitchActive = useGameStore(s => s.glitchActive);
  const virtualKeyboardEnabled = useGameStore(s => s.virtualKeyboardEnabled);
  const { viewport } = useThree();

  const isMobile = window.innerWidth < 768;
  const spacing = isMobile ? 0.9 : 1.2;
  const gridWidth = 5 * spacing;
  const gridHeight = 6 * spacing;

  // Estimated margins in Three.js units
  const topMargin = isMobile ? 1.4 : 2.2;
  const bottomMargin = isMobile 
    ? (virtualKeyboardEnabled ? 3.8 : 1.8) 
    : (virtualKeyboardEnabled ? 3.2 : 1.8);

  const availableHeight = viewport.height - topMargin - bottomMargin;
  const availableWidth = viewport.width - 1.0;
  
  const responsiveScale = useMemo(() => {
    const scaleW = availableWidth / gridWidth;
    const scaleH = availableHeight / gridHeight;
    return Math.min(scaleW, scaleH, 1.0);
  }, [availableWidth, availableHeight, gridWidth, gridHeight]);

  const responsivePosition = useMemo(() => {
    // Top boundary is viewport.height/2 - topMargin
    // Bottom boundary is -viewport.height/2 + bottomMargin
    // Center point between these boundaries:
    const topLimit = viewport.height / 2 - topMargin;
    const bottomLimit = -viewport.height / 2 + bottomMargin;
    const center = (topLimit + bottomLimit) / 2;
    return new THREE.Vector3(0, center, 0);
  }, [viewport.height, topMargin, bottomMargin]);

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 25]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff00ff" />
      
      <group scale={responsiveScale} position={responsivePosition}>
        <NodeGrid />
      </group>
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <EffectComposer>
        <Bloom 
          intensity={1.5} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          mipmapBlur 
        />
        <Noise opacity={0.05} />
        <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        <Glitch 
          delay={new THREE.Vector2(0, 0)} 
          duration={new THREE.Vector2(0.3, 0.6)} 
          strength={new THREE.Vector2(0.3, 1.0)} 
          mode={1}
          active={glitchActive || gameStatus === 'failed'}
        />
      </EffectComposer>
    </>
  );
}

export function App() {
  const initGame = useGameStore(s => s.initGame);

  useEffect(() => {
    initGame(); 
  }, [initGame]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden select-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
        <Scene />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 2.2}
          maxAzimuthAngle={Math.PI / 10}
          minAzimuthAngle={-Math.PI / 10}
        />
      </Canvas>
      <HUD />
      <KeyboardHandler />
      <AudioPlayer />
    </div>
  );
}

export default App;
