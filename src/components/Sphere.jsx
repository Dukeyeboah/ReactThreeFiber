 import * as THREE from 'three';
 import { useRef } from 'react';
 import { useHelper } from '@react-three/drei';
// import {useFrame} from '@react-three/fiber'

// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

export default function Sphere({ position = [0, 0, 0] }) {
    // useFrame((state)=>{
    //     console.log(state)
    //     state.camera.position.z =Math.sin(state.clock.elapsedTime * 0.1)
    //     state.camera.position.x =Math.cos(state.clock.elapsedTime * 0.1)
    //     state.camera.lookAt(0,0,0)

    // })
    const directionalLight = useRef()
  useHelper(directionalLight, THREE.DirectionalLightHelper, 3)

  return (
    // <mesh position={position} geometry={sphereGeometry}>
    <mesh position={position} scale={0.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color='#111111' wireframe />
      <directionalLight ref={directionalLight} position={[5, 5, 5]} intensity={2.1} />
    </mesh>
  );
}
