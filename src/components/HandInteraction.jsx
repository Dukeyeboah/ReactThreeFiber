/**
 * Hand-driven sphere: vertex pull (shader) and/or moving the whole mesh.
 *
 * Presets: mediapipeHandTargets.js — includes `palmCenter` (wrist + MCP centroid).
 *
 * Modes
 * -----
 * `mode="single"` (default): one hand, same as before. Use `landmark`, `handIndex`
 *   or `handSide` ('Left' | 'Right').
 *
 * `mode="splitRoles"`: e.g. left palm moves the sphere, right index tip pulls vertices.
 *   Use `moveSphereHand` + `vertexPullHand` (each 'Left' | 'Right'),
 *   `sphereLandmark` (often `palmCenter`), `vertexLandmark` (often `indexTip`).
 *
 * Selfie mirror can swap perceived left/right — swap the hand props if it feels inverted.
 *
 * Extra (all optional)
 * --------------------
 * • **Z toward/away from camera** — `zMoveEnabled` + `zMoveRange` + `zMoveInvert`.
 *   Set `zMoveSource="pinch"` (move hand thumb–index): **pinched = closer to camera**, **open = farther**.
 *   Or `zMoveSource="landmarkZ"` uses palm/landmark depth (`zMoveZNormalize`).
 * • **Scale** — `scaleHand` + `scaleMin` / `scaleMax` + pinch span `pinchDistanceMin` / `pinchDistanceMax`
 *   (thumb tip vs index tip distance in normalized image space).
 * • **Rotate** — `rotateHand` + `rotateUseWorldLandmarks` (3D palm basis from `worldLandmarks`, best effort)
 *   or `false` for simple **Y-axis yaw** from wrist→middle in 2D (`rotationYawMultiplier`).
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

import './interactionMaterialSetup';
import {
  getHandLandmarkPoint,
  getHandLandmarksBySide,
  getHandResultIndexBySide,
  getThumbIndexPinchDistance,
} from './mediapipeHandTargets';

const _hitWorld = new THREE.Vector3();
const _worldScratch = new THREE.Vector3();
const _sphereWorld = new THREE.Sphere();
const _ndc = new THREE.Vector3();
const _unprojected = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _oc = new THREE.Vector3();
const _closestOnRay = new THREE.Vector3();
const _dirToSurface = new THREE.Vector3();
const _surfacePoint = new THREE.Vector3();
const _deltaTarget = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _targetSphereOffset = new THREE.Vector3();
const _camFwd = new THREE.Vector3();
const _quatTarget = new THREE.Quaternion();
const _quatSmoothed = new THREE.Quaternion();
const _axisX = new THREE.Vector3();
const _axisY = new THREE.Vector3();
const _axisZ = new THREE.Vector3();
const _matRot = new THREE.Matrix4();
const _eulerFromHand = new THREE.Euler();

/**
 * @param {object} props
 * @param {'single' | 'splitRoles'} [props.mode='single']
 * @param {import('./mediapipeHandTargets').HAND_LANDMARK_PRESETS[keyof import('./mediapipeHandTargets').HAND_LANDMARK_PRESETS] | 'palmCenter' | number} [props.landmark='indexTip'] — single mode
 * @param {number} [props.handIndex=0] — single mode if `handSide` not set
 * @param {'Left' | 'Right' | undefined} [props.handSide] — single mode: pick hand by MediaPipe label
 * @param {'Left' | 'Right'} [props.moveSphereHand='Left'] — splitRoles
 * @param {'Left' | 'Right'} [props.vertexPullHand='Right'] — splitRoles
 * @param {'palmCenter' | keyof import('./mediapipeHandTargets').HAND_LANDMARK_PRESETS | number} [props.sphereLandmark='palmCenter']
 * @param {'palmCenter' | keyof import('./mediapipeHandTargets').HAND_LANDMARK_PRESETS | number} [props.vertexLandmark='indexTip']
 * @param {number} [props.sphereMoveRange=2.5] — world units at full “stick” deflection (±1 from center)
 * @param {number} [props.sphereMoveRangeY] — defaults to sphereMoveRange
 * @param {boolean} [props.enableSphereMoveSmoothing=true]
 * @param {number} [props.sphereMoveSmoothing=10]
 * @param {boolean} [props.sphereReturnWhenLost=true] — lerp offset back when move hand is lost
 * @param {number} [props.maxHands=2]
 * @param {boolean} [props.zMoveEnabled=false] — depth along camera view axis
 * @param {'landmarkZ'|'pinch'} [props.zMoveSource='landmarkZ']
 * @param {number} [props.zMoveRange=3]
 * @param {number} [props.zMoveZNormalize=0.12] — for landmarkZ only
 * @param {number} [props.zPinchDistanceMin=0.02] [props.zPinchDistanceMax=0.34] — for pinch Z (thumb–index span)
 * @param {boolean} [props.zMoveInvert=false]
 * @param {'Left'|'Right'|null} [props.zMoveHand] — single mode: hand for Z-only drag; split uses move hand
 * @param {'palmCenter'|keyof import('./mediapipeHandTargets').HAND_LANDMARK_PRESETS|number} [props.zMoveLandmark='palmCenter']
 * @param {'Left'|'Right'|null} [props.scaleHand=null] — uniform scale from thumb–index spread (pinch)
 * @param {number} [props.scaleMin=12] [props.scaleMax=20] [props.pinchDistanceMin=0.025] [props.pinchDistanceMax=0.32]
 * @param {'Left'|'Right'|null} [props.rotateHand=null] — orientation from `worldLandmarks` (palm basis)
 * @param {boolean} [props.rotateUseWorldLandmarks=true] — if false, uses 2D palm yaw only
 * @param {number} [props.rotationYawMultiplier=1]
 * @param {boolean} [props.enableRotationSmoothing=true] [props.rotationSmoothing=10] [props.rotationReturnWhenLost=true]
 * @param {boolean} [props.enableScaleSmoothing=true] [props.scaleSmoothing=12]
 * @param {number} [props.pullRadius=6.2] shader `uPullRadius`
 * @param {number} [props.pullStrength=0.88] shader `uPullStrength`
 */
