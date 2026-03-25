varying vec2 vUv;

void main() {
  vUv = uv;
  // Get the original position of mesh in space 
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);


  // get the position of the mesh in the camera space
  vec4 viewPosition = viewMatrix * modelPosition;


  // get the position of the mesh in the world space
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}

