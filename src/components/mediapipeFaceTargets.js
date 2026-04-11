/** Presets for MediaPipe Face Landmarker (478 landmarks). Indices match the official topology. */
export const FACE_LANDMARK_PRESETS = {
  noseTip: { mode: 'single', index: 1 },
  /** Glabella / between brows */
  forehead: { mode: 'single', index: 10 },
  /** Midpoint of upper/lower lip outer centers */
  mouthCenter: { mode: 'midpoint', a: 13, b: 14 },
};

/**
 * @param {Array<{x:number,y:number,z?:number}>} landmarks - faceLandmarks[0]
 * @param {keyof typeof FACE_LANDMARK_PRESETS | number} landmark - preset key or single index
 */
export function getFaceLandmarkPoint(landmarks, landmark) {
  if (!landmarks?.length) return null;
  if (typeof landmark === 'number') {
    const p = landmarks[landmark];
    if (!p) return null;
    return { x: p.x, y: p.y, z: p.z ?? 0 };
  }
  const spec = FACE_LANDMARK_PRESETS[landmark] ?? FACE_LANDMARK_PRESETS.noseTip;
  if (spec.mode === 'single') {
    const p = landmarks[spec.index];
    if (!p) return null;
    return { x: p.x, y: p.y, z: p.z ?? 0 };
  }
  const pa = landmarks[spec.a];
  const pb = landmarks[spec.b];
  if (!pa || !pb) return null;
  return {
    x: (pa.x + pb.x) * 0.5,
    y: (pa.y + pb.y) * 0.5,
    z: ((pa.z ?? 0) + (pb.z ?? 0)) * 0.5,
  };
}
