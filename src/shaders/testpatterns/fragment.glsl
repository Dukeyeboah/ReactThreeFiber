varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform float uPreviewTexture;
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

// so index determines the rotation direction: 0 = clockwise, 1 = counterclockwise
float alternateDirection(float index)
{
    return mod(index, 2.0) * 2.0 - 1.0;
}

// functions for my kente patterns //What's the stepped-diamond distance at this pixel?
float steppedDiamondDistance(vec2 p, float stairCount, vec2 shapeScale)
{
    p *= shapeScale;
    vec2 steppedP = floor(abs(p) * stairCount)/ stairCount;
    //  vec2 steppedP = floor(abs(p) * stairCount)/ stairCount*cos(uTime * 0.15); //animation worked well-akan
    return steppedP.x + steppedP.y;
}

// Make the repeating concentric color pattern
vec3 steppedConcentricDiamond(
    vec2 uv,
    float stairCount,
    float bandWidth,
    vec2 shapeScale,
    vec3 colorA,
    vec3 colorB,
    vec3 colorC,
    vec3 colorD,
    float modRepitition
)
{
    // Center this little canvas
    vec2 p = uv - 0.5;
    // Get stepped diamond distance
    float d = steppedDiamondDistance(p,stairCount,shapeScale);
    // Turn distance into numbered bands - thickness?
    float band = floor(d / bandWidth); //Every distance range becomes another band.
    // float choice = mod(band+ sin(uTime*0.19), modRepitition+cos(uTime*0.5)*0.6);// Cycle 0,1,2,0,1,2...
    float choice = mod(band, modRepitition);// Cycle 0,1,2,0,1,2...
    // If you want a hard limit, create a mask:
    // float limit =1.0 - step(0.45, d);
    vec3 color; //add  colors
    // where to put colors 
    if (choice < 0.5){ color = colorA;}
    else if (choice < 1.5){color = colorB;}
    else if (choice < 2.5){color = colorC;}
    else{color = colorD;}
    return color;
}


float diamondRing(
    float distance,
    float innerRadius,
    float outerRadius
)
{
    float outerShape =
        1.0 - step(outerRadius, distance);
    float innerShape =
        1.0 - step(innerRadius, distance);
    return outerShape - innerShape;
}

// function to rotate the diamond:
mat2 rotate2D(float angle)
{
    float c = cos(angle);
    float s = sin(angle);

    return mat2(
         c, -s,
         s,  c
    );
}

float staircasePattern(
    vec2 uv,
    float stepCount,
    float stepHeight,
    float thickness,
    float overlap
)
{
    // Which horizontal stair are we standing on?
    float stepIndex = floor(uv.x * stepCount);
    // Height of this stair
    float stairY = stepIndex * stepHeight;
    // Total height occupied by one whole staircase
    float totalRise = stepCount * stepHeight;
    // How far apart repeated staircases are. // More overlap = smaller spacing.
    float layerSpacing = max(0.001,totalRise - overlap);
    // Measure Y relative to our staircase path
    float relativeY = uv.y - stairY;
    // Repeat that vertical distance
    float repeatedY =abs(fract(relativeY / layerSpacing+ 0.5)- 0.5) * layerSpacing;

    // Draw a thin line around the staircase path
    float stairMask =  step(thickness,repeatedY);
    return stairMask;
}

// Each block or step is colored differently
// Colored stairs — same idea as steppedConcentricDiamond:
// number the tread with stepIndex, cycle colors with mod(...).
// Swap to layerIndex below if you want each repeated staircase row colored instead.
vec3 staircasePatternColored(
    vec2 uv,
    float stepCount,
    float stepHeight,
    float thickness,
    float overlap,
    vec3 colorA,
    vec3 colorB,
    vec3 colorC,
    vec3 colorD,
    vec3 background,
    float modRepetition
)
{
    float stepIndex = floor(uv.x * stepCount);
    float stairY = stepIndex * stepHeight;
    float totalRise = stepCount * stepHeight;
    float layerSpacing = max(0.001, totalRise - overlap);
    float relativeY = uv.y - stairY;
    float layerIndex = floor(relativeY / layerSpacing);
    float repeatedY =
        abs(fract(relativeY / layerSpacing + 0.5) - 0.5) * layerSpacing;

    // 1 on the stair line, 0 in the gaps (opposite of staircasePattern's mask)
    float onStair = 1.0 - step(thickness, repeatedY);

    // Color each tread. Use layerIndex instead for per-row coloring:
    // float choice = mod(layerIndex, modRepetition);
    float choice = mod(stepIndex, modRepetition);
    vec3 stairColor;
    if (choice < 0.5) { stairColor = colorA; }
    else if (choice < 1.5) { stairColor = colorB; }
    else if (choice < 2.5) { stairColor = colorC; }
    else { stairColor = colorD; }

    return mix(background, stairColor, onStair);
}

// Color each CONTINUOUS diagonal staircase band (the gold strips in your screenshot),
// not each individual tread block. layerIndex stays constant along one diagonal band.
vec3 staircaseBandsColored(
    vec2 uv,
    float stepCount,
    float stepHeight,
    float thickness,
    float overlap,
    vec3 colorA,
    vec3 colorB,
    vec3 colorC,
    vec3 colorD,
    vec3 lineColor,
    float modRepetition
)
{
    float stepIndex = floor(uv.x * stepCount);
    float stairY = stepIndex * stepHeight;
    float totalRise = stepCount * stepHeight;
    float layerSpacing = max(0.001, totalRise - overlap);
    float relativeY = uv.y - stairY;
    float layerIndex = floor(relativeY / layerSpacing);
    float repeatedY =
        abs(fract(relativeY / layerSpacing + 0.5) - 0.5) * layerSpacing;

    float onStair = 1.0 - step(thickness, repeatedY);

    // One color per continuous diagonal band (former gold sections)
    float choice = mod(layerIndex, modRepetition);

    vec3 bandColor;
    if (choice < 0.5) { bandColor = colorA; }
    else if (choice < 1.5) { bandColor = colorB; }
    else if (choice < 2.5) { bandColor = colorC; }
    else { bandColor = colorD; }

    // Gaps/bands get the cycling colors; stair lines stay lineColor
    return mix(bandColor, lineColor, onStair);
}

