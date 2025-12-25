import * as THREE from 'three';
import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';

// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

export default function Sphere({ position = [0, 0, 0] }) {
  // useFrame((state)=>{
  //     console.log(state)
  //     state.camera.position.z =Math.sin(state.clock.elapsedTime * 0.1)
  //     state.camera.position.x =Math.cos(state.clock.elapsedTime * 0.1)
  //     state.camera.lookAt(0,0,0)

  // })
  useFrame((state) => {
    ball1ref.current.position.y = Math.abs(
      2.2 * Math.cos(state.clock.elapsedTime * 1)
    );
    ball1ref.current.position.x = 2.2 * Math.cos(state.clock.elapsedTime * 0.1);
    ball1ref.current.position.z = -(
      2.2 * Math.sin(state.clock.elapsedTime * 0.1)
    );
    ball2ref.current.position.y = Math.abs(
      2.2 * Math.cos(state.clock.elapsedTime * 1 + Math.PI / 2)
    );
    ball2ref.current.position.x = -(
      2.2 * Math.cos(state.clock.elapsedTime * 0.1)
    );
    ball2ref.current.position.z = 2.2 * Math.sin(state.clock.elapsedTime * 0.1);
  });
  const ball1ref = useRef();
  const ball2ref = useRef();
  return (
    <>
      <mesh ref={ball1ref} position={position} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
      <mesh ref={ball2ref} position={[-3, 4, 0]} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
    </>
  );
}
