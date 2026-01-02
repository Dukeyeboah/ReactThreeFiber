import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Placeholder(props) { 
  const boxRef = useRef();
  
    useFrame((state, delta) => {
      //console.log(state)
      // console.log(delta) - //gives frame rate as fraction of a second, so 0.01666 delta = 1/60fps =
      // console.log(state.clock.getElapsedTime())
      // console.log(state.clock.elapsedTime)
      // console.log(state.clock.getDelta())
      boxRef.current.rotation.y += delta * 0.1;
    //   box2Ref.current.rotation.y -= delta * 0.1;
    //   box2Ref.current.position.y = 1.75+0.2*Math.cos(state.clock.elapsedTime*0.1);
      // groupRef.current.rotation.z += delta * 0.1;
    });
  return (
    <group
    // ref={groupRef}
    >
     <mesh ref={boxRef} { ...props}>
        <boxGeometry args={ [ 1, 1, 1, 2, 2, 2 ] } />
        <meshBasicMaterial wireframe color="red" />
    </mesh>
    </group>
  );
}