export default function HandInteraction({
  mode = 'single',
  landmark = 'indexTip',
  handIndex = 0,
  handSide,
  moveSphereHand = 'Left',
  vertexPullHand = 'Right',
  sphereLandmark = 'palmCenter',
  vertexLandmark = 'indexTip',
  sphereMoveRange = 2.5,
  sphereMoveRangeY = 16.0,
  enableSphereMoveSmoothing = true,
  sphereMoveSmoothing = 10,
  sphereReturnWhenLost = true,
  maxHands = 2,
  mirrorWebcamX = true,
  enableTargetSmoothing = true,
  targetSmoothing = 14,
  outerRadiusFactor = 1.8,
  zMoveEnabled = false,
  zMoveSource = 'landmarkZ',
  zMoveRange = 3,
  zMoveZNormalize = 0.12,
  zPinchDistanceMin = 0.02,
  zPinchDistanceMax = 0.34,
  zMoveInvert = false,
  zMoveHand,
  zMoveLandmark = 'palmCenter',
  scaleHand = null,
  scaleMin = 12,
  scaleMax = 20,
  pinchDistanceMin = 0.025,
  pinchDistanceMax = 0.32,
  enableScaleSmoothing = true,
  scaleSmoothing = 12,
  rotateHand = null,
  rotateUseWorldLandmarks = true,
  rotationYawMultiplier = 1,
  enableRotationSmoothing = true,
  rotationSmoothing = 10,
  rotationReturnWhenLost = true,
  pullRadius = 6.2,
  pullStrength = 0.88,
}) {
  const materialRef = useRef();
  const interactionMeshRef = useRef();
  const lastTargetRef = useRef(new THREE.Vector3());
  const smoothedLocalTargetRef = useRef(new THREE.Vector3());
  const hadHandRef = useRef(false);

  const baseMeshPositionRef = useRef(null);
  const smoothedSphereOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const baseScaleScalarRef = useRef(null);
  const smoothedScaleRef = useRef(null);
  const initialQuatRef = useRef(null);
  const smoothedQuatRef = useRef(null);

  const handLandmarkerRef = useRef(null);
  const videoRef = useRef(null);
  const readyRef = useRef(false);
  const detectionResultsRef = useRef(null);
  const lastMonotonicTsRef = useRef(-1);
  const rvfHandleRef = useRef(null);
  const fallbackIntervalRef = useRef(null);

  const rangeY = sphereMoveRangeY ?? sphereMoveRange;

  const { camera } = useThree();

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement('video');
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.muted = true;
    video.style.display = 'none';
    document.body.appendChild(video);
    videoRef.current = video;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        if (cancelled) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          },
          numHands: Math.min(2, Math.max(1, maxHands)),
          runningMode: 'VIDEO',
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        handLandmarkerRef.current = handLandmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 30, max: 30 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
        readyRef.current = true;
        lastMonotonicTsRef.current = -1;
        detectionResultsRef.current = null;

        const runDetection = (mediaTimeSec) => {
          const lm = handLandmarkerRef.current;
          const v = videoRef.current;
          if (cancelled || !lm || !v || v.readyState < 2) return null;

          let tsMs =
            mediaTimeSec != null && Number.isFinite(mediaTimeSec)
              ? Math.floor(mediaTimeSec * 1000)
              : Math.floor(v.currentTime * 1000);
          if (tsMs <= lastMonotonicTsRef.current) {
            tsMs = lastMonotonicTsRef.current + 1;
          }
          lastMonotonicTsRef.current = tsMs;

          return lm.detectForVideo(v, tsMs);
        };

        if (typeof video.requestVideoFrameCallback === 'function') {
          const onVideoFrame = (_now, metadata) => {
            if (cancelled) return;
            try {
              const mediaTime =
                metadata && typeof metadata.mediaTime === 'number'
                  ? metadata.mediaTime
                  : undefined;
              detectionResultsRef.current = runDetection(mediaTime);
            } catch (e) {
              console.warn('HandInteraction: detectForVideo', e);
            }
            if (!cancelled && videoRef.current) {
              rvfHandleRef.current =
                videoRef.current.requestVideoFrameCallback(onVideoFrame);
            }
          };
          rvfHandleRef.current = video.requestVideoFrameCallback(onVideoFrame);
        } else {
          const intervalMs = 1000 / 30;
          fallbackIntervalRef.current = window.setInterval(() => {
            if (cancelled) return;
            try {
              detectionResultsRef.current = runDetection();
            } catch (e) {
              console.warn('HandInteraction: detectForVideo', e);
            }
          }, intervalMs);
        }
      } catch (e) {
        console.error('HandInteraction: webcam or MediaPipe init failed', e);
        readyRef.current = false;
      }
    }

    init();

    return () => {
      cancelled = true;
      readyRef.current = false;
      const v = videoRef.current;
      if (v && typeof v.cancelVideoFrameCallback === 'function' && rvfHandleRef.current != null) {
        v.cancelVideoFrameCallback(rvfHandleRef.current);
      }
      rvfHandleRef.current = null;
      if (fallbackIntervalRef.current != null) {
        window.clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      handLandmarkerRef.current?.close();
      handLandmarkerRef.current = null;
      if (v) {
        v.srcObject?.getTracks().forEach((t) => t.stop());
        v.remove();
        videoRef.current = null;
      }
    };
  }, [maxHands]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const mesh = interactionMeshRef.current;
    const video = videoRef.current;

    if (!mat || !mesh || !video || !readyRef.current || video.readyState < 2) {
      return;
    }

    if (!baseMeshPositionRef.current) {
      baseMeshPositionRef.current = mesh.position.clone();
    }
    if (baseScaleScalarRef.current == null) {
      baseScaleScalarRef.current = mesh.scale.x;
      smoothedScaleRef.current = mesh.scale.x;
    }
    if (initialQuatRef.current == null) {
      initialQuatRef.current = mesh.quaternion.clone();
      smoothedQuatRef.current = mesh.quaternion.clone();
    }

    mat.uTime = state.clock.elapsedTime * 0.6;

    const results = detectionResultsRef.current;
    const hands = results?.landmarks ?? results?.handLandmarks;

    const geomRadius = 2;
    const outerRadiusFactorLocal = outerRadiusFactor;

    /** @type {import('@mediapipe/tasks-vision').NormalizedLandmark[] | null} */
    let vertexLandmarks = null;
    /** @type {import('@mediapipe/tasks-vision').NormalizedLandmark[] | null} */
    let moveLandmarks = null;
    if (mode === 'splitRoles') {
      moveLandmarks = getHandLandmarksBySide(results, moveSphereHand);
      vertexLandmarks = getHandLandmarksBySide(results, vertexPullHand);
    } else {
      if (handSide === 'Left' || handSide === 'Right') {
        vertexLandmarks = getHandLandmarksBySide(results, handSide);
      } else if (hands?.length) {
        vertexLandmarks = hands[Math.min(handIndex, hands.length - 1)];
      }
    }

    // ─── Position target: XY drag (split) + optional Z along camera forward ───
    _targetSphereOffset.set(0, 0, 0);
    let hasPositionTarget = false;

    if (mode === 'splitRoles' && moveLandmarks) {
      const pt = getHandLandmarkPoint(moveLandmarks, sphereLandmark);
      if (pt) {
        hasPositionTarget = true;
        let nx = pt.x;
        if (mirrorWebcamX) nx = 1 - nx;
        _camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
        _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
        _targetSphereOffset.addScaledVector(
          _camRight,
          (nx - 0.5) * 2 * sphereMoveRange,
        );
        _targetSphereOffset.addScaledVector(
          _camUp,
          -(pt.y - 0.5) * 2 * rangeY,
        );
        if (zMoveEnabled) {
          camera.getWorldDirection(_camFwd);
          let zAlongView = 0;
          if (zMoveSource === 'pinch') {
            const d = getThumbIndexPinchDistance(moveLandmarks);
            if (d != null) {
              const zSpan = Math.max(
                1e-5,
                zPinchDistanceMax - zPinchDistanceMin,
              );
              const t = THREE.MathUtils.clamp(
                (d - zPinchDistanceMin) / zSpan,
                0,
                1,
              );
              let zDrive = 1 - 2 * t;
              if (zMoveInvert) zDrive = -zDrive;
              zAlongView = -zDrive * zMoveRange;
            }
          } else {
            let zv = THREE.MathUtils.clamp(
              (pt.z ?? 0) / zMoveZNormalize,
              -1,
              1,
            );
            if (zMoveInvert) zv = -zv;
            zAlongView = -zv * zMoveRange;
          }
          _targetSphereOffset.addScaledVector(_camFwd, zAlongView);
        }
      }
    } else if (zMoveEnabled && zMoveHand) {
      const zLm = getHandLandmarksBySide(results, zMoveHand);
      if (zMoveSource === 'pinch' && zLm) {
        const d = getThumbIndexPinchDistance(zLm);
        if (d != null) {
          hasPositionTarget = true;
          camera.getWorldDirection(_camFwd);
          const zSpan = Math.max(
            1e-5,
            zPinchDistanceMax - zPinchDistanceMin,
          );
          const t = THREE.MathUtils.clamp(
            (d - zPinchDistanceMin) / zSpan,
            0,
            1,
          );
          let zDrive = 1 - 2 * t;
          if (zMoveInvert) zDrive = -zDrive;
          _targetSphereOffset.addScaledVector(_camFwd, -zDrive * zMoveRange);
        }
      } else if (zLm) {
        const zPt = getHandLandmarkPoint(zLm, zMoveLandmark);
        if (zPt) {
          hasPositionTarget = true;
          camera.getWorldDirection(_camFwd);
          let zv = THREE.MathUtils.clamp(
            (zPt.z ?? 0) / zMoveZNormalize,
            -1,
            1,
          );
          if (zMoveInvert) zv = -zv;
          _targetSphereOffset.addScaledVector(_camFwd, -zv * zMoveRange);
        }
      }
    }

    const so = smoothedSphereOffsetRef.current;
    if (hasPositionTarget) {
      if (enableSphereMoveSmoothing) {
        const a = 1 - Math.exp(-sphereMoveSmoothing * delta);
        so.lerp(_targetSphereOffset, Math.min(1, a));
      } else {
        so.copy(_targetSphereOffset);
      }
    } else if (sphereReturnWhenLost) {
      const a = 1 - Math.exp(-sphereMoveSmoothing * delta);
      so.lerp(_worldScratch.set(0, 0, 0), Math.min(1, a));
    }
    mesh.position.copy(baseMeshPositionRef.current).add(so);

    // ─── Uniform scale from thumb–index pinch on `scaleHand` ───
    let targetScale = baseScaleScalarRef.current;
    if (scaleHand) {
      const sLm = getHandLandmarksBySide(results, scaleHand);
      const pinch = sLm ? getThumbIndexPinchDistance(sLm) : null;
      if (pinch != null) {
        const span = Math.max(1e-5, pinchDistanceMax - pinchDistanceMin);
        const t = THREE.MathUtils.clamp(
          (pinch - pinchDistanceMin) / span,
          0,
          1,
        );
        targetScale = THREE.MathUtils.lerp(scaleMin, scaleMax, t);
      }
    }
    const ss = smoothedScaleRef.current;
    if (scaleHand) {
      if (enableScaleSmoothing) {
        const a = 1 - Math.exp(-scaleSmoothing * delta);
        smoothedScaleRef.current = THREE.MathUtils.lerp(ss, targetScale, Math.min(1, a));
      } else {
        smoothedScaleRef.current = targetScale;
      }
    } else {
      const a = 1 - Math.exp(-scaleSmoothing * delta);
      smoothedScaleRef.current = THREE.MathUtils.lerp(
        ss,
        baseScaleScalarRef.current,
        Math.min(1, a),
      );
    }
    mesh.scale.setScalar(smoothedScaleRef.current);

    // ─── Rotation from `rotateHand` (world 3D palm basis, or 2D yaw fallback) ───
    let hasRotationTarget = false;
    if (rotateHand) {
      const idx = getHandResultIndexBySide(results, rotateHand);
      const wlm =
        idx >= 0 ? results?.worldLandmarks?.[idx] : null;
      const nlm = getHandLandmarksBySide(results, rotateHand);

      if (rotateUseWorldLandmarks && wlm && wlm.length > 9) {
        hasRotationTarget = true;
        const o = wlm[0];
        _axisY
          .set(wlm[9].x - o.x, wlm[9].y - o.y, wlm[9].z - o.z)
          .normalize();
        _axisX
          .set(wlm[5].x - o.x, wlm[5].y - o.y, wlm[5].z - o.z)
          .normalize();
        _axisZ.crossVectors(_axisX, _axisY).normalize();
        _axisX.crossVectors(_axisY, _axisZ).normalize();
        _matRot.makeBasis(_axisX, _axisY, _axisZ);
        _quatTarget.setFromRotationMatrix(_matRot);
      } else if (nlm && nlm.length > 9) {
        hasRotationTarget = true;
        let dx = nlm[9].x - nlm[0].x;
        const dy = nlm[9].y - nlm[0].y;
        if (mirrorWebcamX) dx = -dx;
        const yaw = Math.atan2(dx, -dy) * rotationYawMultiplier;
        _eulerFromHand.set(0, yaw, 0, 'YXZ');
        _quatTarget.setFromEuler(_eulerFromHand);
      }
    }

    const sq = smoothedQuatRef.current;
    const rotAlpha = 1 - Math.exp(-rotationSmoothing * delta);
    if (hasRotationTarget) {
      if (enableRotationSmoothing) {
        sq.slerp(_quatTarget, Math.min(1, rotAlpha));
      } else {
        sq.copy(_quatTarget);
      }
    } else if (rotateHand && rotationReturnWhenLost) {
      sq.slerp(initialQuatRef.current, Math.min(1, rotAlpha));
    }
    if (rotateHand) {
      mesh.quaternion.copy(sq);
    } else {
      mesh.quaternion.copy(initialQuatRef.current);
    }

    const radius =
      Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) * geomRadius;
    const outerRadius = radius * outerRadiusFactorLocal;

    mesh.getWorldPosition(_sphereWorld.center);
    _sphereWorld.radius = radius;

    let pullFactor = 0;
    const localTarget = new THREE.Vector3();

    if (vertexLandmarks) {
      const vLandmarkKey = mode === 'splitRoles' ? vertexLandmark : landmark;
      const pt = getHandLandmarkPoint(vertexLandmarks, vLandmarkKey);
      if (pt) {
        let nx = pt.x;
        if (mirrorWebcamX) nx = 1 - nx;

        const ndcX = nx * 2 - 1;
        const ndcY = -(pt.y * 2 - 1);

        _ndc.set(ndcX, ndcY, 0.5);
        _unprojected.copy(_ndc).unproject(camera);
        _rayOrigin.copy(camera.position);
        _rayDir.copy(_unprojected).sub(_rayOrigin).normalize();

        const ray = state.raycaster.ray;
        ray.origin.copy(_rayOrigin);
        ray.direction.copy(_rayDir);

        const hit = ray.intersectSphere(_sphereWorld, _hitWorld);

        if (hit) {
          _worldScratch.copy(_hitWorld);
          mesh.worldToLocal(_worldScratch);
          localTarget.copy(_worldScratch);
          pullFactor = 1;
        } else {
          const center = _sphereWorld.center;
          _oc.subVectors(center, ray.origin);
          let t = Math.max(0, _oc.dot(ray.direction));

          _closestOnRay.copy(ray.origin).addScaledVector(ray.direction, t);
          const distToCenter = _closestOnRay.distanceTo(center);

          if (distToCenter < outerRadius) {
            _dirToSurface.subVectors(_closestOnRay, center).normalize();
            _surfacePoint.copy(center).addScaledVector(_dirToSurface, radius);
            _worldScratch.copy(_surfacePoint);
            mesh.worldToLocal(_worldScratch);
            localTarget.copy(_worldScratch);

            const hoverDist = distToCenter - radius;
            const hoverRange = outerRadius - radius;
            const t2 = Math.max(
              0,
              Math.min(1, (hoverDist - hoverRange) / (0 - hoverRange)),
            );
            pullFactor = t2 * t2 * (3 - 2 * t2);
          }
        }
      }
    }

    if (pullFactor > 0) {
      const smoothed = smoothedLocalTargetRef.current;
      let out;

      if (enableTargetSmoothing) {
        if (!hadHandRef.current) {
          smoothed.copy(localTarget);
          hadHandRef.current = true;
        } else {
          const alpha = 1 - Math.exp(-targetSmoothing * delta);
          smoothed.lerp(localTarget, Math.min(1, alpha));
        }
        out = smoothed;
      } else {
        out = localTarget;
        hadHandRef.current = true;
      }

      mat.uTargetLocal.copy(out);
      mat.uActive = pullFactor;

      _deltaTarget.subVectors(out, lastTargetRef.current);
      mat.uMouseVelocity.copy(_deltaTarget).divideScalar(delta || 0.016);
      lastTargetRef.current.copy(out);
    } else {
      hadHandRef.current = false;
      mat.uActive = 0;
      mat.uMouseVelocity.set(0, 0, 0);
    }
  });

  return (
    <group>
      <mesh ref={interactionMeshRef} scale={14.0} position={[0, 3, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <interactionShaderMaterial
          ref={materialRef}
          uPullRadius={pullRadius}
          uPullStrength={pullStrength}
        />
      </mesh>
    </group>
  );
}
