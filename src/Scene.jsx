import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  PivotControls,
  Float,
  MeshReflectorMaterial,
} from '@react-three/drei';
import Sphere from './components/Sphere';
import Box from './components/Box';
import Floor from './components/Floor';
import CustomObject from './components/CustomObject';
// import * as THREE from 'three';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useControls, button } from 'leva';
import { Perf } from 'r3f-perf';

export default function Scene() {
  // const cameraRef = useRef();
  const sphereRef = useRef();
  //   const controls = useControls({
  //     position: -2,
  //   })

  const { perfVisible } = useControls({ perfVisible: false });
  const { position, color, visible } = useControls('sphere folder', {
    visible: true,
    position: {
      value: { x: -2, y: 1 },
      min: -4,
      max: 5,
      step: 0.01,
      joystick: 'invertY',
    },
    color: 'green',
    choice: { options: ['red', 'green', 'blue'] },
    clickMe: button(() => {
      console.log('button clicked');
    }),
    //options:['#111111', '#222222', '#333333']
  });

  return (
    <Canvas
      // gl={ {
      //     antialias: true,
      //     toneMapping: THREE.CineonToneMapping
      //     outputCOlorSpace:THREE.SRGBColorSpace
      // } }
      //dpr={[1,2]} //default set by three fiber
      camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 1000 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <color attach='background' args={['#ffffff']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={2.1} />

      <Sphere position={[-1.75, 0, 0]} />

      <mesh
        ref={sphereRef}
        position={[position.x, position.y, 0]}
        scale={0.5}
        visible={visible}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      {/* <TransformControls object={sphereRef} mode='translate' /> */}
      <Box position={[1.75, 0, 0]} />
      {/* <CustomObject/> */}
      {/* <Floor position={[0, -1.5, 0]} /> */}
      {/* <PivotControls
        anchor={[0, 0, 0]}
        depthTest={false}
        lineWidth={4}
        axisColors={['#9381ff', '#ff4d6d', '#7ae582']}
        scale={100}
        fixed={true}
        hidden={true}
      >
        <Float speed={5} floatIntensity={2}>
          <mesh position-x={-3} scale={0.3}>
            <sphereGeometry />
            <meshStandardMaterial color='orange' />
          </mesh>
        </Float>
      </PivotControls> */}
      <mesh position={[0, -1.5, 0]} scale={[200, 1, 200]}>
        <boxGeometry args={[1, 1, 1]} />
        {/* <meshStandardMaterial color='#888888' wireframe /> */}
        {/* <meshStandardMaterial color='pink' /> */}
        <MeshReflectorMaterial
          mirror={0.5}
          color='white'
          //   metalness={0.5}
          //   roughness={0.5}
          blur={[1000, 500]}
          mixBlur={30}
          //   mixStrength={60}
          //   mixContrast={1}
          //   resolution={1024}
          //   depthScale={0.01}
          //   minDepthThreshold={0.9}
          //   maxDepthThreshold={1}
        />
      </mesh>

      {perfVisible && <Perf position='top-left' />}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
