import vertexShader from '../shaders/firstShader/vertex.glsl?raw';
import fragmentShader from '../shaders/firstShader/fragment.glsl?raw';
// import terrainVertexShader from '../shaders/terrain/vertex.glsl?raw';
// import terrainFragmentShader from '../shaders/terrain/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three';

const MyShaderMaterial = shaderMaterial(
  // Uniforms object comes FIRST (plain values, not { value: ... } format)
  {
    // uFrequency: 1,
    uFrequency: new THREE.Vector2(1, 0.33),
    uAmplitude: 4.2,
    uTime: 0,
    uColorStart: new THREE.Color('#ffffff'),
    uColorEnd: new THREE.Color('#000000'),
    uTexture: new THREE.Texture(), // Will be set dynamically
    uUseTexture: 0.0, // 0 = false, 1 = true
  },
  // Vertex shader comes second
  vertexShader,
  // Fragment shader comes third
  fragmentShader
);

extend({ MyShaderMaterial: MyShaderMaterial });

export default function Shader() {
  const meshRef = useRef();
  const materialRef = useRef();

  // Load all textures (1.jpg through 6.jpg) and configure them
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures = {};

    for (let i = 1; i <= 6; i++) {
      const texture = loader.load(`/textures/${i}.jpg`);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      loadedTextures[i] = texture;
    }

    return loadedTextures;
  }, []);

  // Create default white texture once
  const defaultTexture = useMemo(() => {
    const texture = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1,
      THREE.RGBAFormat
    );
    return texture;
  }, []);

  // Leva GUI controls for Flag Shader
  const {
    frequencyX,
    frequencyY,
    animate,
    timeSpeed,
    colorStart,
    colorEnd,
    textureIndex,
    useTexture,
  } = useControls('Flag Shader', {
    // Wave frequency controls
    frequencyX: {
      value: 1,
      min: 0,
      max: 3,
      step: 0.1,
    },
    frequencyY: {
      value: 0.33,
      min: 0,
      max: 3,
      step: 0.1,
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
    // Texture controls
    useTexture: {
      value: false,
      label: 'Use Texture',
    },
    textureIndex: {
      value: 1,
      min: 1,
      max: 6,
      step: 1,
      label: 'Texture',
    },
    // Color controls
    colorStart: {
      value: '#ffffff',
      label: 'Color Start',
    },
    colorEnd: {
      value: '#000000',
      label: 'Color End',
    },
  });

  // Update material uniforms when controls change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uFrequency.set(frequencyX, frequencyY);
      materialRef.current.uColorStart.set(colorStart);
      materialRef.current.uColorEnd.set(colorEnd);

      // Update texture uniform based on selection
      if (useTexture && textures[textureIndex]) {
        materialRef.current.uTexture = textures[textureIndex];
        materialRef.current.uUseTexture = 1.0;
      } else {
        // Use default white texture if texture is disabled
        materialRef.current.uTexture = defaultTexture;
        materialRef.current.uUseTexture = 0.0;
      }

      // Notify Three.js that uniforms have changed
      materialRef.current.needsUpdate = true;
    }
  }, [
    frequencyX,
    frequencyY,
    colorStart,
    colorEnd,
    textureIndex,
    useTexture,
    textures,
    defaultTexture,
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
    <mesh
      ref={meshRef}
      receiveShadow
      position={[0, 0, 0]}
      scale={[10, 10, 0.2]}
    >
      {/* Increase segments for smoother terrain: [width, height, widthSegments, heightSegments] */}
      <planeGeometry args={[3, 3, 64, 64]} />
      <myShaderMaterial ref={materialRef} />
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
