uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform sampler2D uTexture;
uniform float uUseTexture;
varying vec2 vUv;
varying float vElevation;

void main() {
  // Always sample the texture - vec4 because RGBA, 2nd param is where on geometry we want to put texture -vUv - uv coordinates (attributes turned to varying)
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb *= vElevation * 0.05 + 0.5;
  
  // Calculate gradient color
  vec3 gradientColor = mix(uColorStart, uColorEnd, vUv.x);
  
  // Blend between texture and gradient based on uUseTexture flag
  // uUseTexture = 0.0: use gradient (no texture)
  // uUseTexture = 1.0: use texture blended with gradient
  // First mix: blend texture with gradient (70% texture, 30% gradient when texture is used)
  vec3 texturedColor = mix(textureColor.rgb, gradientColor, 0.3);
  
  // Second mix: blend between gradient-only and textured result based on uUseTexture
  vec3 color = mix(gradientColor, texturedColor, uUseTexture);
  
  gl_FragColor = vec4(color, 1.0);
}

