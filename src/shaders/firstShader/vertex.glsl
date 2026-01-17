varying vec2 vUv;
uniform vec2 uFrequency;
uniform float uAmplitude;
uniform float uTime;
varying float vElevation;

void main() {
  vUv = uv;
  
  
  // Get the original position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Create animated waves in z direction (like a wavy flag)
  float waveFrequencyY = uFrequency.y; // Controls how many waves
  float waveFrequencyX = uFrequency.x; // Controls how many waves
  float waveAmplitude = uAmplitude; // Controls wave height
  
  float elevation = sin(modelPosition.x * waveFrequencyX + uTime) * waveAmplitude;
  elevation += sin(modelPosition.y * waveFrequencyY + uTime * 0.5) * waveAmplitude;
  modelPosition.z += elevation;

//   usint elevation above to make waves move in both x and y directions instead of method below -same thing
  // Add uTime to animate the waves - makes them move
//   modelPosition.z += sin(modelPosition.x * waveFrequencyX + uTime) * waveAmplitude;
//   modelPosition.z += sin(modelPosition.y * waveFrequencyY + uTime * 0.5) * waveAmplitude;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vElevation = elevation;
}

