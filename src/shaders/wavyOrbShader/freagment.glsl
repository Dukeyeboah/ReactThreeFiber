uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
varying float vElevation;
varying vec2 vUv;

void main() {
    // Elevation - waves on the x & z axes, with frequency & speed controlled
    // elevation goes from -0.2 to 0.2 because of uBigWavesElevation's value in js is 0.2
    // so is actually going to -0.2 below 0(where depthColor colors) to 0.2, when surfaceColor shows at 1. 
    // So we have increase the amplitude it of vElevation & also offset it * 4 + 0.5 
    // mix - can be float or vec2, vec3 etc
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    gl_FragColor = vec4(color, 1.0);
}
