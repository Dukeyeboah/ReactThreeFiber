import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Box({ position = [0, 0, 0] }) {
  const boxRef = useRef();
  const box2Ref = useRef();
  // const groupRef = useRef();
  useFrame((state, delta) => {
    //console.log(state)
    // console.log(delta) - //gives frame rate as fraction of a second, so 0.01666 delta = 1/60fps =
    // console.log(state.clock.getElapsedTime())
    // console.log(state.clock.elapsedTime)
    // console.log(state.clock.getDelta())
    boxRef.current.rotation.y += delta * 0.1;
    box2Ref.current.rotation.y -= delta * 0.1;
    box2Ref.current.position.y = 1.75+0.2*Math.cos(state.clock.elapsedTime*0.1);
    // groupRef.current.rotation.z += delta * 0.1;
  });
  return (
    <group 
    // ref={groupRef}
    >
        {/* <mesh castShadow position={position} scale={[0.3, 0.3, 0.3]} >
        <boxGeometry args={[1, 1, 1]} />
       
        <meshNormalMaterial />
        </mesh> */}
        <mesh
        ref={boxRef}
        
         position={position}
        scale={1.5}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='crimson'/>
      </mesh>
      <mesh
        ref={box2Ref}
        
         position={[0,2,0]}
        scale={1.5}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='mediumpurple'/>
      </mesh>
        {/* <mesh castShadow position={[0,1,0]} scale={1} ref={box2Ref}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color='greenyellow'/>
        </mesh> */}
    </group>
  );
}
