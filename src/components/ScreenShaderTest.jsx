import { extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { useRef } from 'react';

import screenVertexShader from '../shaders/screenShader/vertex.glsl?raw';
import screenFragmentShader from '../shaders/screenShader/fragment.glsl?raw';
import * as THREE from 'three';

const ScreenShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [1, 1],
    // side: THREE.DoubleSide,
  },
  screenVertexShader,
  screenFragmentShader,
  
);
extend({ ScreenShaderMaterial: ScreenShaderMaterial });

export default function ScreenShaderTest() {
  const materialRef = useRef();
  const { size, viewport } = useThree();

  console.log(viewport.height)

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uTime = state.clock.elapsedTime *0.6;
    materialRef.current.uResolution = [size.width, size.height];
  });

  return (
    <mesh frustumCulled={false} position={[0, 0, 0]}rotation={[0,Math.PI,0]} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <screenShaderMaterial
        ref={materialRef}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

