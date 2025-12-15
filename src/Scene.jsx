import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Sphere from './components/Sphere';
import Box from './components/Box';




export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <color attach='background' args={['#ffffff']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />

      <Sphere position={[-1.75, 0, 0]} />
      <Box />

      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
