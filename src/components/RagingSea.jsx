import ragingSeaVertexShader from '../shaders/ragingSea/ragingSeaVertex.glsl?raw';
import ragingSeaFragmentShader from '../shaders/ragingSea/ragingSeaFragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useControls, button } from 'leva';
import * as THREE from 'three';
import { useAudioAnalyser } from '../hooks/useAudioAnalyser';
import { useMicrophoneAnalyser } from '../hooks/useMicrophoneAnalyser';

const RagingSeaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uBgWvElev: 0.8,
    uBgWvFreq: new THREE.Vector3(0.2, 0.25, 0.3),
    uBgWvSpeeds: new THREE.Vector3(0.8, 0.5, 0.5),
    uColorSurf: new THREE.Color('#9bd8ff'),
    uColorDepth: new THREE.Color('#186691'),
    uElevationMultiplier: 1.0,
    uElevationOffset: 1.0,
    uSmWvElev: 1.05,
    uSmWvFreq: 3.0,
    uSmWvSpeed: 0.5,
    uSmWvIterations: 2.0,
    uReactivity:false,

    // side:THREE.DoubleSide,
    wireframe:true,
    // uMouse: new THREE.Vector2(),
  },
  ragingSeaVertexShader,
  ragingSeaFragmentShader,
);
extend({ RagingSeaShaderMaterial: RagingSeaShaderMaterial });

// Default audio path - add your .mp3 or .wav to public/audio/
const DEFAULT_AUDIO_PATH = '/audio/intoSpace.mp3';

