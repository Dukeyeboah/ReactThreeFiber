varying float vDist;

void main() {
  float glow = 1.0 / (vDist * 5.0 + 1.0);
  vec3 color = vec3(glow, glow * 5.5, 1.0);

  gl_FragColor = vec4(color, 1.0);
}