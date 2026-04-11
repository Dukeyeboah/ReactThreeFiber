uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform sampler2D uVideoTexture;
uniform float uTime;
varying vec2 vUv;
varying float vEdge;
uniform float uMode;


// modular way of doing ripple effect like a function
    vec3 applyRipple(vec3 color, vec2 uv) {
    float dist = length(uv - 0.5);
    float ripple = sin(dist * 20.0 - uTime * 10.0);
    uv += normalize(uv - 0.5) * ripple * 0.02;
    return texture2D(uTexture, uv).rgb;
}

void main() {

    // step animation:
    //looping timer repeats every 20 seconds
    float stepTime = mod(uTime, 20.0); // 20.0 is the duration of the step animation
    float phase = mod(uTime, 10.0);

float blend = smoothstep(4.0, 6.0, phase);

    vec3 colory;
    // // Brightness animation
     vec3 color = texture2D(uTexture, vUv).rgb;
     vec3 color2 = texture2D(uTexture2, vUv).rgb;
     vec3 videoColor = texture2D(uVideoTexture, vUv).rgb;

    //distort texture
     vec2 uv1 = vUv;
    uv1.x += sin(uv1.y * 10.0 + uTime) * 0.02;
    vec3 tex1 = texture2D(uTexture, uv1).rgb;

    // glitch texture 2
    vec2 uv2 = vUv;
    float glitch = step(0.9, sin(uTime * 20.0));
    uv2.x += glitch * 0.1;
    vec3 tex2 = texture2D(uTexture2, uv2).rgb;

    if (stepTime < 5.0) {
        colory = tex1; // base
    }
    else if (stepTime < 10.0) {
        colory = tex1 + tex2; // add
    }
    else if (stepTime < 15.0) {
        colory = tex1 * tex2; // multiply
    }
    else {
        colory = mix(tex1, tex2, 0.5); // blend
    }

 
//blend the stepTime transitions between effects
float blend1 = smoothstep(4.0, 5.0, stepTime);   // fade in next
float blend2 = smoothstep(9.0, 10.0, stepTime);
float blend3 = smoothstep(14.0, 15.0, stepTime);
float blend4 = smoothstep(19.0, 20.0, stepTime);

vec3 finalStepColor = mix(colory, colory, blend1);
finalStepColor = mix(finalStepColor, colory, blend2);
finalStepColor = mix(finalStepColor, colory, blend3);
finalStepColor = mix(finalStepColor, colory, blend4);

vec3 modeColor;
// COnotrolling functions flow from jsx using uMode
if (uMode < 1.0) {
    modeColor = tex1;
}
else if (uMode < 2.0) {
    modeColor = tex1 + tex2;
}
else if (uMode < 3.0) {
    modeColor = tex1 * tex2;
}
else {
    modeColor = mix(tex1, tex2, 0.5);
}

vec3 smoothColor = mix(tex1, tex2, blend);
// combine
vec3 animatedFinalColor = mix(tex1, tex2, 0.5);
    // float brightness = dot(color, vec3(0.299, 0.587, 0.114));
    // //  color *= sin(uTime + brightness * 10.0);
    // float wave = sin(uTime + brightness * 2.0) * 0.5 + 0.5;
    // color *= wave;

    // // GLitch effect
    // float glitch = step(0.85, sin(uTime * 60.0));
    // vec2 glitchUV = vUv;
    // glitchUV.x += glitch * 0.9;
    // glitchUV.y += glitch * 1.9;
    // vec3 color = texture2D(uTexture, glitchUV).rgb;


    // // Ripple effect- waves from center outward
    // float dist = length(vUv - 0.5);
    // float ripple = sin(dist * 20.0 - uTime * 10.0);
    // vec2 uv = vUv + normalize(vUv - 0.5) * ripple * 0.02;
    // vec3 color = texture2D(uTexture, uv).rgb;


// then call it  in the main function to use it:
vec3 ripple1 = applyRipple(texture2D(uTexture, vUv).rgb, vUv);

    // // Scanlines effect - moving horizontal lines:
    // float lines = mod(vUv.y * 20.0 + uTime * 10.0, 1.0);
    // float scan = step(0.25, lines);
    // // float scan2 = sin(vUv.x * 10.0 + uTime * 10.0);
    // vec3 color = texture2D(uTexture, vUv).rgb;
    // color += vec3(0.0, 1.0, 1.0) * scan;

    // //color shift effect - RGB channels move independently → trippy effect
    // vec3 color = texture2D(uTexture, vUv).rgb;
    // color.r += sin(uTime + vUv.x * 5.0) * 0.2;
    // color.g += cos(uTime + vUv.y * 5.0) * 0.2;

    // //color detection for reddish pixels- animate detected color
    //vec3 color = texture2D(uTexture, vUv).rgb;
    // if (color.r > 0.7) {
    //     color = vec3(0.0, cos(uTime) * 0.5 + 0.5, sin(uTime) * 0.5 + 0.5);
    // }

   //OR

    // //color detection using smooth mask
    // float mask = smoothstep(0.5, 0.7, color.r);
    // color = mix(color, vec3(1.0, cos(uTime) * 0.5 + 0.5, 0.0), mask);

    // //edge detection - highlights boundaries in the image
    // float dx = 1.0 / 512.0;
    // float dy = 1.0 / 512.0;

    //  // wobble UV - animated version
    // vec2 uv = vUv;
    // uv.x += sin(uv.y * 10.0 + uTime) * 0.01;
    // uv.y += cos(uv.x * 10.0 + uTime) * 0.01;
    // vec3 c = texture2D(uTexture, uv).rgb;
    // vec3 right = texture2D(uTexture, uv + vec2(dx, 0.0)).rgb;
    // vec3 up = texture2D(uTexture, uv + vec2(0.0, dy)).rgb;
   
    // float edge = length(c - right) + length(c - up);
    //   // animate edge brightness
    // edge *= sin(uTime * 2.0) * 0.5 + 1.0;

    // unanimted version
    // vec3 c = texture2D(uTexture, vUv).rgb;
    // vec3 right = texture2D(uTexture, vUv + vec2(dx, 0.0)).rgb;
    // vec3 up = texture2D(uTexture, vUv + vec2(0.0, dy)).rgb;
    // float edge = length(c - right) + length(c - up);

    // gl_FragColor = vec4(vec3(edge), 1.0);

    // // heat distortion effect - wavy air distortion - love this
    // vec2 uv = vUv;
    // uv.x += sin(uv.y * 20.0 + uTime) * 0.02;
    // uv.y += cos(uv.x * 10.0 + uTime) * 0.02;
    // vec3 color = texture2D(uTexture, uv).rgb;

    // // Glow
    // vec3 color = texture2D(uTexture, vUv).rgb;
    // float brightness = dot(color, vec3(0.299, 0.587, 0.114));
    // vec3 glow = vec3(1.0, 0.5, 0.1) * brightness * 0.8;
    // color += glow;

    
    // //animate based on color:
    // float r = color.r;
    // float g = color.g;
    // float b = color.b;

    // color.r += sin(uTime + r * 5.0);
    // color.g += cos(uTime + g * 5.0);
    // color.b += sin(uTime + b * 5.0);

    // detect colors:
    // if (color.r > 0.8) {
    // color += vec3(1.0, 0.0, 0.0); // boost reds
    // }
    // if (color.g > 0.8) {
    // color += vec3(0.0, 1.0, 0.0); // boost greens
    // }
    // if (color.b > 0.8) {
    // color += vec3(0.0, 0.0, 1.0); // boost blues
    // }

    // mix textures
    // float blend = sin(uTime) * 0.5 + 0.5;
    // vec3 finalColor = mix(color, color2, 0.5);
    
    // gl_FragColor = vec4(finalColor, 1.0);
    // gl_FragColor = vec4(animatedFinalColor, 1.0);
    //  gl_FragColor = vec4(colory, 1.0);
    // gl_FragColor = vec4(modeColor, 1.0);
    //   gl_FragColor = vec4(smoothColor, 1.0);
    // gl_FragColor = vec4(color, 1.0);
    gl_FragColor = vec4(videoColor, 1.0);
}