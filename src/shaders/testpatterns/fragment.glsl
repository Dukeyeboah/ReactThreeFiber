varying vec2 vUv;
uniform float uTime;
#define PI 3.1415926535897932384626433832795


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

// vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}


void main()
{
    // // Pattern 1 - first 2 values based on the uV.x = 0 to 1 and uV.y = 0 to 1 
    // (so r value starts at 0 and ends at 1 along the x axis and g value starts at 0 and ends at 1 along the y axis)
    // and the third value (blue) is always 1
    // gl_FragColor = vec4(vUv,1.0, 1.0);

    // // Pattern 2
    // gl_FragColor = vec4(vUv, 0.0, 1.0);

    //Pattern 3 - black to white from left to right
    // vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), vUv.x);
    // // gl_FragColor = vec4(color, 1.0);
    // // OR
    // gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);

    // // Pattern 4 - black to white from bottom to top
    // float strength = vUv.y;
    //  gl_FragColor = vec4(strength, strength, strength, 1.0);

    //  OR
    // vec3 strength = vec3(vUv.y);
    //  gl_FragColor = vec4(strength, 1.0);

    // // Pattern 5 - black to whit from top to bottom
    // // float strength = 1.0-vUv.y;
    // //  gl_FragColor = vec4(strength, strength, strength, 1.0);

    // //  OR
    // vec3 strength = vec3(1.0-vUv.y);
    //  gl_FragColor = vec4(strength, 1.0);

    // // Pattern 6 - blend from black to white finishes a 10th of the way across the screen upwards
    // float strength = vUv.y *10.0;
    //  gl_FragColor = vec4(strength, strength, strength, 1.0);

    // //  OR
    // // vec3 strength = vec3(vUv.y * 10.0);
    // //  gl_FragColor = vec4(strength, 1.0);

    // // Pattern 7 - repeated pattern of blend from black to white from bottom to top
    // // Modulo - we go to a value -1.0- and then restart at zero from there and repeat it till we fill the space
    // float strength = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    // //so kind of like doing uV.y * 10.0 / 1.0, and repeating it for the remainder of the division.
    // // float strength = mod(vUv.y * 10.0, 1.0) * mod(vUv.x * 10.0, 1.0); So 1.0 being the limit of each repitition of vUv.y*10.0
    //  gl_FragColor = vec4(strength, strength, strength, 1.0);

    // //  OR
    // // vec3 strength = vec3(mod(vUv.y * 10.0, 1.0));
    // //  gl_FragColor = vec4(strength, 1.0);



    //  // Pattern 8 - repeated pattern of blend from black to white from bottom to top with a step limit of 0.5
    // float strength = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    // // Conditions are bad for performance, so we use a smoothstep to interpolate between 0 and 1
    // if(strength < 0.5){
    //     strength = 0.0;
    // }
    // else{
    //     strength = 1.0;
    // }
    // OR ternary operator:
    // strength = strength < 0.5? 0.0 : 1.0;

// // We will use step instead of conditional
//     // Step - a function that interpolates between 0 and 1 based on the strength value
//     // Maps the strengthvalues from 0 to the step value (0.5)
//     // so any value of strength below 0.0 will be 0.0 and any value above 0.5 will be 1.0
//     // so when strength reaches our limit (0.5) any value after that will be = 1
//      strength = step(0.5, strength);

//     // Smoothstep - a function that interpolates between 0 and 1 based on the strength value
//     // Maps the values from 0 to 1 to 0 to 0.5 and then from 0.5 to 1 to 1 to 0.5
//     // so any value of strenght below 0.0 will be 0.0 and any value above 0.5 will be 1.0
//     // strength = smoothstep(0.0, 0.5, strength);
    
//     gl_FragColor = vec4(strength, strength, strength, 1.0);

    //  OR
    // vec3 strength = vec3(vUv.y * 10.0);
    //  gl_FragColor = vec4(strength, 1.0);



    // Pattern 9 - repeated pattern of blend from black to white from bottom to top (thin step limit = 0.8)
    // float strength = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    // float set = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    //  strength = step(0.8, strength);
    //  set = step(0.4, set); //didn't use here

    // // Combination of step and mix
    // //  strength = mix(strength, set, 0.5);
    // // strength *= set;

    // // strength = smoothstep(0.0, 0.5, strength);
    
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

    // //  OR
    // // vec3 strength = vec3(step(0.8,(mod(vUv.y * 10.0, 1.0))));
    // //  gl_FragColor = vec4(strength, 1.0);


    // // Pattern 10 - repeated pattern of blend from black to white from left to right
    // float strength = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    // float set = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    //  strength = step(0.8, strength);
    //  set = step(0.4, set); //didn't use here
    // //  strength = mix(strength, set, 0.5);
    // // strength *= set;

    // // strength = smoothstep(0.0, 0.5, strength);
    
    // gl_FragColor = vec4(strength, strength, strength, 1.0);



    // // Pattern 11 - combination (addition) of repeated pattern of blend from black to white from left to right and bottom to top
    // // float strength = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    // // float strengthB = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    // //  strength = step(0.8, strength);
    // //  strengthB = step(0.8, strengthB); //didn't use here
    // // //  strength = mix(strength, strengthB, 0.5);
    // // //  strength *= strengthB; //multiplication shows the intersection of the two patterns - 
    // // //so image will be where they intersect, the white parts, other parts are 0 times something = 0
    // //     strength += strengthB; //addition shows the union of the two patterns
    // // // strength = smoothstep(0.0, 0.5, strength);

    // // or simpler way
    float strength = step(0.8, (mod(vUv.x * 10.0, 1.0)));
    strength += step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

    gl_FragColor = vec4(strength, strength, strength, 1.0);



    // // Pattern 12 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
    // // or simpler way
    // float strength = step(0.8, (mod(vUv.x * 10.0, 1.0)));
    // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

    // gl_FragColor = vec4(strength, strength, strength, 1.0);


//     // // Pattern 13 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
//     // // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
//     // float strength = step(0.5, (mod(vUv.x * 10.0, 1.0)));
//     // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

//     // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // 1. Generate oscillation between -1 and 1
// float sinTime = sin(uTime); 
// float cosTime = cos(uTime); 

// // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // Simplified: 0.45 + 0.25 * sinTime
// float thresholdX = 0.3 + 0.35 * cosTime;
// float threshold = 0.45 + 0.25 * sinTime;
//     // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
//     // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
//     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));
//     float barX = step((0.4), (mod(vUv.x * 10.0, 1.0)));
//     // float barX = step((threshold), (mod(vUv.x * 10.0, 1.0)));
//     barX *= step((0.8), (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns
//     // we shift it by 0.2 to the left to take it to the middle of the x-width(0.4) because 0.2 is half of 0.4, the step limit
    
//     // we are pushing the black along the x axis by 0.8(80%) to reveal 20% white, and the pushing black along the y by 04 so that everything above that in the y axis is white
//     float barY = step(0.8, (mod(vUv.x * 10.0 , 1.0))); // shades plane along the vUv.x axis(horizontal) 1/10th of its width, then divides that by 1 ro repeat it 10 times (10/1), then stop each ones display by cutting it off as black below the step limit of 0.8
//      barY *= step((0.4), (mod(vUv.y * 10.0, 1.0)));
//     //  barY *= step((thresholdX), (mod(vUv.y * 10.0, 1.0)));
//    //!!find a way to animate barY so that its step value osscilates between 0.2 and 0.6
    
//     // barY *= step((threshold), (mod(vUv.y * 10.0, 1.0))) ; //addition shows the union of the two patterns
//     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));

//     //  barY = 0.5*sin(uTime*15.0);
//     //  barY = smoothstep(0.2, 1.0, barY);

// //  float strengthTest = (step(0.8, (mod(vUv.x * 10.0 - thresholdX, 1.0))));
// // // float strengthTest = (step(0.8, (mod(vUv.x * 10.0 - 0.2, 1.0))));
// // strengthTest = smoothstep(0.1, 0.6, strengthTest);
// // //float strength = strengthTest ;
// //     float strength = barX + barY + strengthTest;

// float strength = barX + barY ;


//     // // !! EXPLANATION!! Understanding how the different steps affect the image -i.e. gradient shade the multiplier says howclose of far from the edge the dark part is, 
//     // float strength2 = vUv.x * 10.0; //gradient shade the multiplier says howclose of far from the edge the dark part is, 
//     // //the bigger the multiplier the the closer to the edge. so * 2.0 means the gradient white part ends at 0.5 (half way across the screen)
//     // //- think of it like a value shader to make object look like the have INNER SHADOW
//     // strength2 = mod(strength2,1.0); //the final number(20) of repititions of strength2you get is 10.0/0.5=20 - 0.5 is second value of mod
//     // strength2 = step(0.8, (strength2)); // now with each of the final 20 repititions, limit at 0.5 so that everything below 0.5 is comlpete black (0)and above 0.5 it becomes 1(whhite) 
//     // //  strength *= step(0.9*sin(uTime*5.0), (mod(vUv.y * 10.0, 1.0))) ; //addition shows the union of the two patterns
//     // // strength += step(0.9*sin(uTime*5.0), (mod(vUv.x * 10.0, 1.0))); //addition shows the union of the two patterns
//     // gl_FragColor = vec4(strength2, strength2, strength2, 1.0);


//     gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
//     // // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
//     // float strength = step(0.5, (mod(vUv.x * 10.0, 1.0)));
//     // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

//     // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // 1. Generate oscillation between -1 and 1
// float sinTime = sin(uTime); 
// float cosTime = cos(uTime); 

// // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // Simplified: 0.45 + 0.25 * sinTime
// float thresholdX = 0.3 + 0.35 * cosTime;
// float threshold = 0.45 + 0.25 * sinTime;
//     // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
//     // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
//     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));
//     float barX = step((0.4), (mod(vUv.x * 10.0, 1.0)));
//     barX *= step((0.8), (mod(vUv.y * 10.0+0.2, 1.0))); //addition shows the union of the two patterns
//     // we shift it by 0.2 to the left to take it to the middle of the x-width(0.4) because 0.2 is half of 0.4, the step limit
    
//     // we are pushing the black along the x axis by 0.8(80%) to reveal 20% white, and the pushing black along the y by 04 so that everything above that in the y axis is white
//     float barY = step(0.8, (mod(vUv.x * 10.0 +0.2, 1.0))); // shades plane along the vUv.x axis(horizontal) 1/10th of its width, then divides that by 1 ro repeat it 10 times (10/1), then stop each ones display by cutting it off as black below the step limit of 0.8
//      barY *= step((0.4), (mod(vUv.y * 10.0, 1.0)));
//    //!!find a way to animate barY so that its step value osscilates between 0.2 and 0.6
 

// float strength = barX + barY ;

// gl_FragColor = vec4(strength, strength, strength, 1.0);




// //     // // Pattern 16 - absolute value - make the image black and white
// float strength = abs(vUv.x-0.5);
// // float strength2 = vUv.x;+5;
// // strength += strength2;


// gl_FragColor = vec4(strength, strength, strength, 1.0);


// //     // // Pattern 17 - minimum of absolute value - make the image black and white
// float strength = min(abs(vUv.x-0.5), abs(vUv.y-0.5));
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// //     // // Pattern 18 - max of absolute value - make the image black and white
//float strength = max(abs(vUv.x-0.5), abs(vUv.y-0.5)); // needs extra explanation
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);

