import vertexShader from '../shaders/wavyOrbShader/vertex.glsl?raw';
import fragmentShader from '../shaders/wavyOrbShader/freagment.glsl?raw';
// import terrainVertexShader from '../shaders/terrain/vertex.glsl?raw';
// import terrainFragmentShader from '../shaders/terrain/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three';

const WavyOrbShaderMaterial = shaderMaterial(
  // Uniforms object comes FIRST (plain values, not { value: ... } format)
  {
    uTime: 0,
    uBigWavesElevation: 0.2,
    uBigWavesFrequency: new THREE.Vector3(1.5, 1.5, 1.5),
    uBigWavesSpeed: 0.75,
    uSmallWavesElevation: 0.15,
    uSmallWavesFrequency: 3.0,
    uSmallWavesSpeed: 0.2,
    uSmallWavesIterations: 4.0,
    uDepthColor: new THREE.Color('#1e3a8a'),
    uSurfaceColor: new THREE.Color('#3b82f6'),
    uColorOffset: 0.5,
    uColorMultiplier: 4.0,
  },
  // Vertex shader comes second
  vertexShader,
  // Fragment shader comes third
  fragmentShader
);

extend({ WavyOrbShaderMaterial: WavyOrbShaderMaterial });

export default function WavyBall() {
  const meshRef = useRef();
  const materialRef = useRef();

  // Leva GUI controls for Wavy Orb Shader
  const {
    bigWavesElevation,
    bigWavesFrequencyX,
    bigWavesFrequencyY,
    bigWavesFrequencyZ,
    bigWavesSpeed,
    smallWavesElevation,
    smallWavesFrequency,
    smallWavesSpeed,
    smallWavesIterations,
    depthColor,
    surfaceColor,
    colorOffset,
    colorMultiplier,
    animate,
    timeSpeed,
  } = useControls('Wavy Orb Shader', {
    // Big waves controls
    bigWavesElevation: {
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Big Waves Elevation',
    },
    bigWavesFrequencyX: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Big Waves Freq X',
    },
    bigWavesFrequencyY: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Big Waves Freq Y',
    },
    bigWavesFrequencyZ: {
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Big Waves Freq Z',
    },
    bigWavesSpeed: {
      value: 0.75,
      min: 0,
      max: 2,
      step: 0.05,
      label: 'Big Waves Speed',
    },
    // Small waves controls
    smallWavesElevation: {
      value: 0.15,
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Small Waves Elevation',
    },
    smallWavesFrequency: {
      value: 3.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'Small Waves Frequency',
    },
    smallWavesSpeed: {
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'Small Waves Speed',
    },
    smallWavesIterations: {
      value: 4,
      min: 0,
      max: 10,
      step: 1,
      label: 'Small Waves Iterations',
    },
    // Color controls
    depthColor: {
      value: '#1e3a8a',
      label: 'Depth Color',
    },
    surfaceColor: {
      value: '#3b82f6',
      label: 'Surface Color',
    },
    colorOffset: {
      value: 0.5,
      min: -2,
      max: 2,
      step: 0.1,
      label: 'Color Offset',
    },
    colorMultiplier: {
      value: 4.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'Color Multiplier',
    },
    // Animation controls
    animate: {
      value: true,
      label: 'Animate',
    },
    timeSpeed: {
      value: 1,
      min: -3,
      max: 3,
      step: 0.1,
      label: 'Time Speed',
    },
  });

  // Update material uniforms when controls change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uBigWavesElevation = bigWavesElevation;
      materialRef.current.uBigWavesFrequency.set(
        bigWavesFrequencyX,
        bigWavesFrequencyY,
        bigWavesFrequencyZ
      );
      materialRef.current.uBigWavesSpeed = bigWavesSpeed;
      materialRef.current.uSmallWavesElevation = smallWavesElevation;
      materialRef.current.uSmallWavesFrequency = smallWavesFrequency;
      materialRef.current.uSmallWavesSpeed = smallWavesSpeed;
      materialRef.current.uSmallWavesIterations = smallWavesIterations;
      materialRef.current.uDepthColor.set(depthColor);
      materialRef.current.uSurfaceColor.set(surfaceColor);
      materialRef.current.uColorOffset = colorOffset;
      materialRef.current.uColorMultiplier = colorMultiplier;

      // Notify Three.js that uniforms have changed
      materialRef.current.needsUpdate = true;
    }
  }, [
    bigWavesElevation,
    bigWavesFrequencyX,
    bigWavesFrequencyY,
    bigWavesFrequencyZ,
    bigWavesSpeed,
    smallWavesElevation,
    smallWavesFrequency,
    smallWavesSpeed,
    smallWavesIterations,
    depthColor,
    surfaceColor,
    colorOffset,
    colorMultiplier,
  ]);

  // Animate uTime each frame for waving motion (if animate is enabled)
  useFrame((state) => {
    if (materialRef.current) {
      if (animate) {
        // When animated: use elapsed time multiplied by timeSpeed
        // Positive timeSpeed = forward, negative = backward
        materialRef.current.uTime = state.clock.elapsedTime * timeSpeed;
      } else {
        // When not animated: keep uTime at 0 (static flag)
        materialRef.current.uTime = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} receiveShadow position={[0, 0, 0]} scale={[1, 1, 1]}>
      <sphereGeometry args={[1, 128, 128]} />
      <wavyOrbShaderMaterial ref={materialRef} />
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
