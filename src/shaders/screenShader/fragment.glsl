precision highp float;

uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vElevation;
#define PI 3.1415926535897932384626433832795

void main() {
  // Option A: use UV (normalized 0..1)
  vec2 st = vUv;
  // Option B: use pixel coordinates (if you want book-of-shaders style)
  // vec2 sp = gl_FragCoord.xy / uResolution;
  float t = uTime;
 // diagonal rainbow gradient
  vec3 col = 0.5 + 0.5 * cos(
    t + vec3(0.0, 2.0, 4.0) +
      st.x * 6.0 +
      st.y * 6.0
  );
   // gl_FragColor = vec4(col, 1.0);
  //  gl_FragColor = vec4(vUv.x,0.0,vUv.y, 1.0);

  // simple gradient from black to white along the uV.x
  vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), vUv.x);
// For colored version
// //use for radial direction instead of vUv.x & vUv.y
// float dist = length(vUv - 0.5);

// float designR = dist * 10.0;
// float designR2 = (1.0-dist) * 10.0;

float designXf = vUv.x * 10.0;
float designX2f = (1.0-vUv.x) * 10.0;
float designYf = vUv.y * 10.0;
float designY2f = (1.0-vUv.y) * 10.0;
float pulsef = mix(6.3, 1.0, (cos(uTime * 0.25) + 1.0) * 0.5);

float patternXf = mod(designXf, 1.0 + cos(vUv.y * pulsef));
float patternYf = mod(designYf, 1.0 + cos(vUv.x * pulsef));
float patternX2f = mod(designX2f, 1.0 + cos(vUv.y * pulsef));
float patternY2f = mod(designY2f, 1.0 + cos(vUv.x * pulsef));
// float patternRf = mod(designR, 1.0 + cos(vUv.x * pulsef));
// float patternR2f = mod(designR2, 1.0 + cos(vUv.x * pulsef));

// // sharpen lines
// patternXf = step(0.8, patternXf);
// patternYf = step(0.8, patternYf);

float combinedPatternf = patternXf + patternYf + patternX2f + patternY2f;

//elevation color adjustment
// normalize elevation
float elevationNorm = clamp(vElevation * 2.0, 0.0, 1.0);



// pulse color for animation
float glowColor = mix(0.1, 0.9, (cos(uTime) + 1.0) * 0.5);
float glowColor2 = mix(0.1, 0.6, (sin(uTime) + 1.0) * 0.5);
float glowColor3 = mix(0.3, 0.7, (cos(uTime*0.5) + 1.0) * 0.5);

// elevation color
vec3 elevationColor = mix(vec3(0.0), vec3(glowColor,glowColor3,glowColor2), elevationNorm);
// vec3 elevationColor = mix(vec3(0.0), vec3(glowColor,glowColor3,0.5), vElevation);

vec3 colorX = vec3(glowColor3,glowColor , glowColor2); // animate color
// vec3 colorY = vec3(1.0, 1.0, 0.0); // yellow
vec3 colorY = vec3(glowColor2, glowColor3, 0.5); // yellow
vec3 finalColor = vec3(0.0);

// finalColor += colorX * patternRf;
// finalColor += colorX * patternR2f;
finalColor += colorX * patternXf;
finalColor += colorY * patternX2f;

// ADD elevation influence
// finalColor += elevationColor;
//OR
// OPTIONAL: blend instead of add (more controlled)
// finalColor = mix(finalColor, elevationColor, 0.5);

float glowStrength = mix(1.0, 4.0, (sin(uTime) + 1.0) * 0.5);

finalColor *= glowStrength;
// finalColor *= 2.0;
// finalColor += colorY * patternYf;
// finalColor += colorX * patternX2f;
// finalColor += colorY * patternY2f;