// //     // // Pattern 19 - black box inside white box -  thick white frame

// // 1. Generate oscillation between -1 and 1
// float sinTime = sin(uTime); 
// float cosTime = cos(0.8*uTime); 

// // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // Simplified: 0.45 + 0.25 * sinTime
// float thresholdX = 0.2 + 0.1 * cosTime;
// float threshold = 0.45 + 0.25 * sinTime;
// // float strength = step(thresholdX,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// float strength = step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 20 - black box inside white box - thin white frame

// // float strength = step(thresholdX,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // White box:
// // float strength = 1.0-step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// //float strength = step(0.425,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));

// // OR
// float square1 = 1.0-step(0.25,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// float square2 = step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
//  float strength = square1 * square2; //union is their intersection

// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 20 -lined progression along X axisx - thin white frame

//  float strength = floor(vUv.x * 10.0) / 10.0; // needs extra explanation

// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 21 - boxed gradient progression along x and y axes

//  float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
//  float lowResY = floor(vUv.y * 10.0) / 10.0; // needs extra explanation
// //  float strength = step(lowResX, lowResY); // stairs pattern
// // float strength = lowResX +lowResY;
// float strength = lowResX *lowResY;
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 22 - old TV static pattern


// float strength = random(vUv);
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // Pattern 23 - old TV static pattern - bigger squares
// float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// float lowResY = floor(vUv.y * 10.0) / 10.0; // needs extra explanation
// float strength = random(vec2(lowResX, lowResY));
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 24 - old TV static pattern - bigger squares - offst vUv.y, based  on vUv.x
// float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// // float lowResY = floor(vUv.y * 10.0 + vUv.x) / 10.0; // needs extra explanation
// // or
// float lowResY = floor(vUv.y * 10.0 + vUv.x * 5.0)/ 10.0; // needs extra explanation
// vec2 gridUv = vec2(lowResX, lowResY);

