import { extend, useFrame, 
  // useThree, 
  //useLoader 

} from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { useRef, 
 // useMemo, useEffect 
} from 'react';


import screenVertexShader from '../shaders/screenShader/vertex.glsl?raw';
import screenFragmentShader from '../shaders/screenShader/fragment.glsl?raw';
import volumetricVertex from '../shaders/volumetricShader/vertex.glsl?raw';
import volumetricFragment from '../shaders/volumetricShader/fragment.glsl?raw';
import textureVertexShader from '../shaders/textureShaders/texture.glsl?raw';
import textureFragmentShader from '../shaders/textureShaders/fragment.glsl?raw';

import * as THREE from 'three';

import './interactionMaterialSetup';

const TextureShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [1, 1],
    // uTexture: new THREE.Texture(),
    uTexture: new THREE.Texture(),
    uTexture2: new THREE.Texture(),
    uMouse: new THREE.Vector2(),
    //uTexture3: null,
    uVideoTexture: null,
    uMode: 0,
  },
  textureVertexShader,
  textureFragmentShader,
);
extend({ TextureShaderMaterial });


const ScreenShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [1, 1],
     uMouse: new THREE.Vector2(),
    // side: THREE.DoubleSide,
  },
  screenVertexShader,
  screenFragmentShader,
  
);
extend({ ScreenShaderMaterial: ScreenShaderMaterial });

const VolumetricMaterial = shaderMaterial(
  {
    uTime: 0,
    uCameraPosition: new THREE.Vector3(),
    transparent: true,
    //wireframe: true,
side: THREE.FrontSide,
opacity: 0.1,
  },
  volumetricVertex,
  volumetricFragment
);

extend({ VolumetricMaterial });



const _hitWorld = new THREE.Vector3();
const _sphereWorld = new THREE.Sphere();