void main()
{
    // Texture from Leva (folder pick or upload). Uncomment / mix as you like:
    vec4 texColor = texture2D(uTexture, vUv);
    if (uPreviewTexture > 0.5) {
      gl_FragColor = texColor;
      return;
    }
    float t = uTime;


// CELLS & GRIDS UNCOMMENT TO LIKE 976
    // Pattern 9b redone - repeated pattern of blend from black to white from bottom to top (thin step limit = 0.8)
    // for animation of the pattern, we can use a pulse function to create a motion pulse
    //SETUP AND FLOAT VARIABLES FOR THE PATTERNS
    float pulsef = mix(2.0, 1.0, (cos(uTime * 0.25) + 1.0) * 0.5); //motion pulse
    float vUvScale = 10.0; //scale of new Uv
    float modDivider = 1.0; //divider for the modulo function
    float piDivider = 0.25; //1/4 in order to get 45 degrees, because Pi = 180
    float rotateAngle = PI * piDivider; //angle for the rotation
    float stepThreshold = 0.5;
    float smoothStart = 0.25; //smooth start threshold for the smoothstep function
    float smoothEnd = 0.75; //smooth end threshold for the smoothstep function
    // FOUNDATIONAL PATTERN SETUPS
    
    float designX = vUv.x * 180.0; //vUv.x expanded from 1 to 10
    float designY = vUv.y * 80.0;
    float designDiag = (vUv.x + vUv.y) * 10.0;
    float designDiagB = (vUv.x - vUv.y) * 10.0;

    // Opposite Directed Division Patterns can be used to create same patters in opposite directions
    // float vUvX_opp = (1.0 - vUv.x);
    // float vUvY_opp = (1.0 - vUv.y);
    // float designX_opp = vUvX_opp * 10.0;
    // float designY_opp = vUvY_opp * 10.0;
    // float designDiag_opp = (vUvX_opp + vUvY_opp) * 10.0;
    // float designDiagB_opp = (vUvX_opp - vUvY_opp) * 10.0;
    
    //for animations
    float modYMoveX = mod(designY, 1.0 + cos(vUv.x * pulsef)); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    float modXMoveY = mod(designX, 1.0+ cos(vUv.y * pulsef));//maye y part move

// animation that worked well -akan akwasi 
// float modY = mod(designY, 1.0*cos(uTime * 0.05+PI*0.25)+1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
//     float modX = mod(designX, 1.0*cos(uTime * 0.05+PI*0.25)+1.0 ); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    // STRAIGHT divisions PATTERN - NO ANIMATION
    float modY = mod(designY, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    float modX = mod(designX, 1.0 ); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    // DIAGONAL divisions PATTERNS - 
    float modDiag = mod(designDiag * 10.0, 1.0);//↘  top-left → bottom-right
    float modDiagB = mod(designDiagB * 10.0, 1.0);// ↗  bottom-left → top-right
     // ANOTHER APPROACH to DIagonal, to rotate vUV at angle around center then scale and modulate:
    vec2 uV45 = rotate(vUv, rotateAngle, vec2(0.5)); // 45° around the center
    float mod45Y = mod(uV45.y * vUvScale, 1.0); //scale & modulate after rotating the vUv 45deg (PI *0.25)around the center
    
    // STEPPED & SMOOTHENED VERSIONS OF THE PATTERNS
    // Stepped repeating division pattern - // step function - returns 0 if the value is less than the stepThreshold, 1 if the value is greater than the threshold
    float modYStep = step(stepThreshold, modY);
    float modXStep = step(stepThreshold, modX);
    float modDiagStep = step(stepThreshold, modDiag);
    float modDiagBStep = step(stepThreshold, modDiagB);
    //Smoothen repeating divisions pattern transition - returns 0 if < 0.25 threshold & 1 if > 0.75 threshold
    float modYSmooth = smoothstep(smoothStart, smoothEnd, modY);
    float modXSmooth = smoothstep(smoothStart, smoothEnd, modX);
    float modDiagSmooth = smoothstep(smoothStart, smoothEnd, modDiag);
    float modDiagBSmooth = smoothstep(smoothStart, smoothEnd, modDiagB);
    
    // COMBINING PATTERNS FOR NEW PATTERNS
    float pattern1 = modY + modX;
    float pattern2 = modY - modX;
    float pattern3 = modY * modX;
    float pattern4 = modY / modX;
    // Stepped patterns
    float pattern1Step = step(stepThreshold, pattern1); //etc
    float pattern2Step = step(stepThreshold, pattern2);//etc
    // smoothened patterns
    float pattern1Smooth = smoothstep(smoothStart, smoothEnd, pattern1);//etc
    float pattern2Smooth = smoothstep(smoothStart, smoothEnd, pattern2);//etc
     //mixed patterns examples:
     float modMix1 = mix(modXStep, modYStep, 0.5);
     float modMix2 = mix(modXSmooth, modYSmooth, 0.5);
     float patternMix1 = mix(pattern1Step, pattern2Step, 0.5);
    //  etc...
   //gl_FragColor = vec4(vec3(modMix1), 1.0); //without color

// COLORS AND PATTERN NUMBERING / SECTIONING
    vec3 color = vec3(0.0, 0.0, 0.0); //void color
    vec3 red = vec3(0.8, 0.1, 0.0); //red color
    vec3 yellow = vec3(1.0, 0.8, 0.0); //yellow color
    vec3 gold = vec3(1.0, 0.6, 0.05);
    vec3 green = vec3(0.0, 1.0, 0.0); //green color
    vec3 turq = vec3(0.0, 0.5, 0.2);
    vec3 blue = vec3(0.0, 0.6, 1.0); //blue color
    vec3 white = vec3(1.0, 1.0, 1.0); //white color
    vec3 black = vec3(0.0, 0.0, 0.0); //black color
    vec3 dark  = vec3(0.02);
    vec3 background = vec3(0.0, 0.0, 0.0);

//  gl_FragColor = vec4(vec3(color*modMix), 1.0); //pattern colored
  //  Numbering the patterns/divisions based on the scale multiplier
   float rowNumberID = floor(vUv.y * 10.0); //to number row sections on Y, from 0 - 9 (based on scale of 10)
   float columnNumberID = floor(vUv.x * 10.0); //to number column sections on X, from 0 - 9 (based on scale of 10)
   // dividing into 2 parts & later 4 quadrants
    float horizontal = smoothstep(smoothStart, smoothEnd, vUv.x); //along x
    float vertical = smoothstep(smoothStart,smoothEnd, vUv.y); //along y, bottom=0, top=1
    // gl_FragColor = vec4(vec3(vertical), 1.0); //test vertical & horizontal
// QUADRANT PATTERNS WITHOUT COLORS
float bottomLeft  = modMix1;
float bottomRight = modMix2;
float topLeft     = modMix2;
float topRight    = modMix1;
// creating quadrants
float bottom = mix(bottomLeft, bottomRight, horizontal);//mix first 2 patterns  based on horizontal design
float top = mix(topLeft, topRight, horizontal);//mix top pattern left to right
float vertHorMix = mix(bottom, top, vertical);//mix the bottom and topthe 
  // gl_FragColor = vec4(vec3(vertHorMix), 1.0);//test

// //DESIGN QUADRANTSWITH COLORS / colored version of the above 4 quadrants
vec3 bottomLeftColor = mix(red, yellow, modMix1); //colors based on desigin mixing from black point to white point,
vec3 bottomRightColor = mix(green, yellow, modMix2);
vec3 topLeftColor = mix(blue, yellow, modMix2);
vec3 topRightColor = mix(yellow, red, modMix1);
// creating quadrants
vec3 bottomColors = mix(bottomLeftColor, bottomRightColor, horizontal);
vec3 topColors = mix(topLeftColor, topRightColor, horizontal);
vec3 finalPatternColors = mix(bottomColors, topColors, vertical); 
// Quadrant with colors
// gl_FragColor = vec4(finalPatternColors, 1.0);



// BUILDING A MULTI-GRID CANVAS!!! - FOUNDATION
//  Grid coordinates - multiple regions:
// float colNum =2.0 * pulsef; //animated pulsating left to right
float colNum =3.0;
float rowNum = 5.0;
float cellModDivider = 3.0; //for mod division 
// Tells you the column and row numbers
float columnPosition = floor(vUv.x * colNum); //Which columnPosition am I currently inside?
float rowPosition = floor(vUv.y * rowNum); // Which row am I currently inside?
float cellNumber = columnPosition + rowPosition * colNum;//unique cell ID number - You can use that ID to decide what happens there.
// Tag cells with 1.0, 0.0, 1.0, 0.0 etc for each column & row
float columnTag = mod(columnPosition, 2.0); //gives us 1.0, 0.0, 1.0, 0.0 etc for each column
float rowTag = mod(rowPosition, 2.0); //gives us 1.0, 0.0, 1.0, 0.0 etc for each row
float cellTag = mod(columnPosition + rowPosition, 2.0); //cycle becomes 012012012...mod(cell, N) //aternating mask
//above cellTag differs from mod(cellNumber, 2.0);
// Use cellTag for conditional pattern placement

// Create vUv within each CELL for its own canvas going from 0 → 1
vec2 cellUv = fract(vUv * vec2(colNum, rowNum)); //Cell's own Uv. fract() gives us the decimal/repeating portion // vec2 cellUv = fract(vUv * 5.0);//simplified the above part
// COLOUMN & ROW NUMBER ID'S WITHIN THE CELL
float cellColumnPosition = floor(cellUv.x * 2.0);
float cellRowPosition = floor(cellUv.y * 2.0);
float innerCellNumber = cellColumnPosition + cellRowPosition * colNum; //unique inner cell ID within the cell
// Tag inner cells with 1.0, 0.0, 1.0, 0.0 etc for each column & row
float cellColumnTag = mod(cellColumnPosition, 2.0);
float cellRowTag = mod(cellRowPosition, 2.0);
float innerCellTag = mod(cellColumnPosition + cellRowPosition, 2.0); 

// PATTERN CREATIONS!!
// KENTE PATTERN DESIGNS

// step- Diamond Pattern:
// create diamond shape
    vec2 p = vUv - 0.5;//  vec2 p = cellUv - 0.5; //coordinates inside the cell, create pattern in each cell
    //  vec2 pCell = cellUv - 0.5; //create pattern in each cell
    // p.x *= 0.6; //scale p.x or p.y before quantization
    float diamond = abs(p.x) + abs(p.y);// float diamond = abs(p.x)*0.5 + abs(p.y);// To make it wider horizontally, make X contribute less to the distance:
    float stepDiamond = step(0.4, diamond); //0.4 gives perfect diamond, and everything less than that forms a smller sized diamond
    // float stepDiamond = step(0.4+cos(uTime * 0.25) *0.3, diamond); //0.7  forms octagon, 0.5 gives perfect diamond, and everything less than that forms a smller sized diamond
    float mask = 1.0 - step(0.7, diamond);
    
    //function STepped concentric diamonds
    // for animation, move the uv before sending it.
vec2 motion2Uv = vUv;
vec2 motionUv = cellUv;
motionUv.y +=sin(uTime * 0.15) * 0.1;
motionUv.x +=cos(uTime * 0.15) * 0.1;
motion2Uv.y +=sin(uTime * 0.15) * 0.1;
motion2Uv.x +=cos(uTime * 0.15) * 0.1;
// Rotation
// float speed = 0.25;
// 3. ROTATION ANGLES
float angle2 = uTime * 0.05 + 0.0;
float angle1 = uTime * -0.005 + 0.0;
// float cosineAngle = 0.5* cos(uTime * 0.5) + 4.0;
vec2 rotatedUv1 = rotate2D(angle1) * vUv;
vec2 rotatedCellUv1 = rotate2D(angle2) * cellUv;

// Patterns created with their functions
   vec3 diamondDesign = steppedConcentricDiamond(
        // mix(vUv, motionUv, 0.5*0.109*pulsef),
        // cellUv, rotatedUv1,
        vUv,
        // 1.0-motion2Uv,
        15.0,
        // 15.0+cos(uTime * 0.25) *0.40,
        0.07,
        vec2(0.7, 1.0),
        turq,
        gold,
        dark,
        red,
        4.0
        // 5.0 +sin(uTime * 0.25) *2.0
    );   

     vec3 diamondDesign2 = steppedConcentricDiamond(
        // mix(vUv, cellUv, 0.5*0.109*pulsef),
        cellUv,
        20.0, //ANIMATE WITH - 20.0+cos(uTime * 0.25) *10.0,
        0.07,
        vec2(1.0, 1.0),
        turq,
        gold,
        dark,
        red,
        3.0 // OR ANIMATE- 5.0 +sin(uTime * 0.25) *2.0
    );    

  // Per-band coloring (each continuous diagonal gold strip a different color):
  vec3 coloredStairs = staircaseBandsColored(
      // vUv,
      cellUv,// motionUv,
      // rotatedCellUv1,
      4.0,//  4.5 + cos(uTime*0.25)*0.70 ,     // number of horizontal steps
      0.045,    // rise of each step // 0.045+sin(uTime*0.25)*0.002,    // rise of each step
      0.05,   // thickness
      0.0595,   // vertical overlap
       turq,
        black,
        dark,
        red,
      gold,   // stair line color (the black strips in your screenshot)
      4.0      // cycle turq → gold → red → dark along consecutive bands
  );
 
//  STAIRCASE PATTERN
  // float stairs = staircasePattern(vUv, 6.0, 0.05, 0.012, 0.05);
  // Old 2-color mix (orange / black):
  // vec3 colar = mix(vec3(1.0, 0.65, 0.0), vec3(0.0), stairs);

  // Per-tread coloring (each block a different color) — keep for later:
  // vec3 coloredStairs = staircasePatternColored(
  //     vUv, 6.0, 0.04, 0.052, 0.005,
  //     black, black, black, black,
  //     gold, 3.0
  // );


  // gl_FragColor = vec4(diamondDesign, 1.0);



    vec3 kenteColor;
    //  vec3 kenteColor = diamondDesign;// set kenteColor now as an option


// gl_FragColor = vec4(vec3(kenteColor), 1.0);

// gl_FragColor = vec4(vec3(kenteColor), 1.0);

// float angle = -uTime * 0.5;
float speed = 0.15;
// 3. ROTATION ANGLES
// float angle1 = uTime * 0.25 + 0.0;
// vec2 rotatedCellUv1 = rotate2D(angleA) * cellUv;

float angleA = uTime * speed + 0.0;
float angleB = -uTime * speed + 0.0;
float angleC = uTime * speed + 0.0;
// float angle2 = uTime * speed * alternateDirection(0.0) + 0.0;
   // 4. THREE INDEPENDENT COORDINATE SYSTEMS
// vec2 rotatedP = rotate2D(angle) * p;//we rotating the coordinates rather than “the diamond”. e rotating the graph paper underneath your drawing.
vec2 rotatedpA = rotate2D(angleA) * p;
vec2 rotatedpB = rotate2D(angleB) * p;
vec2 rotatedpC = rotate2D(angleC) * p;
// 5. THREE STEPPED DIAMOND DISTANCES
// float d = steppedDiamondDistance( protatedP,20.0,vec2(0.7, 0.7));
float dA = steppedDiamondDistance(rotatedpA,40.0,vec2(1.0, 1.0));
float dB = steppedDiamondDistance(rotatedpB,40.0,vec2(1.0, 1.0));
float dC = steppedDiamondDistance(rotatedpC,40.0,vec2(1.0, 1.0));
// 6. TURN THEM INTO RINGS
// float ring =diamondRing(d,0.15,0.20);
    float ringA = diamondRing(dA,0.15,0.20);
    float ringB = diamondRing(dB,0.20,0.25);
    float ringC = diamondRing( dC,0.25,0.30);
    vec3 colour = background;
    colour = mix(colour, turq, ringA);
    colour = mix(colour, gold, ringB);
    colour = mix(colour, red, ringC);

// Conditionals for positioning and placing patterns in respective cell
// I love topRightColor kenete patern
if (cellTag == 0.0) {
  //  finalPatternColors = vec3(bottomLeftColor);
  finalPatternColors = vec3(coloredStairs);
}
// else if (cellTag == 1.0) {
//     finalPatternColors = vec3(topRightColor);
// }
else {
  finalPatternColors = vec3(diamondDesign);
    // finalPatternColors = mix(bottomColors, topColors, vertical);
}

  gl_FragColor = vec4(finalPatternColors, 1.0);
//  gl_FragColor = vec4(finalPatternColors, 1.0);
    //  gl_FragColor = vec4(kenteColor, 1.0);
    // gl_FragColor = vec4((ring *gold), 1.0);
    // gl_FragColor = vec4(colour, 1.0); // multiple rotated



//Divide the plane into 4 quadrants - left bottom=vertical is 0, horizontal is 0.

// float patternA = mix(strength, set, 0.5);
// float patternB = strength + set;

// float horizontalSmooth = smoothstep(0.25, 0.75, vUv.y);//makes transition smoother along vUv.x
// float finalPattern = mix(patternA, patternB, horizontalSmooth);

// Using different patterns for different parts of the screen based on conditionals
// if (vUv.x < 0.5) {
//     strength = mix(strength, set, 0.5);
// }
// else {
//      strength = step(0.5, strength);
// }

    //color * mask You're using strength as a mask to apply the yellow color to the white part.
    // gl_FragColor = vec4(color * strength, 1.0); //if we want to make white part yellow
    //  gl_FragColor = vec4(strength, strength, strength, 1.0);
    // gl_FragColor = vec4(strength, strength, strength, 1.0);

//using pattterns from sectioning off different parts
    // gl_FragColor = vec4(finalPattern, finalPattern, finalPattern, 1.0);

}



// First time createing stepped diamond
//  For your stepped version, scale p before quantization:
    // p.x *= 0.6; //or p.y *= 0.3 or  p+=0.5
    // CREATE THE STAIR-STEP COORDINATES - make diamond edges steps
    // float stairCount = 20.0; //can multiply by pulsef to animate
    // vec2 steppedP =floor(abs(p) * stairCount) / stairCount;//can change p to pCell for pattern within each cell   // CREATE THE DIAMOND SHAPE
    // float steppedDiamond = steppedP.x*(1.0) + steppedP.y *(1.0); //*1.0 multilpier alows us to make it wider or shorter along x or y
    // float steppedMask = 1.0 - step(0.3, steppedDiamond);
    // float bandWidth = 0.07;
    // float band = floor(steppedDiamond / bandWidth);
    // float choice = mod(band, 4.0);
    // //  if (choice < 0.5){ kenteColor = turq;}
    // // else if (choice < 1.5){kenteColor = gold;}
    // // else if (choice < 2.5){kenteColor = dark;}
    // // else{kenteColor = red;}
    // // gl_FragColor = vec4(vec3(choice), 1.0);//could be interesting to animate and color
    

// other threjs patterns from before:

//     // Pattern 9 - repeated pattern of blend from black to white from bottom to top (thin step limit = 0.8)
//     float strength = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
//     // float moduleIndex = floor(vUv.y * 10.0);
//     float set = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
//      strength = step(0.5, strength); //step makes things binary- 0 or 1
//      set = step(0.4, set); //didn't use here

//     // Combination of step and mix
//      strength = mix(strength, set, 0.5);
//     // strength *= set; //So multiplication creates an AND-like operation.Both must be ON for the result to be ON.

//     // strength = smoothstep(0.0, 0.5, strength);
//     // // including colors  
//     // vec3 color = vec3(0.0, 0.0, 0.0); //black color
//     // vec3 yellow = vec3(1.0, 0.8, 0.0); //yellow color
//     // vec3 red = vec3(1.0, 0.0, 0.0); //red color
//     // vec3 green = vec3(0.0, 1.0, 0.0); //black color
//     // if (moduleIndex < 3.0) {
//     //       color = yellow;
//     //   }
//     //   else if (moduleIndex < 7.0) {
//     //       color = red;
//     //   }
//     //   else {
//     //       color = green;
//     //   }
//       // dividing into quadrants
// // Dividing coordinates into 4 regions along x and Y:
// // float horizontal = step(0.5, vUv.x); //along x
// // float vertical = step(0.5, vUv.y); //along y, bottom=0, top=1

// // vec3 bottomLeft  = vec3(1.0, 0.0, 0.0);
// // vec3 bottomRight = vec3(0.0, 1.0, 0.0);
// // vec3 topLeft     = vec3(0.0, 0.0, 1.0);
// // vec3 topRight    = vec3(1.0, 1.0, 0.0);
// // vec3 topLeft2     = vec3(0.0, 1.0, 1.0);
// // vec3 topRight2    = vec3(1.0, 0.0, 1.0);

// // vec3 bottom = mix(bottomLeft, bottomRight, horizontal);
// // vec3 top = mix(topLeft, topRight, horizontal);
// // vec3 finalColor = mix(bottom, top, vertical);//mix the bottom and topthe 
// // //FOr quadrant colors:
// //  gl_FragColor = vec4(finalColor, 1.0);

// // //  grid coordinate - multiple regions:
// // float column = floor(vUv.x * 4.0);
// // float row = floor(vUv.y * 3.0);
// // // We can create a unique ID for every cell
// // float cell = column + row * 4.0;//* 4.0 Because there are 4 columns, Now every section has an ID.You can use that ID to decide what happens there.

// // //saving different patterns for different parts of the screen based on conditionals
// // float patternA = mix(strength, set, 0.5);
// // float patternB = strength + set;

// // float horizontalSmooth = smoothstep(0.25, 0.75, vUv.y);//makes transition smoother along vUv.x

// // float finalPattern = mix(patternA, patternB, horizontalSmooth);

// // Using different patterns for different parts of the screen based on conditionals
// // if (vUv.x < 0.5) {
// //     strength = mix(strength, set, 0.5);
// // }
// // else {
// //      strength = step(0.5, strength);
// // }



//     //color * mask You're using strength as a mask to apply the yellow color to the white part.
//     // gl_FragColor = vec4(color * strength, 1.0); //if we want to make white part yellow
//     //  gl_FragColor = vec4(strength, strength, strength, 1.0);
//     // gl_FragColor = vec4(strength, strength, strength, 1.0);

// //using pattterns from sectioning off different parts
//     // gl_FragColor = vec4(finalPattern, finalPattern, finalPattern, 1.0);



//     // //  OR
//     // // vec3 strength = vec3(step(0.8,(mod(vUv.y * 10.0, 1.0))));
//     // //  gl_FragColor = vec4(strength, 1.0);


//     // // Pattern 10 - repeated pattern of blend from black to white from left to right
//     // float strength = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
//     // float set = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
//     //  strength = step(0.8, strength);
//     //  set = step(0.4, set); //didn't use here
//     // //  strength = mix(strength, set, 0.5);
//     // // strength *= set;

//     // // strength = smoothstep(0.0, 0.5, strength);
    
//     // gl_FragColor = vec4(strength, strength, strength, 1.0);



//     // // Pattern 11 - combination (addition) of repeated pattern of blend from black to white from left to right and bottom to top
//     // // float strength = mod(vUv.x * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
//     // // float strengthB = mod(vUv.y * 10.0, 1.0); // mod - modulo - remainder of division - so we keep repeating it (vUv.y*10.0) for the remainder of the division. 
    
//     // //  strength = step(0.8, strength);
//     // //  strengthB = step(0.8, strengthB); //didn't use here
//     // // //  strength = mix(strength, strengthB, 0.5);
//     // // //  strength *= strengthB; //multiplication shows the intersection of the two patterns - 
//     // // //so image will be where they intersect, the white parts, other parts are 0 times something = 0
//     // //     strength += strengthB; //addition shows the union of the two patterns
//     // // // strength = smoothstep(0.0, 0.5, strength);

//     // // or simpler way
//     // float strength = step(0.8, (mod(vUv.x * 10.0, 1.0)));
//     // strength += step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

//     // gl_FragColor = vec4(strength, strength, strength, 1.0);



//     // // Pattern 12 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
//     // // or simpler way
//     // float strength = step(0.8, (mod(vUv.x * 10.0, 1.0)));
//     // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

//     // gl_FragColor = vec4(strength, strength, strength, 1.0);


// //     // // Pattern 13 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
// //     // // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
// //     // float strength = step(0.5, (mod(vUv.x * 10.0, 1.0)));
// //     // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

// //     // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // 1. Generate oscillation between -1 and 1
// // float sinTime = sin(uTime); 
// // float cosTime = cos(uTime); 

// // // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // // Simplified: 0.45 + 0.25 * sinTime
// // float thresholdX = 0.3 + 0.35 * cosTime;
// // float threshold = 0.45 + 0.25 * sinTime;
// //     // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
// //     // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
// //     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));
// //     float barX = step((0.4), (mod(vUv.x * 10.0, 1.0)));
// //     // float barX = step((threshold), (mod(vUv.x * 10.0, 1.0)));
// //     barX *= step((0.8), (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns
// //     // we shift it by 0.2 to the left to take it to the middle of the x-width(0.4) because 0.2 is half of 0.4, the step limit
    
// //     // we are pushing the black along the x axis by 0.8(80%) to reveal 20% white, and the pushing black along the y by 04 so that everything above that in the y axis is white
// //     float barY = step(0.8, (mod(vUv.x * 10.0 , 1.0))); // shades plane along the vUv.x axis(horizontal) 1/10th of its width, then divides that by 1 ro repeat it 10 times (10/1), then stop each ones display by cutting it off as black below the step limit of 0.8
// //      barY *= step((0.4), (mod(vUv.y * 10.0, 1.0)));
// //     //  barY *= step((thresholdX), (mod(vUv.y * 10.0, 1.0)));
// //    //!!find a way to animate barY so that its step value osscilates between 0.2 and 0.6
    
// //     // barY *= step((threshold), (mod(vUv.y * 10.0, 1.0))) ; //addition shows the union of the two patterns
// //     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));

// //     //  barY = 0.5*sin(uTime*15.0);
// //     //  barY = smoothstep(0.2, 1.0, barY);

// // //  float strengthTest = (step(0.8, (mod(vUv.x * 10.0 - thresholdX, 1.0))));
// // // // float strengthTest = (step(0.8, (mod(vUv.x * 10.0 - 0.2, 1.0))));
// // // strengthTest = smoothstep(0.1, 0.6, strengthTest);
// // // //float strength = strengthTest ;
// // //     float strength = barX + barY + strengthTest;

// // float strength = barX + barY ;


// //     // // !! EXPLANATION!! Understanding how the different steps affect the image -i.e. gradient shade the multiplier says howclose of far from the edge the dark part is, 
// //     // float strength2 = vUv.x * 10.0; //gradient shade the multiplier says howclose of far from the edge the dark part is, 
// //     // //the bigger the multiplier the the closer to the edge. so * 2.0 means the gradient white part ends at 0.5 (half way across the screen)
// //     // //- think of it like a value shader to make object look like the have INNER SHADOW
// //     // strength2 = mod(strength2,1.0); //the final number(20) of repititions of strength2you get is 10.0/0.5=20 - 0.5 is second value of mod
// //     // strength2 = step(0.8, (strength2)); // now with each of the final 20 repititions, limit at 0.5 so that everything below 0.5 is comlpete black (0)and above 0.5 it becomes 1(whhite) 
// //     // //  strength *= step(0.9*sin(uTime*5.0), (mod(vUv.y * 10.0, 1.0))) ; //addition shows the union of the two patterns
// //     // // strength += step(0.9*sin(uTime*5.0), (mod(vUv.x * 10.0, 1.0))); //addition shows the union of the two patterns
// //     // gl_FragColor = vec4(strength2, strength2, strength2, 1.0);


// //     gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
// //     // // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
// //     // float strength = step(0.5, (mod(vUv.x * 10.0, 1.0)));
// //     // strength *= step(0.8, (mod(vUv.y * 10.0, 1.0))); //addition shows the union of the two patterns

// //     // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // 1. Generate oscillation between -1 and 1
// // float sinTime = sin(uTime); 
// // float cosTime = cos(uTime); 

// // // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // // Simplified: 0.45 + 0.25 * sinTime
// // float thresholdX = 0.3 + 0.35 * cosTime;
// // float threshold = 0.45 + 0.25 * sinTime;
// //     // Pattern 14 - combination (multiplication / intersection ) of repeated pattern of blend from black to white from left to right and bottom to top
// //     // the orizontal parts are longer thand vertical part, so we make step smaller in vUv.x
// //     // float barX = step((thresholdX), (mod(vUv.x * 10.0, 1.0)));
// //     float barX = step((0.4), (mod(vUv.x * 10.0, 1.0)));
// //     barX *= step((0.8), (mod(vUv.y * 10.0+0.2, 1.0))); //addition shows the union of the two patterns
// //     // we shift it by 0.2 to the left to take it to the middle of the x-width(0.4) because 0.2 is half of 0.4, the step limit
    
// //     // we are pushing the black along the x axis by 0.8(80%) to reveal 20% white, and the pushing black along the y by 04 so that everything above that in the y axis is white
// //     float barY = step(0.8, (mod(vUv.x * 10.0 +0.2, 1.0))); // shades plane along the vUv.x axis(horizontal) 1/10th of its width, then divides that by 1 ro repeat it 10 times (10/1), then stop each ones display by cutting it off as black below the step limit of 0.8
// //      barY *= step((0.4), (mod(vUv.y * 10.0, 1.0)));
// //    //!!find a way to animate barY so that its step value osscilates between 0.2 and 0.6
 

// // float strength = barX + barY ;

// // gl_FragColor = vec4(strength, strength, strength, 1.0);




// // //     // // Pattern 16 - absolute value - make the image black and white
// // float strength = abs(vUv.x-0.5);
// // // float strength2 = vUv.x;+5;
// // // strength += strength2;


// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // //     // // Pattern 17 - minimum of absolute value - make the image black and white
// // float strength = min(abs(vUv.x-0.5), abs(vUv.y-0.5));
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // //     // // Pattern 18 - max of absolute value - make the image black and white
// //float strength = max(abs(vUv.x-0.5), abs(vUv.y-0.5)); // needs extra explanation
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // //     // // Pattern 19 - black box inside white box -  thick white frame

// // // 1. Generate oscillation between -1 and 1
// // float sinTime = sin(uTime); 
// // float cosTime = cos(0.8*uTime); 

// // // 2. Map -1->1 to 0.2->0.7 in the case of sinTime and 0.3->0.7 in the case of cosTime
// // // Formula: min + (sinTime + 1.0) * 0.5 * (max - min) // very important formula to understand the math behind the step function
// // // Simplified: 0.45 + 0.25 * sinTime
// // float thresholdX = 0.2 + 0.1 * cosTime;
// // float threshold = 0.45 + 0.25 * sinTime;
// // // float strength = step(thresholdX,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // float strength = step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 20 - black box inside white box - thin white frame

// // // float strength = step(thresholdX,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // // White box:
// // // float strength = 1.0-step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // //float strength = step(0.425,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));

// // // OR
// // float square1 = 1.0-step(0.25,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// // float square2 = step(0.2,max(abs(vUv.x-0.5), abs(vUv.y-0.5)));
// //  float strength = square1 * square2; //union is their intersection

// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 20 -lined progression along X axisx - thin white frame

// //  float strength = floor(vUv.x * 10.0) / 10.0; // needs extra explanation

// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 21 - boxed gradient progression along x and y axes

// //  float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// //  float lowResY = floor(vUv.y * 10.0) / 10.0; // needs extra explanation
// // //  float strength = step(lowResX, lowResY); // stairs pattern
// // // float strength = lowResX +lowResY;
// // float strength = lowResX *lowResY;
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 22 - old TV static pattern


// // float strength = random(vUv);
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // // Pattern 23 - old TV static pattern - bigger squares
// // float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// // float lowResY = floor(vUv.y * 10.0) / 10.0; // needs extra explanation
// // float strength = random(vec2(lowResX, lowResY));
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 24 - old TV static pattern - bigger squares - offst vUv.y, based  on vUv.x
// // float lowResX = floor(vUv.x * 10.0) / 10.0; // needs extra explanation
// // // float lowResY = floor(vUv.y * 10.0 + vUv.x) / 10.0; // needs extra explanation
// // // or
// // float lowResY = floor(vUv.y * 10.0 + vUv.x * 5.0)/ 10.0; // needs extra explanation
// // vec2 gridUv = vec2(lowResX, lowResY);

// // float strength = random(gridUv);
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 25 - length of vUv, make left corner black becoming white towards other corner

// // float strength = length(vUv);
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 26 - black center gradient out to white edges
// // float strength = length(vUv-0.5);
// // // OR
// // //float strength = distance(vUv,vec2(0.5, 0.5)); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 27 - white center gradient out to dark edges
// // //float strength = 1.0  - length(vUv-0.5);
// // // OR
// // float strength = 1.0-(distance(vUv,vec2(0.5, 0.5))); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// // // strength += strength2;star in the middle of screen
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 28 - Point likt effect / bright white center like a bulb gradient out to dark edges / star / edge approaches 0 but is never 0
// // float strength = 0.015/distance(vUv,vec2(0.5, 0.5)); // allows us to calculate the distance from the black center so we position it where we want, not just the center
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 29 - stretch Point light effect along the x axis like an oval horizontal light
// // // Like a space hip oval 
// // vec2 lightUv = vec2(
// //     // vUv.x*0.2 +0.4, // strecth (* 0.2) andshift the light to the left (+) 0.4) and then scale it by 0.2 to make it smaller
// //     vUv.x*0.1 +0.45,
// //     vUv.y * 0.5 + 0.25
// // );

// // // // or
// // // vec2 lightUv = vec2(
// // //     // vUv.x*0.2 +0.4, // strecth (* 0.2) andshift the light to the left (+) 0.4) and then scale it by 0.2 to make it smaller
// // //     vUv.x,
// // //     (vUv.y - 0.5) * 5.0 + 0.5
// // // );
// // // float strength = 0.15/distance(lightUv,vec2(0.5, 0.5));

// // float strength = 0.02/distance(lightUv,vec2(0.5, 0.5)); // bright white light slit in the middle of screen;

// // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // // Pattern 30 - glowing star shape in middle
// // vec2 lightUvX = vec2(vUv.x*0.1 +0.45, vUv.y * 0.5 + 0.25);
// // float lightX = 0.02/distance(lightUvX,vec2(0.5, 0.5));

// // vec2 lightUvY = vec2(vUv.y*0.1 +0.45, vUv.x * 0.5 + 0.25);
// // float lightY = 0.02/distance(lightUvY,vec2(0.5, 0.5));

// // float strength = lightX * lightY; // bright white light slit in the middle of screen;

// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 31 - glowing star shape in middle - rotated by 45 degrees
// // // float pi = 3.1415926535897932384626433832795; //we use define at the top instead since PI never changes
// // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5, 0.5));

// // vec2 lightUvX = vec2(rotatedUv.x*0.1 +0.45, rotatedUv.y * 0.5 + 0.25);
// // float lightX = 0.02/distance(lightUvX,vec2(0.5, 0.5));

// // vec2 lightUvY = vec2(rotatedUv.y*0.1 +0.45, rotatedUv.x * 0.5 + 0.25);
// // float lightY = 0.02/distance(lightUvY,vec2(0.5, 0.5));

// // float strength = lightX * lightY; // bright white light slit in the middle of screen;

// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 32 - black circle in middle of white square
// // float strength = distance(vUv, vec2(0.5,0.5));
// // strength = step(0.25, strength);
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 33 - blurry black ring with gray center and grey outside
// // float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 34 - sharp and clean step of black ring on white square
// // float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// // strength = step(0.01, strength);
// // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // // // Pattern 35 - sharp and clean step of white ring on black square
// // float strength = abs(distance(vUv, vec2(0.5,0.5))-0.25);
// // strength = 1.0 - step(0.01, strength);
// // gl_FragColor = vec4(strength, strength, strength, 1.0);


// // // // Pattern 36 - wiggly sinusoidal circlee

// // vec2 wavedUv = vec2(
// //     vUv.x,
// //     vUv.y + sin(vUv.x * 30.0) * 0.1
// // );
// // float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// // strength = 1.0 - step(0.01, strength);

// // gl_FragColor = vec4(strength, strength, strength, 1.0);



// // // // Pattern 37 - wiggly sinusoidal circle along both axes

// // vec2 wavedUv = vec2(
// //     vUv.x + sin(vUv.y * 30.0) * 0.1,
// //     vUv.y + sin(vUv.x * 30.0) * 0.1
// // );
// // float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// // strength = 1.0 - step(0.01, strength);




// // // // Pattern 37 - aminated more wiggly sinusoidal circle along both axes

// // float sinTime = sin(uTime*0.1); 
// // float cosTime = cos(uTime*0.1);

// // // To get a value that moves between 20 and 300, use this pattern:
// // // midpoint + (half_range) * sin(uTime)
// // // midpoint = (20 + 300) / 2 = 160
// // // half_range = (300 - 20) / 2 = 140

// // float thresholdX =160.0 + 160.0 * cosTime;
// // float threshold = 160.0 + 160.0 * sinTime;
// // vec2 wavedUv = vec2(
// //     vUv.x + sin(vUv.y * thresholdX) * 0.1,
// //     vUv.y + sin(vUv.x * threshold) * 0.1
// // );
// // float strength = abs(distance(wavedUv, vec2(0.5,0.5))-0.25);
// // strength = 1.0 - step(0.01, strength);

// // // // Pattern 39 - angled gradient
// // float angle = atan(vUv.x, vUv.y);
// // float strength = angle;

// // // // Pattern 40 - angled gradient, starting from canter of plane
// // float angle = atan(vUv.x-0.5, vUv.y-0.5);
// // float strength = angle;

// // // // Pattern 41 - angled gradient, starting from canter of plane (needs extra explanation)
// // float angle = atan(vUv.x-0.5, vUv.y-0.5);
// // angle /= PI*2.0;
// // angle += 0.5;
// // float strength = angle;


// // // // Pattern 42 - angled gradient, multiple

// // float sinTime = sin(uTime*0.06); 
// // float cosTime = cos(uTime*0.06-PI);
// // float threshold = 35.0 + 30.0 * cosTime;
// // // float smoothThreshold = smoothstep(0.0, 1.0, threshold);

// // float angle = atan(vUv.x-0.5, vUv.y-0.5);
// // angle /= PI*2.0;
// // angle += 0.5;
// // // angle *= threshold;
// // angle *= 20.0;
// // angle = mod(angle, 1.0);
// // float strength = angle;

// // // // Pattern 43 - reverse of multiple angled gradient,

// // float sinTime = sin(uTime*0.6); 
// // float cosTime = cos(uTime*0.6-PI);
// // // float threshold = 105.0 + 100.0 * cosTime;
// // // float smoothThreshold = smoothstep(0.0, 1.0, threshold);

// // float angle = 1.0-atan(vUv.x-0.5, vUv.y-0.5);
// // angle /= PI*2.0;
// // angle += 0.5;

// // // float strength = sin(angle*threshold);
// //  float strength = sin(angle*20.0);



// // // // Pattern 44 - starry circle,

// // float sinTime = sin(uTime*0.6-PI); 
// // float cosTime = -cos(uTime*0.03);
// // float threshold = 5.45 + 5.45 * cosTime;

// // float angle = 1.0-atan(vUv.x-0.5, vUv.y-0.5);
// // angle /= PI*2.0;
// // angle += 0.5;

// // float sinusoid = sin(angle*100.0);

// // // float radius = 0.25 + sinusoid * threshold;
// // float radius = 0.25 + sinusoid * 0.02;
// // float strength = 1.0 - step(0.01,abs(distance(vUv, vec2(0.5,0.5))-radius));



// // // // Pattern 45 - perlin noise to mimic nature algorithm,

// // float strength = cnoise(vUv*10.0);

// // // Pattern 46 - perlin noise to mimic nature algorithm,

// // // float cosTime = cos(uTime*0.9);
// // // float threshold = 0.3875 + 0.3625 * cosTime;
// // // float strength = step(threshold, cnoise(vUv*10.0));
// // float strength = step(0.0, cnoise(vUv*10.0));


// // Pattern 47 - inverse of absolute value of perlin noise to mimic nature algorithm,

// // float cosTime = cos(uTime*0.9);
// // float threshold = 0.3875 + 0.3625 * cosTime;
// // float strength = step(threshold, cnoise(vUv*10.0));
// // float strength = 1.0-abs( cnoise(vUv*10.0));



// // Pattern 48 - inverse of absolute value of perlin noise to mimic nature algorithm,

// // float strength = step(threshold, cnoise(vUv*10.0));

// // // animated version
// // float cosTime = cos(uTime*0.05-PI);
// // float sinTime = sin(uTime*0.01);
// // float threshold = 110.0 + 100.0 * cosTime;
// // float thresholdB = 1.0 + 1.0 * sinTime;


// // // vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5, 0.5));
// // vec2 rotatedUv = rotate(vUv, PI * thresholdB, vec2(0.5, 0.5));
// //  //float strength = step(10.0, cnoise(vUv*10.0));
// // //  float strength = sin(cnoise(vUv*10.0)*threshold);
// // float strength = sin(cnoise(rotatedUv*10.0)*threshold);
// // // strength = step(thresholdB, strength);




// // float strength = step(0.9,sin(cnoise(vUv*10.0)*20.0));
// // // note that when strength goes above 1, strength > 1.0, it will go further than 1.0, so we need to clamp it to 1.0
// // strength = clamp(strength, 0.0, 1.0);


// // // Colored version
// // vec3 blackColor = vec3(0.0);
// // vec3 uvColor = vec3(vUv,1.0); // the color that will show up in the white
// // vec3 mixedColor = mix(blackColor, uvColor, strength); //black parts stay black, white parts get uv color

// // // gl_FragColor = vec4(uvColor, 1.0);
// // gl_FragColor = vec4(mixedColor, 1.0);
// // gl_FragColor = vec4(mix(blackColor, uvColor, strength), 1.0);



// // black and white version
// // gl_FragColor = vec4(strength, strength, strength, 1.0);

// // we can create functions for different shapes(patterns) and use thos in other functions, e.g. circle, star etc..
// // // Creating repeated patterns with grid coordinates etc...


// // independent diamond ring function - Big diamond minus small diamond.
// // large mask − smaller mask = hollow shape / border / ring
// float diamondRing(
//     float distance,
//     float innerRadius,
//     float outerRadius
// )
// {
//     float outerShape =
//         1.0 - step(outerRadius, distance);

//     float innerShape =
//         1.0 - step(innerRadius, distance);

//     return outerShape - innerShape;
// }
















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