uniform float uTime;
uniform vec3 uCameraPosition;

varying vec3 vWorldPosition;

// SIMPLE NOISE
float noise(vec3 p) {
    return sin(p.x * 3.0 + uTime) *
           sin(p.y * 3.0 + uTime * 0.8) *
           sin(p.z * 3.0 + uTime * 0.6);
}

void main() {

    vec3 rayDir = normalize(vWorldPosition - uCameraPosition);
    vec3 pos = uCameraPosition;

    vec3 color = vec3(0.0);
    float densitySum = 0.0;

    float stepSize = 0.05;

    for (int i = 0; i < 64; i++) {
        pos += rayDir * stepSize;

        float d = noise(pos);
        d = d * 0.5 + 0.5;

        d = smoothstep(0.3, 0.8, d);

        vec3 plasma = vec3(0.2, 0.6, 1.0);

        color += plasma * d * 0.05;
        densitySum += d * 0.05;
    }

    // depth glow
    color += vec3(0.0, 1.0, 1.0) * pow(densitySum, 2.0);

    float alpha = clamp(length(color), 0.0, 1.0);
gl_FragColor = vec4(color, alpha * 0.6);

    // gl_FragColor = vec4(color, 1.0);
}