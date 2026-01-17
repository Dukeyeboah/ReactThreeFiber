attribute float aRandom;
varying vec2 vUv;
varying float vRandom;

void main() {
  vUv = uv;
  vRandom = aRandom;
  
  // Get the original position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Use random values to create terrain-like displacement
  modelPosition.z += aRandom * 2.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
}