// float strength = random(gridUv);
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 25 - length of vUv, make left corner black becoming white towards other corner

// float strength = length(vUv);
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 26 - black center gradient out to white edges
// float strength = length(vUv-0.5);
// // OR
// //float strength = distance(vUv,vec2(0.5, 0.5)); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 27 - white center gradient out to dark edges
// //float strength = 1.0  - length(vUv-0.5);
// // OR
// float strength = 1.0-(distance(vUv,vec2(0.5, 0.5))); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// // strength += strength2;star in the middle of screen
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 28 - Point likt effect / bright white center like a bulb gradient out to dark edges / star / edge approaches 0 but is never 0
// float strength = 0.015/distance(vUv,vec2(0.5, 0.5)); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 29 - stretch Point light effect along the x axis like an oval horizontal light
// // Like a space hip oval 
// vec2 lightUv = vec2(
//     // vUv.x*0.2 +0.4, // strecth (* 0.2) andshift the light to the left (+) 0.4) and then scale it by 0.2 to make it smaller
//     vUv.x*0.1 +0.45,
//     vUv.y * 0.5 + 0.25
// );

// // // or
// // vec2 lightUv = vec2(
// //     // vUv.x*0.2 +0.4, // strecth (* 0.2) andshift the light to the left (+) 0.4) and then scale it by 0.2 to make it smaller
// //     vUv.x,
// //     (vUv.y - 0.5) * 5.0 + 0.5
// // );
// // float strength = 0.15/distance(lightUv,vec2(0.5, 0.5));

