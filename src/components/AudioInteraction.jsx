/**
 * Audio-reactive sphere using the same interaction shader as hand/face.
 *
 * **Sources**
 * - `microphone` — `getUserMedia({ audio })` (voice / room).
 * - `display` — `getDisplayMedia` (tab or window). In Chrome, pick a **tab** and enable
 *   **“Share tab audio”** to react to music/video playing in that tab. System-wide
 *   desktop audio capture is limited by browser/OS.
 *
 * Uniforms `uAudioLevel`, `uBassLevel`, `uTrebleLevel`, `uAudioInfluence` are defined
 * in `interactionMaterialSetup.jsx` and used in `interactionShaders/vertex.glsl`.
 */
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import './interactionMaterialSetup';

const _origin = new THREE.Vector3(0, 0, 0);
const _zeroVel = new THREE.Vector3(0, 0, 0);

/** @param {number} fftSize must be power of two, 32–32768 */
function allocAnalyserBuffers(analyser) {
  return {
    frequency: new Uint8Array(analyser.frequencyBinCount),
  };
}

function bandAverage(data, start, endExclusive) {
  const i0 = Math.max(0, start);
  const i1 = Math.min(data.length, endExclusive);
  if (i1 <= i0) return 0;
  let sum = 0;
  for (let i = i0; i < i1; i++) sum += data[i];
  return sum / (i1 - i0) / 255;
}

/**
 * @param {object} props
 * @param {'microphone' | 'display'} [props.audioSource='microphone']
 * @param {number} [props.fftSize=512]
 * @param {number} [props.smoothingTimeConstant=0.75]
 * @param {number} [props.smoothing=14] first-order smoothing (~same feel as hand target smoothing)
 * @param {boolean} [props.modulatePullByLoudness=false] If true, adds `uAudioLevel * uAudioPullGain` to the
 *   same inward `dynamicPull` term as bass (see vertex shader). Toggle from Leva.
 * @param {number} [props.audioPullGain=2] Strength when loudness modulation is on.
 */
export default function AudioInteraction({
  audioSource = 'microphone',
  fftSize = 512,
  smoothingTimeConstant = 0.75,
  smoothing = 14,
  modulatePullByLoudness = false,
  audioPullGain = 2,
}) {
  const materialRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const buffersRef = useRef(null);

  const smoothedRef = useRef({ level: 0, bass: 0, treble: 0 });

  useEffect(() => {
    let cancelled = false;
    const Ctor = window.AudioContext || window.webkitAudioContext;

    async function openMic() {
      return navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    }

    async function openDisplayAudio() {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('getDisplayMedia is not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      // Do not call stop() on video — on many browsers that ends tab capture and kills audio.
      stream.getVideoTracks().forEach((t) => {
        t.enabled = false;
      });
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error(
          'No audio track — in Chrome pick a tab and check “Share tab audio”.',
        );
      }
      return stream;
    }

    async function start() {
      try {
        const stream =
          audioSource === 'display' ? await openDisplayAudio() : await openMic();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const audioContext = new Ctor();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;
        analyserRef.current = analyser;
        buffersRef.current = allocAnalyserBuffers(analyser);

        source.connect(analyser);

        await audioContext.resume();
      } catch (e) {
        console.error('AudioInteraction: failed to start audio', e);
      }
    }

    start();

    return () => {
      cancelled = true;
      try {
        sourceRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      sourceRef.current = null;
      analyserRef.current = null;
      buffersRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, [audioSource, fftSize, smoothingTimeConstant]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const analyser = analyserRef.current;
    const buffers = buffersRef.current;
    if (!mat || !analyser || !buffers) return;

    mat.uTime = state.clock.elapsedTime * 0.6;

    const binCount = analyser.frequencyBinCount;
    const data = buffers.frequency;
    if (data.length !== binCount) {
      buffersRef.current = allocAnalyserBuffers(analyser);
      return;
    }

    analyser.getByteFrequencyData(data);

    const bassEnd = Math.max(1, Math.floor(binCount * 0.12));
    const trebleStart = Math.floor(binCount * 0.55);

    const rawLevel = bandAverage(data, 0, binCount);
    const rawBass = bandAverage(data, 0, bassEnd);
    const rawTreble = bandAverage(data, trebleStart, binCount);

    const s = smoothedRef.current;
    const a = 1 - Math.exp(-smoothing * delta);
    s.level += (rawLevel - s.level) * Math.min(1, a);
    s.bass += (rawBass - s.bass) * Math.min(1, a);
    s.treble += (rawTreble - s.treble) * Math.min(1, a);

    mat.uAudioLevel = s.level;
    mat.uBassLevel = s.bass;
    mat.uTrebleLevel = s.treble;
    mat.uAudioInfluence = 0.55 + s.level * 1.85;
    mat.uAudioPullModulate = modulatePullByLoudness ? 1 : 0;
    mat.uAudioPullGain = audioPullGain;
  });

  return (
    <group>
      <mesh scale={14.0} position={[0, 3, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <interactionShaderMaterial
          ref={materialRef}
          uActive={1}
          uTargetLocal={_origin}
          uMouseVelocity={_zeroVel}
        />
      </mesh>
    </group>
  );
}
