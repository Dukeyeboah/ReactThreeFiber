precision highp float;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;


void main() {
  float t = uTime;
  // simple gradient from black to white along the uV.x
  vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), vUv.x);

// float designR = dist * 10.0;
// float designR2 = (1.0-dist) * 10.0;

float designXf = vUv.x * 10.0;
float designX2f = (1.0-vUv.x) * 10.0;
float designYf = vUv.y * 10.0;
float designY2f = (1.0-vUv.y) * 10.0;
float pulsef = mix(6.3, 1.0, (cos(uTime * 0.25) + 1.0) * 0.5);

float patternXf = mod(designXf, 1.0 + cos(vUv.y * pulsef));
float patternX2f = mod(designX2f, 1.0 + cos(vUv.y * pulsef));
float patternYf = mod(designYf, 1.0 + cos(vUv.x * pulsef));
float patternY2f = mod(designY2f, 1.0 + cos(vUv.x * pulsef));


float combinedPatternf = patternXf + patternYf + patternX2f + patternY2f;



// pulse color for animation
float glowColor = mix(0.1, 0.9, (cos(uTime) + 1.0) * 0.5);
float glowColor2 = mix(0.1, 0.6, (sin(uTime) + 1.0) * 0.5);
float glowColor3 = mix(0.3, 0.7, (cos(uTime*0.5) + 1.0) * 0.5);

vec3 colorX = vec3(glowColor3,glowColor , glowColor2); // animate color
vec3 colorY = vec3(glowColor2, glowColor3, 0.5); // yellow
vec3 finalColor = vec3(0.0);

finalColor += colorX * patternXf;
finalColor += colorY * patternX2f;

float glowStrength = mix(1.0, 4.0, (sin(uTime) + 1.0) * 0.5);

finalColor *= glowStrength;


//Gradient color version
vec3 gradX = mix(vec3(0.0), vec3(0.0, 0.5, 1.0), patternXf);
vec3 gradY = mix(vec3(0.0), vec3(0.2, 0.2, 0.7), patternYf);
vec3 gradX2 = mix(vec3(0.0), vec3(0.3, 0.9, 0.0), patternX2f);
vec3 gradY2 = mix(vec3(0.0), vec3(0.1, 0.2, 1.0), patternY2f);

vec3 finalColor2 = gradX + gradY + gradX2 + gradY2;
  
gl_FragColor = vec4(finalColor, 1.0); 
 
}

