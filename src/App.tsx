import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { NodeGrid } from './components/environment/NodeGrid';
import { HUD } from './components/ui/HUD';
import { KeyboardHandler } from './components/ui/KeyboardHandler';
import { useGameStore } from './game/store';
import { useEffect } from 'react';
import * as THREE from 'three';

function Scene() {
  const gameStatus = useGameStore(s => s.gameStatus);

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 20]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ff00ff" />
      
      <NodeGrid />
      
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
          active={gameStatus === 'failed'}
          delay={new THREE.Vector2(0.1, 0.5)} 
          duration={new THREE.Vector2(0.1, 0.3)} 
          strength={new THREE.Vector2(0.3, 1.0)} 
        />
      </EffectComposer>
    </>
  );
}

export function App() {
  const initGame = useGameStore(s => s.initGame);

  useEffect(() => {
    initGame(); // No argument = random word
  }, [initGame]);

  return (
    <div className="w-full h-screen bg-black overflow-hidden select-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
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
    </div>
  );
}

export default App;
