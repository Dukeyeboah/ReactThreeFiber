import teachShadersVertexShader from '../shaders/teachShaders/vertex.glsl?raw';
import teachShadersFragmentShader from '../shaders/teachShaders/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import * as THREE from 'three';

const TeachShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [window.innerWidth, window.innerHeight],
    uMouse: [0, 0],
    // wireframe:true,
    side: THREE.DoubleSide,
  },
  teachShadersVertexShader,
  teachShadersFragmentShader,
);
extend({ TeachShaderMaterial: TeachShaderMaterial });

export default function TeachShaders() {
  const materialRef = useRef();
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;  
    }
  });
  return (
    <mesh
      receiveShadow
      position={[0, -1.5, 0]}
      scale={[13, 13, 0.2]}
    >
      <planeGeometry args={[2, 2, 64, 64]} />
      {/* <teachShaderMaterial ref={materialRef} /> */}
      <meshStandardMaterial color='blue' wireframe />
    </mesh>
  );
}