export default function Shader() {
  const materialRef = useRef();

  // First get reactive control values (no refs - satisfies react-hooks/refs rule)
  const reactiveControls = useControls('Reactive Controls', {
    reactivity: { value: false, label: 'Reactivity' },
    source: {
      value: 'Audio',
      options: ['Audio', 'Mic'],
      label: 'Source',
    },
    audioPath: { value: DEFAULT_AUDIO_PATH, label: 'Audio Path' },
    reactivityStrength: { value: 3.0, min: 0, max: 10, step: 0.25, label: 'Strength' },
  });
  const { reactivity, source, audioPath, reactivityStrength } = reactiveControls;

  const audioAnalyser = useAudioAnalyser(
    source === 'Audio' ? audioPath : null,
    { smoothingOut: 0.25 }
  );
  const microphoneAnalyser = useMicrophoneAnalyser(source === 'Mic', { smoothingOut: 0.25 });

  const onStart = () => {
    if (source === 'Audio') audioAnalyser.play();
    else if (source === 'Mic') microphoneAnalyser.start();
  };
  const onStop = () => {
    if (source === 'Audio') audioAnalyser.pause();
    else if (source === 'Mic') microphoneAnalyser.stop();
  };

  useControls('Reactive Controls', {
    '▶ Start': button(onStart),
    '■ Stop': button(onStop),
  });

  const {
    bgWvElev,
    bgWvFreq,
    bgWvSpeeds,
    surfColor,
    depthColor,
    elevationMultiplier,
    elevationOffset,
  } = useControls('Big Wave Controls', {
    // Wave frequency controls
    bgWvElev: {
      value: 0.5,
      min: 0,
      max: 10,
      step: 0.1,
    },
    bgWvFreq: {
      value: new THREE.Vector3(0.8, 0.25, 0.6),
      min: 0,
      max: 10,
      step: 0.1,
    },
    bgWvSpeeds: {
      value: new THREE.Vector3(0.8, 0.5, 0.5),
      min: 0,
      max: 10,
      step: 0.1,
    },
    surfColor: {
      // value: '#8888ff',
      value: '#9bd8ff',
      label: 'SurfaceColor',
    },
    depthColor: {
      // value: '#0000ff',
      value: '#186691',
      label: 'DepthColor',
    },
    elevationMultiplier: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.01,
    },
    elevationOffset: {
      value: 1.0,
      min: 0,
      max: 2,
      step: 0.001,
    },
    
  });

  const { smWvElev, smWvFreq, smWvSpeed, smWvIterations } = useControls(
    'Small Wave Controls',
    {
      smWvElev: {
        value: 1.05,
        min: 0,
        max: 3,
        step: 0.01,
      },
      smWvFreq: {
        value: 3.5,
        min: 0,
        max: 20,
        step: 0.01,
      },
      smWvSpeed: {
        value: 0.8,
        min: 0,
        max: 5,
        step: 0.01,
      },
      smWvIterations: {
        value: 2.0,
        min: 0,
        max: 5,
        step: 1,
      },
    },
  );

  useFrame((state) => {
    if (!materialRef.current) return;

    let bgElev = bgWvElev;
    let bgFreq = bgWvFreq;
    let bgSpeeds = bgWvSpeeds;
    let smElev = smWvElev;
    let smFreq = smWvFreq;
    let smSpeed = smWvSpeed;

    if (reactivity) {
      const { amplitude, bass, mid, treble } = source === 'Audio'
        ? audioAnalyser.getValues()
        : microphoneAnalyser.getValues();
      const s = reactivityStrength;

      const bassBoost = 0.5 + bass * s * 2.5; // Bass = taller waves
      const midBoost = 0.8 + mid * s * 0.8; // Mid = tighter/looser wave pattern
      const ampBoost = 0.7 + amplitude * s * 1.5; // Volume = faster movement

      bgElev = bgWvElev * bassBoost;
      bgFreq = new THREE.Vector3(
        bgWvFreq.x * midBoost,
        bgWvFreq.y * midBoost,
        bgWvFreq.z * midBoost
      );
      bgSpeeds = new THREE.Vector3(
        bgWvSpeeds.x * ampBoost,
        bgWvSpeeds.y * ampBoost,
        bgWvSpeeds.z * ampBoost
      );

      const detailBoost = 0.6 + (amplitude * 0.9 + treble * 0.9) * s * 2.0;
      smElev = smWvElev * detailBoost;
      smFreq = smWvFreq * (0.9 + treble * s * 0.5); // Treble = finer details
      smSpeed = smWvSpeed * detailBoost;
    }

    materialRef.current.uTime = state.clock.elapsedTime;
    materialRef.current.uBgWvElev = bgElev;
    materialRef.current.uBgWvFreq = bgFreq;
    materialRef.current.uBgWvSpeeds = bgSpeeds;
    materialRef.current.uColorSurf.set(surfColor);
    materialRef.current.uColorDepth.set(depthColor);
    materialRef.current.uElevationMultiplier = elevationMultiplier;
    materialRef.current.uElevationOffset = elevationOffset;
    materialRef.current.uSmWvElev = smElev;
    materialRef.current.uSmWvFreq = smFreq;
    materialRef.current.uSmWvSpeed = smSpeed;
    materialRef.current.uSmWvIterations = smWvIterations;
    materialRef.current.uReactivity = reactivity;
  });

  return (
    <mesh
      //ref={meshRef}
      receiveShadow
      position={[0, -5.0, 0]}
      scale={[12, 12, 0.2]}
      rotation-x={-Math.PI / 2}
    >
      <planeGeometry args={[2, 2, 512, 512]} />
      <ragingSeaShaderMaterial ref={materialRef} />
      {/* <meshStandardMaterial color='white' /> */}
    </mesh>
  );
}


    // OLD (one-directional: only height + speed changed):
      // const bassBoost = 0.5 + bass * s * 2.5;
      // const ampBoost = 0.7 + amplitude * s * 1.5;
      // const trebleBoost = 0.6 + treble * s * 2.0;
      // bgElev = bgWvElev * bassBoost;
      // bgSpeeds = new THREE.Vector3(...);
      // smElev = smWvElev * trebleBoost;
      // smSpeed = smWvSpeed * trebleBoost;
    //   test
    //   bgSpeeds = new THREE.Vector3(
    //     bgWvSpeeds.x * ampBoost * 0.5*Math.sin(state.clock.elapsedTime *0.1),
    //     bgWvSpeeds.y * ampBoost * 0.5*Math.sin(state.clock.elapsedTime *0.1),
    //     bgWvSpeeds.z * ampBoost* 0.5*Math.cos(state.clock.elapsedTime *0.1)
    //   );