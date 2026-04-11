varying vec2 vUv;
varying float vElevation;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  //  float wave = mod(vUv.x * 10.0 + uTime * 2.0, 1.0);
  //  pos.z += wave * 0.2;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

// //LIke fragment shader but on vertex
float designX = vUv.x * 10.0;
float designX2 = (1.0-vUv.x) * 10.0;
float designY = vUv.y * 10.0;
float designY2 = (1.0-vUv.y) * 10.0;
float pulse = mix(6.3, 1.0, (cos(uTime * 0.15) + 1.0) * 0.5);
//pattern animations along the design
float patternX = mod(designX + uTime * 2.0, 1.0 + cos(vUv.y * pulse));  
float patternY = mod(designY + uTime * 2.0, 1.0 + cos(vUv.x * pulse));
float patternX2 = mod(designX2 + uTime * 2.0, 1.0 + cos(vUv.y * pulse));
float patternY2 = mod(designY2 + uTime * 2.0, 1.0 + cos(vUv.x * pulse));

//For plane
//float displacement = (patternX + patternY) * 0.2;
//pos.z += displacement;
//gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

// For sphere pulsate across normal:
float displacement = (patternX+patternX2) * 2.9;
vElevation = displacement; // 👈 store it
//  THIS is the important part for sphere displacement across normal & not particular axis
pos += normal * displacement;

gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
// gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); //using position not pos
}



  

 

  

 