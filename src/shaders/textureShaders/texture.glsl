
varying vec2 vUv;
verying float vDistance;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;



void main() {
  vUv = uv;

  vec3 pos = position;
  // //   edge driven displacement
//   float dx = 1.0 / 512.0;
//     float dy = 1.0 / 512.0;
//     float c = texture2D(uTexture, uv).r;
//     float right = texture2D(uTexture, uv + vec2(dx, 0.0)).r;
//     float up = texture2D(uTexture, uv + vec2(0.0, dy)).r;
    
//     float edge = abs(c - right) + abs(c - up);

//     vEdge = edge;
//       // 🔥 move along normal (important for sphere)
//     vec3 normalDir = normalize(normalMatrix * normal);
//     pos += normalDir * edge * sin(uTime * 3.0) * 0.5;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

// //Move vertices based on COLORS
// vec3 tex = texture2D(uTexture, uv).rgb;
// vec3 normalDir = normalize(normalMatrix * normal);
// // different channels control different motion
// pos += normalDir * tex.r * 0.3;         // red = outward
// pos += vec3(1.0, 0.0, 0.0) * tex.g * 0.2; // green = sideways
// pos += vec3(0.0, 1.0, 0.0) * tex.b * 0.2; // blue = vertical
// // animate
// pos += normalDir * sin(uTime + tex.r * 5.0) * 0.2;


//   float height = texture2D(uTexture, uv).r;
//   float width = texture2D(uTexture, uv).g;
//   float displacement = (height + width) * 0.5;
//   displacement = (sin(uTime + displacement * 5.0) + 1.0) * 0.5;
// //   pos.z += sin(uTime + height * 5.0) * 0.5;
// //   pos.x += sin(uTime + width * 5.0) * 0.5;
//   pos += normal * displacement;
//   // Get the original position of mesh in space 
//   //  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
 
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Convert mouse to same space (approx)
  vec2 pos2D = modelPosition.xy;
  float dist = distance(pos2D, uMouse);
  // Influence falloff
  float influence = 1.0 / (dist * 3.0 + 1.0);
  // Pulse animation
  float wave = sin(uTime * 2.0 + dist * 10.0) * 0.2;
  float displacement = influence + wave * influence;

  // Move along normal
  vec3 normalModel = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  modelPosition.xyz += normalModel * displacement;
  vDistance = dist;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
}

