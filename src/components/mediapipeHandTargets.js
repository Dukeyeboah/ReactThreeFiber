/** MediaPipe hand topology: 21 landmarks per hand. */
export const HAND_LANDMARK_PRESETS = {
  wrist: 0,
  thumbTip: 4,
  indexTip: 8,
  middleTip: 12,
  ringTip: 16,
  pinkyTip: 20,
};

/** Wrist + four MCPs — stable “palm” centroid for whole-hand driving. */
export const PALM_CENTROID_INDICES = [0, 5, 9, 13, 17];

/**
 * @param {{ landmarks?: unknown[]; handedness?: { categoryName?: string }[][]; handednesses?: { categoryName?: string }[][] } | null} results
 * @param {'Left' | 'Right'} side - MediaPipe `handedness[i][0].categoryName`
 */
export function getHandResultIndexBySide(results, side) {
  const list = results?.landmarks ?? results?.handLandmarks;
  const handed = results?.handedness ?? results?.handednesses;
  if (!list?.length || !handed?.length) return -1;
  for (let i = 0; i < list.length; i++) {
    if (handed[i]?.[0]?.categoryName === side) return i;
  }
  return -1;
}

export function getHandLandmarksBySide(results, side) {
  const list = results?.landmarks ?? results?.handLandmarks;
  const i = getHandResultIndexBySide(results, side);
  if (i < 0 || !list) return null;
  return list[i];
}

/** Normalized image distance thumb tip (4) ↔ index tip (8); ~0.02 closed, ~0.3+ open. */
export function getThumbIndexPinchDistance(landmarks) {
  const a = landmarks[4];
  const b = landmarks[8];
  if (!a || !b) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * @param {Array<{x:number,y:number,z?:number}>} landmarks - one hand's landmarks
 * @param {keyof typeof HAND_LANDMARK_PRESETS | 'palmCenter' | number} landmark
 */
export function getHandLandmarkPoint(landmarks, landmark) {
  if (!landmarks?.length) return null;

  if (landmark === 'palmCenter') {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const i of PALM_CENTROID_INDICES) {
      const p = landmarks[i];
      if (!p) return null;
      x += p.x;
      y += p.y;
      z += p.z ?? 0;
    }
    const n = PALM_CENTROID_INDICES.length;
    return { x: x / n, y: y / n, z: z / n };
  }

  const index =
    typeof landmark === 'number'
      ? landmark
      : HAND_LANDMARK_PRESETS[landmark] ?? HAND_LANDMARK_PRESETS.indexTip;
  const p = landmarks[index];
  if (!p) return null;
  return { x: p.x, y: p.y, z: p.z ?? 0 };
}