// float strength = 0.02/distance(lightUv,vec2(0.5, 0.5)); // bright white light slit in the middle of screen;

// gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // Pattern 30 - glowing star shape in middle
// vec2 lightUvX = vec2(vUv.x*0.1 +0.45, vUv.y * 0.5 + 0.25);
// float lightX = 0.02/distance(lightUvX,vec2(0.5, 0.5));

// vec2 lightUvY = vec2(vUv.y*0.1 +0.45, vUv.x * 0.5 + 0.25);
// float lightY = 0.02/distance(lightUvY,vec2(0.5, 0.5));

// float strength = lightX * lightY; // bright white light slit in the middle of screen;

// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 31 - glowing star shape in middle - rotated by 45 degrees
// // float pi = 3.1415926535897932384626433832795; //we use define at the top instead since PI never changes
// vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5, 0.5));

// vec2 lightUvX = vec2(rotatedUv.x*0.1 +0.45, rotatedUv.y * 0.5 + 0.25);
// float lightX = 0.02/distance(lightUvX,vec2(0.5, 0.5));

// vec2 lightUvY = vec2(rotatedUv.y*0.1 +0.45, rotatedUv.x * 0.5 + 0.25);
// float lightY = 0.02/distance(lightUvY,vec2(0.5, 0.5));

// float strength = lightX * lightY; // bright white light slit in the middle of screen;

// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 32 - black circle in middle of white square
// float strength = distance(vUv, vec2(0.5,0.5));
// strength = step(0.25, strength);
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 33 - blurry black ring with gray center and grey outside
// float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 34 - sharp and clean step of black ring on white square
// float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// strength = step(0.01, strength);
// gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // Pattern 35 - sharp and clean step of white ring on black square
// float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// strength = 1.0 - step(0.01, strength);
// gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // Pattern 36 - wiggly sinusoidal circlee

