import testPatternsVertexShader from '../shaders/testpatterns/vertex.glsl?raw';
import testPatternsFragmentShader from '../shaders/testpatterns/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

import * as THREE from 'three';

const TestPatternsShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    // wireframe:true,

    // uMouse: new THREE.Vector2(),
  },
  testPatternsVertexShader,
  testPatternsFragmentShader,
);
extend({ TestPatternsShaderMaterial: TestPatternsShaderMaterial });

export default function Shader() {
  const materialRef = useRef();
  useFrame((state) => {
    // console.log(state)
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });
  return (
    <mesh
      // ref={meshRef}
      receiveShadow
      position={[0, -1.5, 0]}
      scale={[13, 13, 0.2]}
    >
      <planeGeometry args={[2, 2, 64, 64]} />
      <testPatternsShaderMaterial ref={materialRef} />
      {/* <meshStandardMaterial color='red' wireframe /> */}
    </mesh>
  );
}

// import { useRef } from 'react';

// const meshRef = useRef();
//   const materialRef = useRef();

//   // Animate uTime each frame for waving motion (if animate is enabled)
//   useFrame((state) => {
//     if (materialRef.current) {
//       if (materialRef.current) {
//         // When animated: use elapsed time multiplied by timeSpeed
//         // Positive timeSpeed = forward, negative = backward
//         materialRef.current.uTime = state.clock.elapsedTime * 2;
//         materialRef.current.uMouse = state.mouse;
//       } else {
//         // When not animated: keep uTime at 0 (static flag)
//         materialRef.current.uTime = 0;
//       }
//     }
//   });

// const MyShaderMaterial = shaderMaterial(
//     {
//         uTime: 0,
//         uColorStart: new THREE.Color('#ffffff'),
//         uColorEnd: new THREE.Color('#000000')
//     },
//     vertexShader,
//     fragmentShader);
//     extend({ MyShaderMaterial: MyShaderMaterial });

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
