import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * useMicrophoneAnalyser - Analyzes microphone input for visual reactivity
 *
 * Uses getUserMedia + Web Audio API to capture and analyze mic input.
 * Returns the same getValues() shape as useAudioAnalyser: { amplitude, bass, mid, treble }
 * so RagingSea can use either source interchangeably.
 *
 * Note: Requires user gesture to call start() (browser permission for mic access)
 */
export function useMicrophoneAnalyser(enabled, options = {}) {
  const {
    fftSize = 256,
    smoothing = 0.8,
    smoothingOut = 0.15,
    echoCancellation = true,
    noiseSuppression = true,
  } = options;

  const streamRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const amplitudeRef = useRef(0);
  const bassRef = useRef(0);
  const midRef = useRef(0);
  const trebleRef = useRef(0);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    sourceRef.current?.disconnect();
    contextRef.current?.close();
    contextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    queueMicrotask(() => setIsActive(false));
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return () => {};
    }
    return () => stop();
  }, [enabled, stop]);

  const start = useCallback(async () => {
    if (!enabled) return;
    stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      // Do NOT connect to destination - we don't want to hear ourselves

      contextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
      queueMicrotask(() => {
        setIsActive(true);
        setError(null);
      });
    } catch (err) {
      setError(err.message || 'Microphone access denied');
      queueMicrotask(() => setIsActive(false));
    }
  }, [enabled, fftSize, smoothing, echoCancellation, noiseSuppression, stop]);

  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return { amplitude: 0, bass: 0, mid: 0, treble: 0 };

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const len = dataArray.length;
    const bassEnd = Math.floor(len * 0.2);
    const midEnd = Math.floor(len * 0.6);

    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) bassSum += dataArray[i];
    const bass = bassEnd > 0 ? bassSum / bassEnd / 255 : 0;

    let midSum = 0;
    for (let i = bassEnd; i < midEnd; i++) midSum += dataArray[i];
    const mid = midEnd - bassEnd > 0 ? midSum / (midEnd - bassEnd) / 255 : 0;

    let trebleSum = 0;
    for (let i = midEnd; i < len; i++) trebleSum += dataArray[i];
    const treble = len > midEnd ? trebleSum / (len - midEnd) / 255 : 0;

    let total = 0;
    for (let i = 0; i < len; i++) total += dataArray[i];
    const amplitude = len > 0 ? total / len / 255 : 0;

    return { amplitude, bass, mid, treble };
  }, []);

  const getValues = useCallback(() => {
    const raw = analyze();
    const f = smoothingOut;
    const lerp = (a, b, t) => a + (b - a) * t;

    amplitudeRef.current = lerp(amplitudeRef.current, raw.amplitude, f);
    bassRef.current = lerp(bassRef.current, raw.bass, f);
    midRef.current = lerp(midRef.current, raw.mid, f);
    trebleRef.current = lerp(trebleRef.current, raw.treble, f);

    return {
      amplitude: amplitudeRef.current,
      bass: bassRef.current,
      mid: midRef.current,
      treble: trebleRef.current,
    };
  }, [analyze, smoothingOut]);

  return {
    start,
    stop,
    isActive,
    error,
    getValues,
  };
}
