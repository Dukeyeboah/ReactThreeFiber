// import vertexShader from '../shaders/firstShader/vertex.glsl?raw';
// import fragmentShader from '../shaders/firstShader/fragment.glsl?raw';
import terrainVertexShader from '../shaders/terrain/vertex.glsl?raw';
import terrainFragmentShader from '../shaders/terrain/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';

// const MyShaderMaterial = shaderMaterial(
//     {
//         uTime: 0,
//         uColorStart: new THREE.Color('#ffffff'),
//         uColorEnd: new THREE.Color('#000000')
//     },
//     vertexShader,
//     fragmentShader);
//     extend({ MyShaderMaterial: MyShaderMaterial });

const TerrainShaderMaterial = shaderMaterial(
  {},
  terrainVertexShader,
  terrainFragmentShader
);

extend({ TerrainShaderMaterial: TerrainShaderMaterial });

export default function Shader() {
  const meshRef = useRef();

  useLayoutEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      const count = geometry.attributes.position.count;
      const randoms = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        randoms[i] = Math.random();
      }

      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
    }
  }, []);

  return (
    <mesh
      ref={meshRef}
      receiveShadow
      position={[0, -1.5, 0]}
      scale={[10, 10, 0.2]}
    >
      {/* Increase segments for smoother terrain: [width, height, widthSegments, heightSegments] */}
      <planeGeometry args={[2, 2, 64, 64]} />
      <terrainShaderMaterial />
    </mesh>
  );
}


// const myshaderMaterfialRef = useRef()
// return (
//   <mesh receiveShadow position={[0, -1.5, 0]} scale={[10,10, 0.2]}>
//     {/* <boxGeometry args={[1, 1, 1]} /> */}
//     <planeGeometry args={[3, 3]} />
//     {/* <meshStandardMaterial color='#888888' wireframe /> */}
//     {/* <meshStandardMaterial color='yellowGreen' /> */}
//     {/* <shaderMaterial 
//     vertexShader={vertexShader}
//     fragmentShader={fragmentShader}
//     /> */}
//     <myShaderMaterial ref={myshaderMaterfialRef} />
//   </mesh>
// );
// }