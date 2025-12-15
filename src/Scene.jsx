import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Sphere from './components/Sphere';
import Box from './components/Box';
import Floor from './components/Floor';
import CustomObject from './components/CustomObject';
// import * as THREE from 'three';



export default function Scene() {
    // const cameraRef = useRef();
   

   
  return (
    <Canvas
    // gl={ {
    //     antialias: true,
    //     toneMapping: THREE.CineonToneMapping
    //     outputCOlorSpace:THREE.SRGBColorSpace
    // } }
      //dpr={[1,2]} //default set by three fiber
      camera={{ position: [0, 0, 10], fov: 45 , near:0.1, far:1000}}
      style={{ width: '100%', height: '100vh' }}
    >
      <color attach='background' args={['#ffffff']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2.1} />

      <Sphere position={[-1.75, 0, 0]} />
      <Box position={[1.75, 0, 0]} />
      <CustomObject/>
      {/* <Floor position={[0, -1.5, 0]} /> */}

      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
