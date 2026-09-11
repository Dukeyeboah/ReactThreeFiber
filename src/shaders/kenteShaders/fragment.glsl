precision highp float;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  // Repeat along vUv.y so stripes run left-to-right (horizontal).
  float strength = step(0.8, mod(vUv.y * 10.0, 1.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