// vec2 wavedUv = vec2(
//     vUv.x,
//     vUv.y + sin(vUv.x * 30.0) * 0.1
// );
// float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// strength = 1.0 - step(0.01, strength);

// gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // Pattern 37 - wiggly sinusoidal circle along both axes

// vec2 wavedUv = vec2(
//     vUv.x + sin(vUv.y * 30.0) * 0.1,
//     vUv.y + sin(vUv.x * 30.0) * 0.1
// );
// float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// strength = 1.0 - step(0.01, strength);




// // // Pattern 37 - aminated more wiggly sinusoidal circle along both axes

// float sinTime = sin(uTime*0.1); 
// float cosTime = cos(uTime*0.1);

// // To get a value that moves between 20 and 300, use this pattern:
// // midpoint + (half_range) * sin(uTime)
// // midpoint = (20 + 300) / 2 = 160
// // half_range = (300 - 20) / 2 = 140

// float thresholdX =160.0 + 160.0 * cosTime;
// float threshold = 160.0 + 160.0 * sinTime;
// vec2 wavedUv = vec2(
//     vUv.x + sin(vUv.y * thresholdX) * 0.1,
//     vUv.y + sin(vUv.x * threshold) * 0.1
// );
// float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// strength = 1.0 - step(0.01, strength);

// // // Pattern 39 - angled gradient
// float angle = atan(vUv.x, vUv.y);
// float strength = angle;

// // // Pattern 40 - angled gradient, starting from canter of plane
// float angle = atan(vUv.x-0.5, vUv.y-0.5);
// float strength = angle;

// // // Pattern 41 - angled gradient, starting from canter of plane (needs extra explanation)
// float angle = atan(vUv.x-0.5, vUv.y-0.5);
// angle /= PI*2.0;
// angle += 0.5;
// float strength = angle;


// // // Pattern 42 - angled gradient, multiple

// float sinTime = sin(uTime*0.06); 
// float cosTime = cos(uTime*0.06-PI);
// float threshold = 35.0 + 30.0 * cosTime;
// // float smoothThreshold = smoothstep(0.0, 1.0, threshold);

// float angle = atan(vUv.x-0.5, vUv.y-0.5);
// angle /= PI*2.0;
// angle += 0.5;
// // angle *= threshold;
// angle *= 20.0;
// angle = mod(angle, 1.0);
// float strength = angle;

// // // Pattern 43 - reverse of multiple angled gradient,

// float sinTime = sin(uTime*0.6); 
// float cosTime = cos(uTime*0.6-PI);
// // float threshold = 105.0 + 100.0 * cosTime;
// // float smoothThreshold = smoothstep(0.0, 1.0, threshold);

// float angle = 1.0-atan(vUv.x-0.5, vUv.y-0.5);
// angle /= PI*2.0;
// angle += 0.5;

// // float strength = sin(angle*threshold);
//  float strength = sin(angle*20.0);



// // // Pattern 44 - starry circle,

// float sinTime = sin(uTime*0.6-PI); 
// float cosTime = -cos(uTime*0.03);
// float threshold = 5.45 + 5.45 * cosTime;

// float angle = 1.0-atan(vUv.x-0.5, vUv.y-0.5);
// angle /= PI*2.0;
// angle += 0.5;

// float sinusoid = sin(angle*100.0);

// // float radius = 0.25 + sinusoid * threshold;
// float radius = 0.25 + sinusoid * 0.02;
// float strength = 1.0 - step(0.01,abs(distance(vUv, vec2(0.5,0.5))-radius));



// // // Pattern 45 - perlin noise to mimic nature algorithm,

// float strength = cnoise(vUv*10.0);

// // Pattern 46 - perlin noise to mimic nature algorithm,

// // float cosTime = cos(uTime*0.9);
// // float threshold = 0.3875 + 0.3625 * cosTime;
// // float strength = step(threshold, cnoise(vUv*10.0));
// float strength = step(0.0, cnoise(vUv*10.0));


