import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * useAudioAnalyser - Custom hook for analyzing audio and driving visual reactivity
 *
 * Uses the Web Audio API to:
 * 1. Load and play an audio file
 * 2. Analyze it in real-time via AnalyserNode
 * 3. Expose smoothed values: amplitude (loudness), bass, treble
 *
 * Why these values?
 * - Amplitude: Overall loudness - drives speed of waves
 * - Bass (0-20%): Kick drums, sub-bass - drives big wave HEIGHT
 * - Mid (20-60%): Vocals, guitars, melody - drives big wave FREQUENCY (tightness)
 * - Treble (60-100%): Hi-hats, cymbals - drives small wave detail
 *
 * Note: Browsers require a user gesture (click) before AudioContext can run (autoplay policy)
 */
export function useAudioAnalyser(audioSrc, options = {}) {
  const {
    fftSize = 256, // FFT size: 256, 512, 1024... higher = more frequency detail
    smoothing = 0.8, // 0-1, higher = smoother (less jittery) values
    smoothingOut = 0.15, // How fast our output values lerp toward target (0.1 = slow/smooth)
  } = options;

  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  // Smoothed output values (0-1 range, normalized)
  const amplitudeRef = useRef(0);
  const bassRef = useRef(0);
  const midRef = useRef(0);
  const trebleRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Create audio element AND connect through Web Audio API when audioSrc is provided
  // OLD: Only created Audio element; setupAudio() was called in play() - but audio played
  //      through normal browser pathway BEFORE analyser connected, so values stayed 0
  useEffect(() => {
    if (!audioSrc) {
      audioRef.current = null;
      contextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      queueMicrotask(() => setIsReady(false)); // Defer to avoid sync setState in effect
      return;
    }
    const audio = new Audio(audioSrc);
    audio.crossOrigin = 'anonymous'; // Needed if loading from another domain
    audioRef.current = audio;

    // Set up audio graph immediately so audio flows: Audio → MediaElementSource → Analyser → Speakers
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();

      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothing;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      contextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
      queueMicrotask(() => {
        setIsReady(true);
        setError(null);
      }); // Defer to avoid sync setState in effect
    } catch (err) {
      queueMicrotask(() => {
        setError(err.message);
        setIsReady(false);
      }); // Defer to avoid sync setState in effect
    }

    return () => {
      audio.pause();
      audio.src = '';
      sourceRef.current?.disconnect();
      contextRef.current?.close();
    };
  }, [audioSrc, fftSize, smoothing]);

  // OLD setupAudio - only called from play(), but audio already playing = analyser never got data
  // const setupAudio = useCallback(() => { ... }, [audioSrc, fftSize, smoothing]);

  // Start playback (must be called from user gesture due to browser policy)
  const play = useCallback(async () => {
    const ctx = contextRef.current;
    const audio = audioRef.current;
    if (!audio) return;

    // Resume context if suspended (required by browser autoplay policy)
    if (ctx?.state === 'suspended') {
      await ctx.resume();
    }

    audio.play().then(() => setIsPlaying(true)).catch((e) => setError(e.message));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // Analyze audio and return { amplitude, bass, mid, treble }
  // OLD splits: Bass 0-10%, Treble 50-100% - treble was too broad
  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return { amplitude: 0, bass: 0, mid: 0, treble: 0 };

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const len = dataArray.length;
    // Better frequency splits: Bass 0-20%, Mid 20-60%, Treble 60-100%
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

  // Get current smoothed values - call this every frame
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
    audioRef,
    play,
    pause,
    isPlaying,
    isReady,
    error,
    getValues,
  };
}
