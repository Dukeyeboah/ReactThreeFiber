

uniform vec3 uColorSurf;
uniform vec3 uColorDepth;
uniform float uElevationMultiplier;
uniform float uElevationOffset;

varying vec2 vUv;
varying float vElevation;

void main() {
    //gl_FragColor = vec4(0.5,0.8,1.0, 1.0); //soft blue
    // gl_FragColor = vec4(vUv,0.6, 1.0); //gradien
    //  #include <colorspace_fragment>;
    // vec3 mixedColor = mix(uColorDepth, uColorSurf, vElevation * 1.0 + 1.0); // + 1.0 to offsets the negative amplitudes and take them to 0
    

float mixedElevation = (vElevation * uElevationMultiplier) + uElevationOffset;
    vec3 mixedColor = mix(uColorDepth, uColorSurf, mixedElevation); // + 1.0 to offsets the negative amplitudes and take them to 0
    
    gl_FragColor = vec4(mixedColor, 1.0); //soft blue
}