// Pattern 47 - inverse of absolute value of perlin noise to mimic nature algorithm,

// float cosTime = cos(uTime*0.9);
// float threshold = 0.3875 + 0.3625 * cosTime;
// float strength = step(threshold, cnoise(vUv*10.0));
// float strength = 1.0-abs( cnoise(vUv*10.0));



// Pattern 48 - inverse of absolute value of perlin noise to mimic nature algorithm,

// float strength = step(threshold, cnoise(vUv*10.0));

// // animated version
// float cosTime = cos(uTime*0.05-PI);
// float sinTime = sin(uTime*0.01);
// float threshold = 110.0 + 100.0 * cosTime;
// float thresholdB = 1.0 + 1.0 * sinTime;


// // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5, 0.5));
// vec2 rotatedUv = rotate(vUv, PI * thresholdB, vec2(0.5, 0.5));
//  //float strength = step(10.0, cnoise(vUv*10.0));
// //  float strength = sin(cnoise(vUv*10.0)*threshold);
// float strength = sin(cnoise(rotatedUv*10.0)*threshold);
// // strength = step(thresholdB, strength);




// float strength = step(0.9,sin(cnoise(vUv*10.0)*20.0));
// // note that when strength goes above 1, strength > 1.0, it will go further than 1.0, so we need to clamp it to 1.0
// strength = clamp(strength, 0.0, 1.0);


// // Colored version
// vec3 blackColor = vec3(0.0);
// vec3 uvColor = vec3(vUv,1.0); // the color that will show up in the white
// vec3 mixedColor = mix(blackColor, uvColor, strength); //black parts stay black, white parts get uv color

// // gl_FragColor = vec4(uvColor, 1.0);
// gl_FragColor = vec4(mixedColor, 1.0);
// gl_FragColor = vec4(mix(blackColor, uvColor, strength), 1.0);



// black and white version
// gl_FragColor = vec4(strength, strength, strength, 1.0);

// we can create functions for different shapes(patterns) and use thos in other functions, e.g. circle, star etc..
}















//     vec3 red = vec3(1.0, 0.0, 0.0);
//     vec3 green = vec3(0.0, 1.0, 0.0);
//     vec3 blue = vec3(0.0, 0.0, 1.0);

//     vec3 colorA = vec3(0.2, 0.6, 1.0);
//     vec3 colorB = vec3(1.0, 0.2, 0.8);

//     vec3 color1 = vec3(1.0, 0.2, 0.2);
//     vec3 color2 = vec3(0.2, 1.0, 0.4);
//     vec3 color3 = vec3(0.2, 0.4, 1.0);

//     // vec3 color;
//     // if (vUv.x > 0.5) {
//     //     color = red;
//     // } else {
//     //     color = blue;
//     // }

//     //animate the color - fade in and our
//      //float t = (sin(0.5*uTime) + 1.0) * 0.5;

// // //Living waves + interpolation
// //     float wave = sin(uTime + vUv.x * 8.0);
// //     float t = smoothstep(-1.0, 1.0, wave);

//     // emotional color pulse
//     // float wave = sin(uTime * 2.0 + vUv.y * 10.0);
//     // float t = smoothstep(-0.3, 0.3, wave);
    
//     //three colors interpolation
//     float t = vUv.x;
//     vec3 blend12 = mix(color1, color2, t);
    
// vec3 finalColor = mix(blend12, color3, vUv.y);


// // //soft glow band using smoothstep
// // float band = smoothstep(0.3, 0.4, vUv.y) 
// //            - smoothstep(0.5, 0.6, vUv.y);

// //vec3 glow = vec3(1.0, 0.6, 0.2) * band;

//     //float t = smoothstep(0.0, 1.0, vUv.x); // more natural eased fade
//     float edge = smoothstep(0.45, 0.55, vUv.x);//Soft Edge Instead of Hard Cut


//     //  float t = uMouse.x * 0.5 + 0.5;
//     //  vec3 mouseColor = mix(color1, color2, t);

//     // mix - can be float or vec2, vec3 etc
//     //vec3 color = mix(colorA, colorB, vUv.x);
//     //  vec3 color = mix(colorA, colorB, t);