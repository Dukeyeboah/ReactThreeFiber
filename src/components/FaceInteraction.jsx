/**
 * Face-driven sphere deformation (MediaPipe Face Landmarker).
 *
 * ─── Where to change behavior ─────────────────────────────────────────────
 * 1) Landmark (nose / forehead / mouth / custom index)
 *    → In Scene.jsx on <FaceInteraction />, set prop `landmark`:
 *        <FaceInteraction landmark="noseTip" />
 *        <FaceInteraction landmark="forehead" />
 *        <FaceInteraction landmark="mouthCenter" />
 *        <FaceInteraction landmark={5} />   // raw MediaPipe index
 *    → Or add presets in mediapipeFaceTargets.js (FACE_LANDMARK_PRESETS).
 *
 * 2) Smoothing (less jitter)
 *    → Props `enableTargetSmoothing` (default true) and `targetSmoothing` (default 14).
 *    → Higher targetSmoothing = snappier; lower = smoother / lazier.
 *
 * 3) Mirror selfie camera horizontally
 *    → Prop `mirrorWebcamX` (default true).
 * ───────────────────────────────────────────────────────────────────────────
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

import './interactionMaterialSetup';
import { getFaceLandmarkPoint } from './mediapipeFaceTargets';

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

/**
 * @param {object} props
 * @param {'noseTip'|'forehead'|'mouthCenter'|number} [props.landmark='noseTip']
 * @param {boolean} [props.mirrorWebcamX=true]
 * @param {boolean} [props.enableTargetSmoothing=true]
 * @param {number} [props.targetSmoothing=14] - higher = follows raw detection faster
 */
export default function FaceInteraction({
  landmark = 'noseTip',
  mirrorWebcamX = true,
  enableTargetSmoothing = true,
  targetSmoothing = 14,
}) {
  const materialRef = useRef();
  const interactionMeshRef = useRef();
  const lastTargetRef = useRef(new THREE.Vector3());
  const smoothedLocalTargetRef = useRef(new THREE.Vector3());
  const hadFaceRef = useRef(false);

  const faceLandmarkerRef = useRef(null);
  const videoRef = useRef(null);
  const readyRef = useRef(false);
  const detectionResultsRef = useRef(null);
  const lastMonotonicTsRef = useRef(-1);
  const rvfHandleRef = useRef(null);
  const fallbackIntervalRef = useRef(null);

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

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          numFaces: 1,
          runningMode: 'VIDEO',
        });

        if (cancelled) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;

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
          const lm = faceLandmarkerRef.current;
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
              console.warn('FaceInteraction: detectForVideo', e);
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
              console.warn('FaceInteraction: detectForVideo', e);
            }
          }, intervalMs);
        }
      } catch (e) {
        console.error('FaceInteraction: webcam or MediaPipe init failed', e);
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
      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;
      if (v) {
        v.srcObject?.getTracks().forEach((t) => t.stop());
        v.remove();
        videoRef.current = null;
      }
    };
  }, []);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const mesh = interactionMeshRef.current;
    const video = videoRef.current;

    if (!mat || !mesh || !video || !readyRef.current || video.readyState < 2) {
      return;
    }

    mat.uTime = state.clock.elapsedTime * 0.6;

    mesh.getWorldPosition(_sphereWorld.center);
    const geomRadius = 2;
    const radius =
      Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) * geomRadius;
    _sphereWorld.radius = radius;

    const results = detectionResultsRef.current;

    let pullFactor = 0;
    const localTarget = new THREE.Vector3();
    const outerRadius = radius * 1.6;

    if (results?.faceLandmarks?.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const pt = getFaceLandmarkPoint(landmarks, landmark);
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
          let t = _oc.dot(ray.direction);
          t = Math.max(t, 0);

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

    // ─── Smoothing + shader output (see file-top comment for props) ───
    if (pullFactor > 0) {
      const smoothed = smoothedLocalTargetRef.current;
      let out;

      if (enableTargetSmoothing) {
        if (!hadFaceRef.current) {
          smoothed.copy(localTarget);
          hadFaceRef.current = true;
        } else {
          const alpha = 1 - Math.exp(-targetSmoothing * delta);
          smoothed.lerp(localTarget, Math.min(1, alpha));
        }
        out = smoothed;
      } else {
        out = localTarget;
        hadFaceRef.current = true;
      }

      mat.uTargetLocal.copy(out);
      mat.uActive = pullFactor;

      _deltaTarget.subVectors(out, lastTargetRef.current);
      mat.uMouseVelocity.copy(_deltaTarget).divideScalar(delta || 0.016);
      lastTargetRef.current.copy(out);
    } else {
      hadFaceRef.current = false;
      mat.uActive = 0;
      mat.uMouseVelocity.set(0, 0, 0);
    }
  });

  return (
    <group>
      <mesh ref={interactionMeshRef} scale={14.0} position={[0, 3, 0]}>
        <sphereGeometry args={[2, 64, 64]} />
        <interactionShaderMaterial ref={materialRef} />
      </mesh>
    </group>
  );
}
