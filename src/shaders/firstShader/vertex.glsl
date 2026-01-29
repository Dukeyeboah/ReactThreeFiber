varying vec2 vUv;
uniform vec2 uFrequency;
uniform float uAmplitude;
uniform float uTime;
uniform float uUseUVFrequency; // 0 = regular, 1 = UV-based
uniform float uWaveTypeX; // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
uniform float uWaveTypeY; // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
uniform float uUseUVTime; // 0 = regular time, 1 = UV-based time
uniform float uUVTimeOffset;
uniform float uUVFreqMinX;
uniform float uUVFreqMaxX;
uniform float uUVFreqMinY;
uniform float uUVFreqMaxY;
varying float vElevation;

void main() {
  vUv = uv;
  
  // Get the original position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  float waveAmplitude = uAmplitude;
  float elevation = 0.0;
  
  // Choose time: regular or UV-based
  float currentTime = uTime;
  if (uUseUVTime > 0.5) {
    currentTime = uTime + vUv.x * uUVTimeOffset;
  }
  
  // Choose frequency method: regular or UV-based
  if (uUseUVFrequency > 0.5) {
    // UV-based frequency
    float localFrequencyX = mix(uUVFreqMinX, uUVFreqMaxX, vUv.x);
    float localFrequencyY = mix(uUVFreqMinY, uUVFreqMaxY, vUv.y);
    
    // Calculate all wave types
    float waveX = sin(modelPosition.x * localFrequencyX + currentTime);
    float waveY = sin(modelPosition.y * localFrequencyY + currentTime);
    float waveXY = sin(modelPosition.x * localFrequencyY + currentTime);
    float waveYX = sin(modelPosition.y * localFrequencyX + currentTime);
    
    // Apply wave type X
    if (uWaveTypeX < 0.5) {
      // waveX
      elevation += waveX * waveAmplitude;
    } else if (uWaveTypeX < 1.5) {
      // waveY
      elevation += waveY * waveAmplitude;
    } else if (uWaveTypeX < 2.5) {
      // waveXY
      elevation += waveXY * waveAmplitude;
    } else if (uWaveTypeX < 3.5) {
      // waveYX
      elevation += waveYX * waveAmplitude;
    }
    // else none (4.0) - don't add anything
    
    // Apply wave type Y
    if (uWaveTypeY < 0.5) {
      // waveX
      elevation += waveX * waveAmplitude;
    } else if (uWaveTypeY < 1.5) {
      // waveY
      elevation += waveY * waveAmplitude;
    } else if (uWaveTypeY < 2.5) {
      // waveXY
      elevation += waveXY * waveAmplitude;
    } else if (uWaveTypeY < 3.5) {
      // waveYX
      elevation += waveYX * waveAmplitude;
    }
    // else none (4.0) - don't add anything
  } else {
    // Regular frequency-based waves
    float waveFrequencyX = uFrequency.x;
    float waveFrequencyY = uFrequency.y;
    elevation += sin(modelPosition.x * waveFrequencyX + currentTime) * waveAmplitude;
    elevation += sin(modelPosition.y * waveFrequencyY + currentTime * 0.5) * waveAmplitude;
  }
  
  modelPosition.z += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vElevation = elevation;
}



// previous

// varying vec2 vUv;
// uniform vec2 uFrequency;
// uniform float uAmplitude;
// uniform float uTime;
// uniform float uUseUVFrequency; // 0 = regular, 1 = UV-based
// uniform float uWaveTypeX; // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
// uniform float uWaveTypeY; // 0 = waveX, 1 = waveY, 2 = waveXY, 3 = waveYX, 4 = none
// uniform float uUseUVTime; // 0 = regular time, 1 = UV-based time
// uniform float uUVTimeOffset;
// uniform float uUVFreqMinX;
// uniform float uUVFreqMaxX;
// uniform float uUVFreqMinY;
// uniform float uUVFreqMaxY;
// varying float vElevation;

// void main() {
//   vUv = uv;
  
//   // Get the original position
//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
//   float waveAmplitude = uAmplitude;
//   float elevation = 0.0;
  
//   // Choose time: regular or UV-based
//   float currentTime = uTime;
//   if (uUseUVTime > 0.5) {
//     currentTime = uTime + vUv.x * uUVTimeOffset;
//   }
  
//   // Choose frequency method: regular or UV-based
//   if (uUseUVFrequency > 0.5) {
//     // UV-based frequency
//     float localFrequencyX = mix(uUVFreqMinX, uUVFreqMaxX, vUv.x);
//     float localFrequencyY = mix(uUVFreqMinY, uUVFreqMaxY, vUv.y);
    
//     // Calculate all wave types
//     float waveX = sin(modelPosition.x * localFrequencyX + currentTime);
//     float waveY = sin(modelPosition.y * localFrequencyY + currentTime);
//     float waveXY = sin(modelPosition.x * localFrequencyY + currentTime);
//     float waveYX = sin(modelPosition.y * localFrequencyX + currentTime);
    
//     // Apply wave type X
//     if (uWaveTypeX < 0.5) {
//       // waveX
//       elevation += waveX * waveAmplitude;
//     } else if (uWaveTypeX < 1.5) {
//       // waveY
//       elevation += waveY * waveAmplitude;
//     } else if (uWaveTypeX < 2.5) {
//       // waveXY
//       elevation += waveXY * waveAmplitude;
//     } else if (uWaveTypeX < 3.5) {
//       // waveYX
//       elevation += waveYX * waveAmplitude;
//     }
//     // else none (4.0) - don't add anything
    
//     // Apply wave type Y
//     if (uWaveTypeY < 0.5) {
//       // waveX
//       elevation += waveX * waveAmplitude;
//     } else if (uWaveTypeY < 1.5) {
//       // waveY
//       elevation += waveY * waveAmplitude;
//     } else if (uWaveTypeY < 2.5) {
//       // waveXY
//       elevation += waveXY * waveAmplitude;
//     } else if (uWaveTypeY < 3.5) {
//       // waveYX
//       elevation += waveYX * waveAmplitude;
//     }
//     // else none (4.0) - don't add anything
//   } else {
//     // Regular frequency-based waves
//     float waveFrequencyX = uFrequency.x;
//     float waveFrequencyY = uFrequency.y;
//     elevation += sin(modelPosition.x * waveFrequencyX + currentTime) * waveAmplitude;
//     elevation += sin(modelPosition.y * waveFrequencyY + currentTime * 0.5) * waveAmplitude;
//   }
  
//   modelPosition.z += elevation;

//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectedPosition = projectionMatrix * viewPosition;
//   gl_Position = projectedPosition;

//   vElevation = elevation;
// }