//Gradient color version
vec3 gradX = mix(vec3(0.0), vec3(0.0, 0.5, 1.0), patternXf);
vec3 gradY = mix(vec3(0.0), vec3(0.2, 0.2, 0.7), patternYf);
vec3 gradX2 = mix(vec3(0.0), vec3(0.3, 0.9, 0.0), patternX2f);
vec3 gradY2 = mix(vec3(0.0), vec3(0.1, 0.2, 1.0), patternY2f);

vec3 finalColor2 = gradX + gradY + gradX2 + gradY2;
  // vec3 colorful = mix(vec3(0.4, 0.1, 0.8), vec3(1.0, 1.0, 0.0), vUv.x);
  //vec3 strength = vec3(vUv.x); //or vec3(vUv.y); //simple black to white gradient along x-axis
  // vec3 strength = vec3(vUv.x*10.0);//rgb values each move from 0-10 in x-direction so white starts very early along the x-axis(1/10th of the way). turns white at 1 and beyond
  // gl_FragColor = vec4(strength, 1.0); //or vec4(color, 1.0);



// initial method using vec 3
  vec3 design = vec3(vUv.x*10.0);
  vec3 designX2 = vec3((1.0-vUv.x)*10.0);
  vec3 designY = vec3(vUv.y*10.0);
  vec3 designY2 = vec3((1.0-vUv.y)*10.0);
  vec3 pattern = mod(design,1.0);//restart design every 1.0 step, so its design/1.0, at that point pattern goes to 0 and we start pattern again. like a long division. returns the remainder after division
  vec3 patternY = mod(designY,1.0);//restart design every 1.0 step, so its design/1.0, at that point pattern goes to 0 and we start pattern again. like a long division. returns the remainder after division
  
  //FInding the best pulse pulse:
  float pulse2 = mix(6.39, 1.0, (cos(uTime*0.25) + 1.0) * 0.5);
   // float pulse2 = mix(15.0, 1.0, (cos(uTime*0.1) + 1.0) * 0.5); // the perfect one
  // float pulse1 = mix(0.5, 1.0, (sin(uTime) + 1.0) * 0.5);  
  // float pulse2 = mix(1.0, 20.0, (sin(uTime*0.2) + 1.0) );
  // float pulse2 = mix(1.0, 30.0, (cos(uTime*0.2) + 1.0) * 0.5);

  //vec3 pulsePattern = mod(design,pulse1); // not waht i wanted but diff animatino
  //animate - multiply frequency with uTime(t)
  //pulse animations based on pulse2
  vec3 animatePattern1XYP = mod(design,1.0+cos(vUv.y*pulse2)); //i wanted this!!
  vec3 animatePattern1X2YP = mod(designX2,1.0+cos(vUv.y*pulse2)); //i wanted this!!
  vec3 animatePattern1YXP = mod(designY,1.0+cos(vUv.x*pulse2)); //i wanted this!!
  vec3 animatePattern1Y2XP = mod(designY2,1.0+cos(vUv.x*pulse2)); //i wanted this!!

  // forever increasing frequ
  vec3 animatePattern1XX = mod(design,1.0+cos(vUv.x*t));
  vec3 animatePattern1XY = mod(design,1.0+cos(vUv.y*t));
  vec3 animatePattern1YX = mod(designY,1.0+cos(vUv.x*t));
  vec3 animatePattern1YY = mod(designY,1.0+cos(vUv.y*t));
  vec3 animatePattern1Y2X = mod(designY2,1.0+cos(vUv.x*t));
  vec3 animatePattern1Y2Y = mod(designY2,1.0+cos(vUv.y*t));
  vec3 animatePattern1X2 = mod(designX2,1.0+cos(vUv.x*t));
  vec3 animatePattern1X2Y = mod(designX2,1.0+cos(vUv.y*t));

  //animate - add frequency with uTime(t)
    vec3 animatePattern2XX = mod(design,1.0+cos(vUv.x+t));
    vec3 animatePattern2XY = mod(design,1.0+cos(vUv.y+t));
    vec3 animatePattern2YX = mod(designY,1.0+cos(vUv.x+t));
    vec3 animatePattern2YY = mod(designY,1.0+cos(vUv.y+t));
    vec3 animatePattern2Y2X = mod(designY2,1.0+cos(vUv.x+t));
    vec3 animatePattern2Y2Y = mod(designY2,1.0+cos(vUv.y+t));
    vec3 animatePattern2X2X = mod(designX2,1.0+cos(vUv.x+t));
    vec3 animatePattern2X2Y = mod(designX2,1.0+cos(vUv.y+t));

    //sine form
  vec3 animatePattern1XXs = mod(design,1.0+sin(vUv.x*t));
  vec3 animatePattern1XYs = mod(design,1.0+sin(vUv.y*t));
  vec3 animatePattern1YXs = mod(designY,1.0+sin(vUv.x*t));
  vec3 animatePattern1YYs = mod(designY,1.0+sin(vUv.y*t));
  vec3 animatePattern1Y2Xs = mod(designY2,1.0+sin(vUv.x*t));
  vec3 animatePattern1Y2Ys = mod(designY2,1.0+sin(vUv.y*t));
  vec3 animatePattern1X2s = mod(designX2,1.0+sin(vUv.x*t));
  vec3 animatePattern1X2Ys = mod(designX2,1.0+sin(vUv.y*t));
    vec3 animatePattern2XXs = mod(design,1.0+sin(vUv.x+t));
    vec3 animatePattern2XYs = mod(design,1.0+sin(vUv.y+t));
    vec3 animatePattern2YXs = mod(designY,1.0+sin(vUv.x+t));
    vec3 animatePattern2YYs = mod(designY,1.0+sin(vUv.y+t));
    vec3 animatePattern2Y2Xs = mod(designY2,1.0+sin(vUv.x+t));
    vec3 animatePattern2Y2Ys = mod(designY2,1.0+sin(vUv.y+t));
    vec3 animatePattern2X2Xs = mod(designX2,1.0+sin(vUv.x+t));
    vec3 animatePattern2X2Ys = mod(designX2,1.0+sin(vUv.y+t));
  
  // float line = step(0.5, pattern.x); //hard stripes
  // vec2 grid = mod(vUv * 10.0, 1.0); //grid pattern

  // float lines = mod(vUv.y * 20.0 + uTime * 2.0, 1.0);//moving scanlines across your orb

  // gl_FragColor = vec4(color, 1.0); 
   gl_FragColor = vec4(finalColor, 1.0); 
  // vec3 combinedPattern = (animatePattern1XYP + animatePattern1X2YP +animatePattern1YXP +animatePattern1YXP);
  // // vec3 coloredPattern = mix(vec3(vUv.x), vec3(1.0, 0.0, 0.0), combinedPattern);
   
   // // Colored version
// vec3 blackColor = vec3(0.0);
// vec3 uvColor = vec3(0.2,0.1,1.0); // the color that will show up in the white
// vec3 mixedColor = mix(blackColor, uvColor, combinedPattern); //black parts stay black, white parts get uv color

    //gl_FragColor = vec4(uvColor, 1.0); 
  
    // gl_FragColor = vec4(finalColor2, 1.0);//colred version
    //black and white version
  //  gl_FragColor = vec4(animatePattern1XYP + animatePattern1X2YP +animatePattern1YXP +animatePattern1YXP, 1.0); 


  // // gl_FragColor = vec4((animatePattern1YX + animatePattern1Y2X ), 1.0);
  //  gl_FragColor = vec4((animatePattern1XY + animatePattern1X2Y )+(animatePattern1YX + animatePattern1Y2X ), 1.0);
  // gl_FragColor = vec4((animatePattern1Y2X + animatePattern1YX) + (animatePattern1X2Y * animatePattern1Y), 1.0);
  // gl_FragColor = vec4((animatePattern1X2Y * animatePattern1Y), 1.0);  
// gl_FragColor = vec4((animatePattern1Y2X + animatePattern1YX) * (animatePattern1Y2X + animatePattern1YX), 1.0); 
// 
 
}

