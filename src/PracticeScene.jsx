import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { OrbitControls } from '@react-three/drei';

import Begin from './components/Begin';
import Shader from './components/Shader';
import TeachShaders from './components/TeachShaders';
import RagingSea from './components/RagingSea';
import TestShaders from './components/TestShaders';
import {
  GlBridge,
  ShaderDownloadButton,
} from './components/ShaderStillDownload';

/**
 * Lean scene for fragment-shader practice.
 * No Stage / HDRI environment, no interaction imports (MediaPipe, audio, etc.).
 *
 * Flip back to the full scene in App.jsx: set PRACTICE_MODE = false.
 *
 * Hide Leva at runtime with backtick (`).
 */
export default function PracticeScene() {
  const [levaVisible, setLevaVisible] = useState(true);
  const glRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '`' && e.key !== 'Backquote') return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      ) {
        return;
      }
      setLevaVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {levaVisible ? <Leva collapsed /> : null}
      <Canvas
        flat
        camera={{ position: [0, 0, 100], fov: 45, near: 0.1, far: 1000 }}
        style={{ width: '100%', height: '100vh' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <color attach='background' args={['white']} />
        <GlBridge glRef={glRef} />
        {/* <TeachShaders /> */}
        {/* <Begin /> */}
        {/* <Shader /> */}
        {/* <RagingSea /> */}
        <TestShaders materialRef={materialRef} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
      <ShaderDownloadButton glRef={glRef} materialRef={materialRef} />
    </>
  );
}
