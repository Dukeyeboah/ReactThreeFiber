import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

import interactionVertexShader from '../shaders/interactionShaders/vertex.glsl?raw';
import interactionFragmentShader from '../shaders/interactionShaders/fragment.glsl?raw';

const InteractionShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uTargetLocal: new THREE.Vector3(0, 0, 0),
    uMouseVelocity: new THREE.Vector3(0, 0, 0),
    uThrowStrength: 0.03,
    wireframe: true,
    uActive: 0,
    uPullStrength: 0.88,
    uPullRadius: 6.2,
  },
  interactionVertexShader,
  interactionFragmentShader,
);

extend({ InteractionShaderMaterial });

export { InteractionShaderMaterial };
