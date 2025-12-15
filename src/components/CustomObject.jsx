import { useState } from 'react';
import * as THREE from 'three';

export default function CustomObject() {
  const verticesCount =10 * 3; // 10 triangles with 3 vertices per triangle so count of 30 numbers

  // Generate the random positions once on mount using lazy state initializer
  const [positions] = useState(() => {
    const arr = new Float32Array(verticesCount * 3); // each vertex has 3 values - x, y, z, so makes floar 32  count 90 itemas total (3 for each verex) 

    for (let i = 0; i < verticesCount * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 2;
    }
    return arr;
  });

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          count={verticesCount}
          itemSize={3} //take three each time to form the xyz coordinates of the vertices
          array={positions}
        />
      </bufferGeometry>
      <meshStandardMaterial color='red' side={THREE.DoubleSide} />
    </mesh>
  );
}