export default function ScreenShaderTest({
  pullRadius = 6.2,
  pullStrength = 0.88,
  /** Scales cursor velocity “throw” in the shader (`uThrowStrength`). */
  reactionSensitivity = 0.03,
} = {}) {
  const materialRef = useRef();
  const interactionMeshRef = useRef();
  const coreRef = useRef();
  const textureRef = useRef();
  const lastTargetRef = useRef(new THREE.Vector3()); // ← NEW - remembers previous target

  // const { viewport } = useThree();

//   const video = document.createElement('video');
// video.src = '/video.mp4';
// video.loop = true;
// //video.muted = true;
// video.play();
//  const videoTexture = new THREE.VideoTexture(video);
//  videoTexture.colorSpace = THREE.SRGBColorSpace;
  // const texture = useLoader(THREE.TextureLoader, '/textures/2.jpg');
  // const texture2 = useLoader(THREE.TextureLoader, '/textures/3.jpg');
  // const mode = useRef(0);
  // texture.repeat.set(1, 1);
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.needsUpdate = true;
 
  // texture.anisotropy = 16;
  // texture.encoding = THREE.sRGBEncoding;
  // texture.colorSpace = THREE.SRGBColorSpace;
  // texture.format = THREE.RGBAFormat;
  // texture.type = THREE.UnsignedByteType;
  // texture.minFilter = THREE.LinearMipMapLinearFilter;

  // console.log(viewport.height)

  useFrame((state, delta) => {

      // // console.log(state.mouse.x, state.mouse.y)
      // if (materialRef.current) {
      //   materialRef.current.uTime = state.clock.elapsedTime *0.6;
      //   materialRef.current.uResolution = [size.width, size.height];
      //   // normalized mouse (-1 → 1)
      //   materialRef.current.uMouse = [
      //     state.mouse.x * 13,
      //     state.mouse.y * 13
      //   ];
      //  // console.log(materialRef.current.uMouse);
      // }
    const mat = materialRef.current;
    const mesh = interactionMeshRef.current;

    if (mat && mesh) {
      mat.uTime = state.clock.elapsedTime * 0.6;

      mesh.getWorldPosition(_sphereWorld.center);
      const geomRadius = 2;
      const radius =
        Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z) * geomRadius;
      _sphereWorld.radius = radius;

      state.raycaster.setFromCamera(state.pointer, state.camera);
      const ray = state.raycaster.ray;
      const hit = ray.intersectSphere(_sphereWorld, _hitWorld);

      let pullFactor = 0.0;
    const localTarget = new THREE.Vector3();
    const outerRadius = radius * 1.6;   // ← TUNE THIS: bigger = feel mouse from farther away

    if (hit) {
      // Mouse is touching → full strength
      localTarget.copy(mesh.worldToLocal(_hitWorld.clone()));
      pullFactor = 1.0;
    } else {
      // Mouse is close but not touching yet → hover/pre-touch effect
      const center = _sphereWorld.center;
      const oc = new THREE.Vector3().subVectors(center, ray.origin);
      let t = oc.dot(ray.direction);
      t = Math.max(t, 0.0); // only forward from camera

      const closestOnRay = ray.origin.clone().addScaledVector(ray.direction, t);
      const distToCenter = closestOnRay.distanceTo(center);

      // Change cursor
  if (distToCenter < outerRadius) {
    document.body.style.cursor = 'grab';     // or 'grab' or 'crosshair'
  } else {
    document.body.style.cursor = 'default';
  }

      if (distToCenter < outerRadius) {
        const dirToSurface = closestOnRay.clone().sub(center).normalize();
        const surfacePoint = center.clone().addScaledVector(dirToSurface, radius);

        localTarget.copy(mesh.worldToLocal(surfacePoint));

        const hoverDist = distToCenter - radius;
        const hoverRange = outerRadius - radius;

        // Same smooth math as the shader but in JavaScript
        const t2 = Math.max(0, Math.min(1, (hoverDist - hoverRange) / (0 - hoverRange)));
        pullFactor = t2 * t2 * (3.0 - 2.0 * t2);   // reversed smoothstep
      }
    }

    // Apply everything to the shader
    if (pullFactor > 0.0) {
      mat.uTargetLocal.copy(localTarget);
      mat.uActive = pullFactor;

      // === NEW: Mouse velocity for throwing ===
      const last = lastTargetRef.current;
      const deltaTarget = localTarget.clone().sub(last);
      const velocity = deltaTarget.divideScalar(delta || 0.016); // speed per second
      mat.uMouseVelocity.copy(velocity);

      lastTargetRef.current.copy(localTarget); // remember for next frame
    } else {
      mat.uActive = 0.0;
      mat.uMouseVelocity.set(0, 0, 0); // no fling when mouse is far
    }
  }

    //before logic when mouse was just touching the sphere
    //   if (hit) {
    //     const local = mesh.worldToLocal(_hitWorld.clone());
    //     mat.uTargetLocal.copy(local);
    //     mat.uActive = 1;
    //   } else {
    //     mat.uActive = 0;
    //   }
    // }

    if (coreRef.current) {
      coreRef.current.uTime = state.clock.elapsedTime;
      coreRef.current.uCameraPosition.copy(state.camera.position);
    }
    if (textureRef.current) {
      
      textureRef.current.uTime = state.clock.elapsedTime * 0.6;
      // cycle modes every 5 seconds
  const t = Math.floor(state.clock.elapsedTime / 5) % 4;
  textureRef.current.uMode = t;
      // console.log(`uTime is ${textureRef.current.uTime}`)
    }
  });

  // const video = useMemo(() => {
  //   const vid = document.createElement('video');
  //   vid.src = '/videos/video.mp4';
  //   vid.loop = true;
  //   vid.muted = true;
  //   vid.playsInline = true;
  //   vid.autoplay = true;
  //   vid.crossOrigin = 'anonymous';
  //   return vid;
  // }, []);
  
  // const videoTexture = useMemo(() => {
  //   const tex = new THREE.VideoTexture(video);
  //   tex.colorSpace = THREE.SRGBColorSpace;
  //   return tex;
  // }, [video]);
  
  // useEffect(() => {
  //   video.play().catch(() => {
  //     console.log("Autoplay blocked — user interaction needed");
  //   });
  // }, [video]);

  return (
    <group>
      {/* <mesh scale={10.0}>
    <sphereGeometry args={[2, 64, 64]} />
    <volumetricMaterial
      ref={coreRef}
      side={THREE.FrontSide}
      transparent={true}
      opacity={0.1}
      depthWrite={false}
      //wireframe={true}
    />
  </mesh> */}
  <mesh ref={interactionMeshRef} scale={14.0} position={[0, 3, 0]}>
    <sphereGeometry args={[2, 64, 64]} />
    {/* <textureShaderMaterial
    ref={textureRef}
    uTexture={texture}
    uTexture2={texture2}
    uVideoTexture={videoTexture}
    uMode={mode}
    /> */}
    <interactionShaderMaterial
      ref={materialRef}
      uPullRadius={pullRadius}
      uPullStrength={pullStrength}
      uThrowStrength={reactionSensitivity}
    />
    {/* <meshStandardMaterial color='blue' wireframe /> */}
  </mesh>
    {/* <mesh frustumCulled={false} position={[0, 0, 0]}rotation={[0,Math.PI,0]} scale={[viewport.width, viewport.height, 1]}> */}
    <mesh frustumCulled={false} position={[0, 0, 0]}
    // rotation={[-Math.PI/2,Math.PI/2,0]} 
    rotation={[0,0,0]} 
    >
  
      {/* <planeGeometry args={[1, 1, 256, 256]} /> */}
      {/* <sphereGeometry args={[10, 256,256]} />
      <screenShaderMaterial
        ref={materialRef}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
        wireframe={true}
      /> */}
    </mesh>
    </group>
    
  );
}

