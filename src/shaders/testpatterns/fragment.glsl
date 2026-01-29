varying vec2 vUv;
uniform float uTime;


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
    // // Pattern 1 - first 2 values based on the uV.x = 0 to 1 and uV.y = 0 to 1 
    // (so r value starts at 0 and ends at 1 along the x axis and g value starts at 0 and ends at 1 along the y axis)
    // and the third value (blue) is always 1
    // gl_FragColor = vec4(vUv,1.0, 1.0);

    // // Pattern 2
    // gl_FragColor = vec4(vUv, 0.0, 1.0);

    // Pattern 3 - black to white from left to right
    // vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), vUv.x);
    // gl_FragColor = vec4(color, 1.0);
    // OR
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



    // // Pattern 9 - repeated pattern of blend from black to white from bottom to top (thin step limit = 0.8)
    // float strength = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    // float set = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
    //  strength = step(0.8, strength);
    //  set = step(0.4, set); //didn't use here

    //  Combination of step and mix
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
    // float strength = step(0.8, (mod(vUv.x * 10.0, 1.0)));
    // strength += step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

    // gl_FragColor = vec4(strength, strength, strength, 1.0);



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



// // Pattern 24 - old TV static pattern - bigger squares - offst vUv.y, based  on vUv.x
float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// float lowResY = floor(vUv.y * 10.0 + vUv.x) / 10.0; // needs extra explanation
// or
float lowResY = floor(vUv.y * 10.0 + vUv.x * 5.0)/ 10.0; // needs extra explanation
vec2 gridUv = vec2(lowResX, lowResY);

float strength = random(gridUv);
// strength += strength2;star in the middle of screen
gl_FragColor = vec4(strength, strength, strength, 1.0);






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