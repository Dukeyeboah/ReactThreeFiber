import { useControls } from 'leva';

const HAND_LANDMARK_OPTIONS = [
  'palmCenter',
  'wrist',
  'thumbTip',
  'indexTip',
  'middleTip',
  'ringTip',
  'pinkyTip',
];

const SIDE_OPTIONS = ['Left', 'Right'];
const OFF_SIDE_OPTIONS = ['Off', 'Left', 'Right'];

/** App-level Leva: interaction mode (hand / face / mouse). */
export function useInteractionAppControls() {
  return useControls(
    'App',
    {
      interactionMode: {
        value: 'hand',
        options: {
          'Hand (webcam)': 'hand',
          'Face (webcam)': 'face',
          Mouse: 'mouse',
        },
      },
    },
    { collapsed: true },
  );
}

/**
 * Hand tuning — single hand vs split roles (two hands).
 */
export function useHandInteractionControls() {
  return useControls(
    'Hand interaction',
    {
      layout: {
        value: 'splitRoles',
        options: {
          'Single hand': 'single',
          'Two hands (split roles)': 'splitRoles',
        },
      },
      singleHandSide: { value: 'Right', options: SIDE_OPTIONS },
      moveSphereHand: { value: 'Right', options: SIDE_OPTIONS },
      vertexPullHand: { value: 'Left', options: SIDE_OPTIONS },
      sphereLandmark: { value: 'palmCenter', options: HAND_LANDMARK_OPTIONS },
      vertexLandmark: { value: 'indexTip', options: HAND_LANDMARK_OPTIONS },
      sphereMoveRange: { value: 30, min: 0, max: 60, step: 0.5 },
      sphereMoveRangeY: { value: 16, min: 0, max: 60, step: 0.5 },
      enableSphereMoveSmoothing: true,
      sphereMoveSmoothing: { value: 10, min: 0.1, max: 40, step: 0.1 },
      sphereReturnWhenLost: true,
      mirrorWebcamX: true,
      enableTargetSmoothing: true,
      targetSmoothing: { value: 14, min: 0.5, max: 40, step: 0.1 },
      outerRadiusFactor: { value: 1.8, min: 1, max: 4, step: 0.05 },
      zMoveEnabled: true,
      zMoveSource: { value: 'pinch', options: ['pinch', 'landmarkZ'] },
      zMoveRange: { value: 18, min: 0, max: 40, step: 0.5 },
      zMoveZNormalize: { value: 0.12, min: 0.02, max: 0.5, step: 0.01 },
      zPinchDistanceMin: { value: 0.02, min: 0, max: 0.15, step: 0.005 },
      zPinchDistanceMax: { value: 0.34, min: 0.1, max: 0.6, step: 0.005 },
      zMoveInvert: false,
      singleZHand: {
        value: 'Same as hand',
        options: ['Same as hand', 'Left', 'Right'],
      },
      scaleHandSide: { value: 'Left', options: OFF_SIDE_OPTIONS },
      scaleMin: { value: 10, min: 4, max: 30, step: 0.5 },
      scaleMax: { value: 28, min: 8, max: 40, step: 0.5 },
      pinchDistanceMin: { value: 0.02, min: 0.01, max: 0.2, step: 0.005 },
      pinchDistanceMax: { value: 0.34, min: 0.1, max: 0.5, step: 0.005 },
      enableScaleSmoothing: true,
      scaleSmoothing: { value: 12, min: 0.5, max: 40, step: 0.1 },
      rotateHandSide: { value: 'Right', options: OFF_SIDE_OPTIONS },
      rotateUseWorldLandmarks: false,
      rotationYawMultiplier: { value: 1, min: -2, max: 2, step: 0.05 },
      enableRotationSmoothing: true,
      rotationSmoothing: { value: 10, min: 0.5, max: 40, step: 0.1 },
      rotationReturnWhenLost: true,
    },
    { collapsed: true },
  );
}

export function useFaceInteractionControls() {
  return useControls(
    'Face interaction',
    {
      landmark: {
        value: 'noseTip',
        options: ['noseTip', 'forehead', 'mouthCenter'],
      },
      mirrorWebcamX: true,
      enableTargetSmoothing: true,
      targetSmoothing: { value: 14, min: 0.5, max: 40, step: 0.1 },
    },
    { collapsed: true },
  );
}

function offToNull(side) {
  return side === 'Off' ? null : side;
}

/**
 * Maps Leva "Hand interaction" values to `<HandInteraction />` props.
 */
export function mapHandLevaToProps(h) {
  const maxHands = h.layout === 'splitRoles' ? 2 : 1;
  const scaleHand = offToNull(h.scaleHandSide);
  const rotateHand = offToNull(h.rotateHandSide);

  const base = {
    mode: h.layout,
    maxHands,
    moveSphereHand: h.moveSphereHand,
    vertexPullHand: h.vertexPullHand,
    sphereLandmark: h.sphereLandmark,
    vertexLandmark: h.vertexLandmark,
    sphereMoveRange: h.sphereMoveRange,
    sphereMoveRangeY: h.sphereMoveRangeY,
    enableSphereMoveSmoothing: h.enableSphereMoveSmoothing,
    sphereMoveSmoothing: h.sphereMoveSmoothing,
    sphereReturnWhenLost: h.sphereReturnWhenLost,
    mirrorWebcamX: h.mirrorWebcamX,
    enableTargetSmoothing: h.enableTargetSmoothing,
    targetSmoothing: h.targetSmoothing,
    outerRadiusFactor: h.outerRadiusFactor,
    zMoveEnabled: h.zMoveEnabled,
    zMoveSource: h.zMoveSource,
    zMoveRange: h.zMoveRange,
    zMoveZNormalize: h.zMoveZNormalize,
    zPinchDistanceMin: h.zPinchDistanceMin,
    zPinchDistanceMax: h.zPinchDistanceMax,
    zMoveInvert: h.zMoveInvert,
    scaleHand,
    scaleMin: h.scaleMin,
    scaleMax: h.scaleMax,
    pinchDistanceMin: h.pinchDistanceMin,
    pinchDistanceMax: h.pinchDistanceMax,
    enableScaleSmoothing: h.enableScaleSmoothing,
    scaleSmoothing: h.scaleSmoothing,
    rotateHand,
    rotateUseWorldLandmarks: h.rotateUseWorldLandmarks,
    rotationYawMultiplier: h.rotationYawMultiplier,
    enableRotationSmoothing: h.enableRotationSmoothing,
    rotationSmoothing: h.rotationSmoothing,
    rotationReturnWhenLost: h.rotationReturnWhenLost,
  };

  if (h.layout === 'single') {
    const zHand =
      h.singleZHand === 'Same as hand' ? h.singleHandSide : h.singleZHand;
    return {
      ...base,
      landmark: h.vertexLandmark,
      handSide: h.singleHandSide,
      handIndex: 0,
      zMoveHand: h.zMoveEnabled ? zHand : undefined,
      zMoveLandmark: h.sphereLandmark,
    };
  }

  return {
    ...base,
    landmark: undefined,
    handSide: undefined,
    handIndex: 0,
    zMoveHand: undefined,
  };
}
