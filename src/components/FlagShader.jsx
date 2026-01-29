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
    // UV-based frequency and time controls
    uUseUVFrequency: 0.0, // 0 = regular frequency, 1 = UV-based frequency
    uWaveTypeX: 0.0, // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
    uWaveTypeY: 0.0, // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
    uUseUVTime: 0.0, // 0 = regular time, 1 = UV-based time
    uUVTimeOffset: 2.0, // Amount of UV time offset
    uUVFreqMinX: 1.0, // Min frequency for UV-based X
    uUVFreqMaxX: 3.0, // Max frequency for UV-based X
    uUVFreqMinY: 1.0, // Min frequency for UV-based Y
    uUVFreqMaxY: 5.0, // Max frequency for UV-based Y
  },
  // Vertex shader comes second
  vertexShader,
  // Fragment shader comes third
  fragmentShader,
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
      THREE.RGBAFormat,
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
    useUVFrequency,
    waveTypeX,
    waveTypeY,
    useUVTime,
    uvTimeOffset,
    uvFreqMinX,
    uvFreqMaxX,
    uvFreqMinY,
    uvFreqMaxY,
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
    // UV-based frequency controls
    useUVFrequency: {
      value: false,
      label: 'Use UV-Based Frequency',
    },
    waveTypeX: {
      value: 'waveX',
      options: ['waveX', 'waveY', 'waveXY', 'waveYX', 'none'],
      label: 'Wave Type X',
    },
    waveTypeY: {
      value: 'waveY',
      options: ['waveX', 'waveY', 'waveXY', 'waveYX', 'none'],
      label: 'Wave Type Y',
    },
    uvFreqMinX: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'UV Freq Min X',
    },
    uvFreqMaxX: {
      value: 3.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'UV Freq Max X',
    },
    uvFreqMinY: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'UV Freq Min Y',
    },
    uvFreqMaxY: {
      value: 5.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'UV Freq Max Y',
    },
    // Time flow controls
    useUVTime: {
      value: false,
      label: 'Use UV-Based Time',
    },
    uvTimeOffset: {
      value: 2.0,
      min: 0,
      max: 10,
      step: 0.1,
      label: 'UV Time Offset',
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

  // Convert wave type string to number for shader
  const waveTypeToNumber = (type) => {
    switch (type) {
      case 'waveX':
        return 0.0;
      case 'waveY':
        return 1.0;
      case 'waveXY':
        return 2.0;
      case 'waveYX':
        return 3.0;
      case 'none':
        return 4.0;
      default:
        return 0.0;
    }
  };

  // Update material uniforms when controls change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uFrequency.set(frequencyX, frequencyY);
      materialRef.current.uColorStart.set(colorStart);
      materialRef.current.uColorEnd.set(colorEnd);
      materialRef.current.uUseUVFrequency = useUVFrequency ? 1.0 : 0.0;
      materialRef.current.uWaveTypeX = waveTypeToNumber(waveTypeX);
      materialRef.current.uWaveTypeY = waveTypeToNumber(waveTypeY);
      materialRef.current.uUseUVTime = useUVTime ? 1.0 : 0.0;
      materialRef.current.uUVTimeOffset = uvTimeOffset;
      materialRef.current.uUVFreqMinX = uvFreqMinX;
      materialRef.current.uUVFreqMaxX = uvFreqMaxX;
      materialRef.current.uUVFreqMinY = uvFreqMinY;
      materialRef.current.uUVFreqMaxY = uvFreqMaxY;

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
    useUVFrequency,
    waveTypeX,
    waveTypeY,
    useUVTime,
    uvTimeOffset,
    uvFreqMinX,
    uvFreqMaxX,
    uvFreqMinY,
    uvFreqMaxY,
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
