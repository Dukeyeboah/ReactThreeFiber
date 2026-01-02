import * as THREE from 'three';
import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';

// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

export default function Sphere({ position = [0, 0, 0] }) {
  // useFrame((state)=>{
  //     console.log(state)
  //     state.camera.position.z =Math.sin(state.clock.elapsedTime * 0.1)
  //     state.camera.position.x =Math.cos(state.clock.elapsedTime * 0.1)
  //     state.camera.lookAt(0,0,0)

  // })
  // Refs for all meshes
  const ball1ref = useRef();
  const ball2ref = useRef();
  const sphereTopRightRef = useRef();
  const sphereTopLeftRef = useRef();
  const sphereBackRightRef = useRef();
  const sphereBackLeftRef = useRef();
  const capsuleRef = useRef();
  const torusTopRef = useRef();
  const torusBottomRef = useRef();
  const torusEye1Ref = useRef();
  const torusEye2Ref = useRef();
  const torusEye3Ref = useRef();
  const torusMouthRef = useRef();
  const circle1Ref = useRef();
  const circle2Ref = useRef();
  const coneDownRef = useRef();
  const coneUpRef = useRef();
  const pyramidRightRef = useRef();
  const pyramidLeftRef = useRef();
  const cylinderCenterRef = useRef();
  const cylinderTopRef = useRef();
  const cylinderRightRef = useRef();
  const cylinderLeftRef = useRef();
  const dodecahedronRef = useRef();
  const icosahedronRightRef = useRef();
  const icosahedronLeftRef = useRef();
  const octahedronRightRef = useRef();
  const octahedronLeftRef = useRef();
  const planeBackRef = useRef();
  const planeRightRef = useRef();
  const planeLeftRef = useRef();

  useFrame((state) => {
    ball1ref.current.position.y = Math.abs(
      2.2 * Math.cos(state.clock.elapsedTime * 1)
    );
    ball1ref.current.position.x = 2.2 * Math.cos(state.clock.elapsedTime * 0.1);
    ball1ref.current.position.z = -(
      2.2 * Math.sin(state.clock.elapsedTime * 0.1)
    );
    ball2ref.current.position.y = Math.abs(
      2.2 * Math.cos(state.clock.elapsedTime * 1 + Math.PI / 2)
    );
    ball2ref.current.position.x = -(
      2.2 * Math.cos(state.clock.elapsedTime * 0.1)
    );
    ball2ref.current.position.z = 2.2 * Math.sin(state.clock.elapsedTime * 0.1);
    // sphere animation
    // sphereTopRightRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1);
    // sphereTopLeftRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1);
    // sphereBackRightRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    // sphereBackLeftRef.current.rotation.y = state.clock.elapsedTime * 0.1;
     
    // torusEye1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1);
  });
  return (
    <>
      {/* sphere geometry */}
      <mesh ref={ball1ref} position={position} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
      <mesh ref={ball2ref} position={[-3, 4, 0]} scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
      <mesh ref={sphereTopRightRef} position={[4, 8, 1]} scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
      <mesh ref={sphereTopLeftRef} position={[-4, 8, 1]} scale={1.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='pink' />
      </mesh>
      <mesh ref={sphereBackRightRef} position={[25, 30, 80]} scale={9}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='PaleVioletRed' />
      </mesh>
      <mesh ref={sphereBackLeftRef} position={[-25, 30, 80]} scale={9}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='PaleVioletRed' />
      </mesh>
      {/* Capsule Geometry */}
      <mesh ref={capsuleRef} position={[0, 5, 1]} scale={1}>
        <capsuleGeometry args={[1, 1, 8, 8, 1]} />
        <meshStandardMaterial color='yellowgreen' />
      </mesh>

      {/* TOrus Geometry */}
      <mesh ref={torusTopRef} position={[0, 70, -80]} scale={9.5}>
        <torusGeometry args={[10, 0.45, 16, 50, Math.PI]} />
        <meshStandardMaterial color='gold' />
      </mesh>
      <mesh
        ref={torusBottomRef}
        position={[0, -70, 0]}
        //rotation-x={Math.PI / 2}
        scale={8.32}
      >
        <torusGeometry args={[10, 0.45, 16, 50, Math.PI]} />
        <meshStandardMaterial color='gold' />
      </mesh>
      <mesh ref={torusEye1Ref} position={[0, 6, -24]} scale={1.5}>
        <torusGeometry args={[10, 0.25, 16, 50, Math.PI]} />
        <meshStandardMaterial color='skyblue' />
      </mesh>
      <mesh
        ref={torusEye2Ref}
        position={[0, 6, -24]}
        rotation-x={Math.PI / 4}
        scale={1.5}
      >
        <torusGeometry args={[10, 0.25, 16, 50, Math.PI]} />
        <meshStandardMaterial color='skyblue' />
      </mesh>
      <mesh
        ref={torusEye3Ref}
        rotation-x={-Math.PI}
        position={[0, 4, -24]}
        scale={1.5}
      >
        <torusGeometry args={[10, 0.25, 16, 50, Math.PI]} />
        <meshStandardMaterial color='skyblue' />
      </mesh>
      {/* TOrus mouth on floor */}
      <mesh
        ref={torusMouthRef}
        rotation-x={-Math.PI / 2}
        position={[0, -20, 60]}
        scale={1.5}
      >
        <torusGeometry args={[40, 0.65, 16, 50]} />
        <meshStandardMaterial color='PaleVioletRed' />
      </mesh>
      {/* Circle Geometry */}
      <mesh ref={circle1Ref} position={[0, 5, -30]} scale={4}>
        <circleGeometry args={[6, 25, Math.PI / 2 + 1, Math.PI / 2]} />
        <meshStandardMaterial color='coral' wireframe />
      </mesh>
      <mesh ref={circle2Ref} position={[0, 5, -30]} scale={4}>
        <circleGeometry args={[6, 25, 0 - 1, Math.PI / 2]} />
        <meshStandardMaterial color='coral' wireframe />
      </mesh>
      {/* cone Geometry */}
      <mesh
        ref={coneDownRef}
        position={[0, 5, 0]}
        rotation-x={-Math.PI}
        scale={4}
      >
        <coneGeometry args={[6, 10, 32]} />
        <meshStandardMaterial color='hotpink' wireframe />
      </mesh>
      <mesh ref={coneUpRef} position={[0, 5, 30]} scale={4}>
        <coneGeometry args={[6, 10, 32]} />
        <meshStandardMaterial color='lightseagreen' wireframe />
      </mesh>
      {/* Cone Geometry - Pyramids */}
      <mesh ref={pyramidRightRef} position={[60, 0, -80]} scale={3}>
        <coneGeometry args={[6, 10, 3, 1]} />
        <meshStandardMaterial color='gold' />
      </mesh>
      <mesh ref={pyramidLeftRef} position={[-60, 0, -80]} scale={3}>
        <coneGeometry args={[6, 10, 3, 1]} />
        <meshStandardMaterial color='gold' />
      </mesh>
      {/* Cylinder Geometry */}
      <mesh
        ref={cylinderCenterRef}
        position={[0, 5, -80]}
        rotation-x={-Math.PI}
        scale={4}
      >
        <cylinderGeometry args={[5, 10, 32]} />
        <meshStandardMaterial color='yellowgreen' wireframe />
      </mesh>
      <mesh
        ref={cylinderTopRef}
        position={[0, 75, -80]}
        rotation-x={-Math.PI}
        scale={10}
      >
        <cylinderGeometry args={[5, 10]} />
        <meshStandardMaterial color='yellowgreen' wireframe />
      </mesh>
      <mesh
        ref={cylinderRightRef}
        position={[70, 5, 90]}
        rotation-x={-Math.PI}
        scale={4}
      >
        <cylinderGeometry args={[1, 1, 28, 8, 1, false, 0]} />
        <meshStandardMaterial color='paleturquoise' />
      </mesh>
      <mesh
        ref={cylinderLeftRef}
        position={[-70, 5, 90]}
        rotation-x={-Math.PI}
        scale={4}
      >
        <cylinderGeometry args={[1, 1, 28, 8, 1, false, 0]} />
        <meshStandardMaterial color='paleturquoise' />
      </mesh>
      {/* Dodecahedron Geometry */}
      <mesh ref={dodecahedronRef} position={[0, 100, -80]} scale={2}>
        <dodecahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color='red' />
      </mesh>
      {/* Icosahedron Geometry */}
      <mesh ref={icosahedronRightRef} position={[70, 75, 90]} scale={1.5}>
        <icosahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color='lawngreen' />
      </mesh>
      <mesh ref={icosahedronLeftRef} position={[-70, 75, 90]} scale={1.5}>
        <icosahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color='lawngreen' />
      </mesh>
      {/* octahedron Geometry */}
      <mesh ref={octahedronRightRef} position={[60, 25, -80]} scale={1}>
        <octahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color='orangered' />
      </mesh>
      <mesh ref={octahedronLeftRef} position={[-60, 25, -80]} scale={1}>
        <octahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color='orangered' />
      </mesh>
      {/* Plane Geometry */}
      <mesh ref={planeBackRef} position={[0, 0, -180]} scale={30}>
        <planeGeometry args={[7, 5.8]} />
        <meshStandardMaterial color='hotpink' opacity={0.2} transparent />
      </mesh>
      {/* <mesh position={[180, 0, -105]} rotation-y={-Math.PI / 4} scale={30}> */}
      <mesh
        ref={planeRightRef}
        position={[110, 0, -80]}
        rotation-y={-Math.PI / 2}
        scale={30}
      >
        <planeGeometry args={[7, 5.5]} />
        {/* <meshStandardMaterial color='teal' opacity={0.2} transparent /> */}
        <MeshReflectorMaterial
          //mirror={0.5}
          color='white'
          metalness={0.5}
          //   roughness={0.5}
          blur={[1000, 500]}
          mixBlur={30}
        />
      </mesh>
      {/* <mesh position={[-180, 0, -105]} rotation-y={Math.PI / 2} scale={30}> */}
      <mesh
        ref={planeLeftRef}
        position={[-110, 0, -80]}
        rotation-y={Math.PI / 2}
        scale={30}
      >
        <planeGeometry args={[7, 5.5]} />
        {/* <meshStandardMaterial color='teal' opacity={0.2} transparent /> */}
        <MeshReflectorMaterial
          //mirror={0.5}
          color='white'
          metalness={0.5}
          //   roughness={0.5}
          blur={[1000, 500]}
          mixBlur={30}
          //   mixStrength={60}
          //   mixContrast={1}
          //   resolution={1024}
          //   depthScale={0.01}
          //   minDepthThreshold={0.9}
          //   maxDepthThreshold={1}
        />
      </mesh>
      {/* <mesh position={[0, -100, 40]} rotation-x={-Math.PI / 2} scale={75}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color='teal' opacity={0.2} transparent />
        
      </mesh> */}
    </>
  );
}
