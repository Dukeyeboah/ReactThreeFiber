import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import beginVertexShader from '../shaders/beginShaders/vertex.glsl?raw';
import beginFragmentShader from '../shaders/beginShaders/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const BeginShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [window.innerWidth, window.innerHeight],
    uMouse: [0, 0],
    side: THREE.DoubleSide,
  },
  beginVertexShader,
  beginFragmentShader
);
extend({ BeginShaderMaterial: BeginShaderMaterial });

export default function Begin() {
 
  const materialRef = useRef();
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uResolution = [window.innerWidth, window.innerHeight];
      // console.log(materialRef.current.uResolution);

      // console.log(state.pointer.x, state.pointer.y);
    }
  });

  return (
    <mesh
      position={[0, -1.5, -0.5]}
      scale={[10, 10, 10]}
    //   rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* <planeGeometry args={[2, 2, 32,32]} /> */}
      <planeGeometry args={[2, 2,32,32]} />
      {/* <meshBasicMaterial color='blue' side={THREE.DoubleSide} /> */}
      <beginShaderMaterial ref={materialRef} />
    </mesh>
  );
}


















// import { shaderMaterial } from '@react-three/drei';
// import { extend, useFrame } from '@react-three/fiber';
// import { useRef } from 'react';
// import beginVertexShader from '../shaders/beginShaders/vertex.glsl?raw';
// import beginFragmentShader from '../shaders/beginShaders/fragment.glsl?raw';

// const BeginShaderMaterial = shaderMaterial(
//     {
//       uTime: 0,
//       // wireframe:true,
//     },
//     beginVertexShader,
//     beginFragmentShader,
//   );
//   extend({ BeginShaderMaterial: BeginShaderMaterial });

// const materialRef = useRef();
// useFrame((state) => {
//   // console.log(state)
//   if (materialRef.current) {
//     materialRef.current.uTime = state.clock.elapsedTime;
//   }
// });
// <beginPatternsShaderMaterial ref={materialRef} />





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
