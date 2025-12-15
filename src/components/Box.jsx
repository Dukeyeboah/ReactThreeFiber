import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Box({ position = [0, 0, 0] }) {
  const boxRef = useRef();
  const box2Ref = useRef();
  const groupRef = useRef();
  useFrame((state, delta) => {
    //console.log(state)
    // console.log(delta) - //gives frame rate as fraction of a second, so 0.01666 delta = 1/60fps =
    // console.log(state.clock.getElapsedTime())
    // console.log(state.clock.elapsedTime)
    // console.log(state.clock.getDelta())
    boxRef.current.rotation.y += delta * 0.1;
    box2Ref.current.rotation.x += delta * 0.1;
    groupRef.current.rotation.z += delta * 0.1;
  });
  return (
    <group ref={groupRef}>
        <mesh position={position} scale={[0.3, 0.3, 0.3]} ref={boxRef}>
        <boxGeometry args={[1, 1, 1]} />
        {/* <meshStandardMaterial color='#888888' wireframe /> */}
        <meshNormalMaterial />
        </mesh>
        <mesh position={[0,1,0]} scale={1} ref={box2Ref}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        {/* <meshStandardMaterial color='#888888' wireframe /> */}
        <meshStandardMaterial color='greenyellow'/>
        </mesh>
    </group>
  );
}
