import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import cnoise3d from '../shaders/physicalOrb/cnoise3d.glsl?raw';

/**
 * MeshPhysicalMaterial + onBeforeCompile
 *
 * Three builds a full vertex + fragment program for this material. Right before
 * that program is compiled, `onBeforeCompile(shader)` runs so you can edit the
 * shader source strings and register extra uniforms. We splice after
 * `#include <common>` (globals, PI, etc.) and `#include <begin_vertex>` (where
 * `transformed` is the morphed local position and `objectNormal` is already set).
 *
 * Alternatives: full `ShaderMaterial` (you reimplement lighting), `displacementMap`
 * (texture-based, no arbitrary GLSL), morph targets / CPU vertex updates, or
 * editing `THREE.ShaderChunk` globally. For “keep PBR + tweak vertices”, this hook
 * is the usual approach.
 *
 * Deforming the mesh: any formula that updates `transformed` works — rotation
 * matrices are just one example. For a “pulsating” look, offset along
 * `normalize(objectNormal)` using waves and/or noise (see below). That differs
 * from a raw `main()` shader: here you patch a slice of Three’s pipeline instead
 * of writing `gl_Position` yourself.
 */
export default function PhysicalMaterialShaders() {
  const materialRef = useRef(null);
  const shaderRef = useRef(null);

  const {
    uDisp,
    uBgWvElev,
    uSmWvElev,
    uSmWvFreq,
    uSmWvSpeed,
    roughness,
    envMapIntensity,
    wireframe,
  } = useControls('Physical orb (PBR + vertices)', {
    uDisp: { value: 0.32, min: 0, max: 1, step: 0.01, label: 'Displacement scale' },
    uBgWvElev: { value: 0.12, min: 0, max: 0.5, step: 0.01, label: 'Big wave amp' },
    uSmWvElev: { value: 0.1, min: 0, max: 0.4, step: 0.01, label: 'Noise octaves amp' },
    uSmWvFreq: { value: 0.85, min: 0.1, max: 3, step: 0.05, label: 'Noise freq' },
    uSmWvSpeed: { value: 0.35, min: 0, max: 2, step: 0.05, label: 'Noise speed' },
    roughness: {
      value: 0.32,
      min: 0,
      max: 1,
      step: 0.02,
      label: 'Roughness (blurs env reflection)',
    },
    envMapIntensity: { value: 1.05, min: 0, max: 3, step: 0.05 },
    wireframe: { value: false, label: 'Wireframe' },
  });

  useLayoutEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    material.onBeforeCompile = (shader) => {
      shaderRef.current = shader;

      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uDisp = { value: uDisp };
      shader.uniforms.uBgWvFreq = { value: [4.2, 4.0, 4.5] };
      shader.uniforms.uBgWvSpeeds = { value: [1.1, 0.9, 1.0] };
      shader.uniforms.uBgWvElev = { value: uBgWvElev };
      shader.uniforms.uSmWvFreq = { value: uSmWvFreq };
      shader.uniforms.uSmWvSpeed = { value: uSmWvSpeed };
      shader.uniforms.uSmWvElev = { value: uSmWvElev };
      //shader.uniforms.wireframe = { value: false };

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>

${cnoise3d}

uniform float uTime;
uniform float uDisp;
uniform vec3 uBgWvFreq;
uniform vec3 uBgWvSpeeds;
uniform float uBgWvElev;
uniform float uSmWvFreq;
uniform float uSmWvSpeed;
uniform float uSmWvElev;
`,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>

vec3 p = transformed;

float elevationXY =
    sin((p.x * uBgWvFreq.x) + uTime * uBgWvSpeeds.x) *
    cos((p.y * uBgWvFreq.y) + uTime * uBgWvSpeeds.y) * uBgWvElev;
float elevationZY =
    sin((p.z * uBgWvFreq.z) + uTime * uBgWvSpeeds.z) *
    cos((p.y * uBgWvFreq.y) + uTime * uBgWvSpeeds.y) * uBgWvElev;
float elevationXZ =
    sin((p.x * uBgWvFreq.x) + uTime * uBgWvSpeeds.x) *
    cos((p.z * uBgWvFreq.z) + uTime * uBgWvSpeeds.z) * uBgWvElev;

float elevation = (elevationXY + elevationZY + elevationXZ) / 3.0;

for (int i = 1; i <= 4; i++) {
  float fi = float(i);
  elevation -= abs(cnoise(vec3(p.xy * uSmWvFreq * fi, uTime * uSmWvSpeed)) * uSmWvElev / fi);
  elevation -= abs(cnoise(vec3(p.xz * uSmWvFreq * fi, uTime * uSmWvSpeed)) * uSmWvElev / fi);
  elevation -= abs(cnoise(vec3(p.yz * uSmWvFreq * fi, uTime * uSmWvSpeed)) * uSmWvElev / fi);
}

transformed += normalize(objectNormal) * elevation * uDisp;
`,
      );
    };

    material.needsUpdate = true;
    return () => {
      material.onBeforeCompile = null;
      material.needsUpdate = true;
      shaderRef.current = null;
    };
    // Uniforms are updated every frame in useFrame; listing Leva deps would recompile the shader on every drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const shader = shaderRef.current;
    if (!shader) return;
    shader.uniforms.uTime.value = state.clock.elapsedTime;
    shader.uniforms.uDisp.value = uDisp;
    shader.uniforms.uBgWvElev.value = uBgWvElev;
    shader.uniforms.uSmWvFreq.value = uSmWvFreq;
    shader.uniforms.uSmWvSpeed.value = uSmWvSpeed;
    shader.uniforms.uSmWvElev.value = uSmWvElev;
    //shader.material.wireframe.value = wireframe;
  });

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1.25, 128, 128]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#b8c4d8"
        metalness={1}
        roughness={roughness}
        envMapIntensity={envMapIntensity}
        clearcoat={0.4}
        clearcoatRoughness={0.15}
        iridescence={1}
        iridescenceIOR={1.55}
        iridescenceThicknessRange={[120, 600]}
        wireframe={wireframe}
      />
    </mesh>
  );
}
