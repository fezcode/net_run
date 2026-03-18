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
  const { viewport } = useThree();
  
  const responsiveScale = useMemo(() => {
    return Math.min(viewport.width / 6, 1);
  }, [viewport.width]);

  const responsivePosition = useMemo(() => {
    if (window.innerWidth < 768) {
      // Top row center is at (6-1) * (0.9/2) = 2.25
      // Plus half a cube height at 0.75 scale: 0.9 * 0.75 / 2 = 0.3375
      // Total top edge = 2.5875 relative to NodeGrid center
      const gridTopOffset = 2.5875 * responsiveScale;
      // Subtract a larger margin (0.8 instead of 0.2) to move it "a little down"
      return new THREE.Vector3(0, (viewport.height / 2) - gridTopOffset - 0.8, 0);
    }
    return new THREE.Vector3(0, 0, 0);
  }, [viewport.width, viewport.height, responsiveScale]);

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
