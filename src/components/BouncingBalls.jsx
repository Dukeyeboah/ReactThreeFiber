import * as THREE from 'three';
import { useRef, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

// Helper function to generate random color
function getRandomColor() {
  // Generate vibrant colors using HSL
  const hue = Math.random() * 360;
  const saturation = 50 + Math.random() * 50; // 50-100% saturation
  const lightness = 40 + Math.random() * 30; // 40-70% lightness
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Helper function to generate random ball data (outside component to avoid linter issues)
function generateBallData(count) {
  return Array.from({ length: count }, () => ({
    initialPosition: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
    ],
    scale: 0.2 + Math.random() * 0.5,
    speed: 0.5 + Math.random() * 0.1, // Each ball has different speed
    phase: Math.random() * Math.PI * 2, // Random starting phase
    color: getRandomColor(), // Random color for each ball
    amplitude: {
      x: 2 + Math.random() * 3,
      y: 2 + Math.random() * 3,
      z: 2 + Math.random() * 3,
    },
  }));
}

export default function BouncingBalls({ position = [0, 0, 0], count = 50 }) {
  const ball1ref = useRef();
  const ball2ref = useRef();
  const bouncingBallsRef = useRef();

  // Generate random positions, scales, and animation properties once using useMemo
  const ballsData = useMemo(() => generateBallData(count), [count]);

  useFrame((state) => {
    // Animate the two original balls
    if (ball1ref.current) {
      ball1ref.current.position.y = Math.abs(
        2.2 * Math.cos(state.clock.elapsedTime * 1)
      );
      ball1ref.current.position.x =
        2.2 * Math.cos(state.clock.elapsedTime * 0.1);
      ball1ref.current.position.z = -(
        2.2 * Math.sin(state.clock.elapsedTime * 0.1)
      );
    }
    if (ball2ref.current) {
      ball2ref.current.position.y = Math.abs(
        2.2 * Math.cos(state.clock.elapsedTime * 0.11 + Math.PI / 2)
      );
      ball2ref.current.position.x = -(
        2.2 * Math.cos(state.clock.elapsedTime * 0.01)
      );
      ball2ref.current.position.z =
        2.2 * Math.sin(state.clock.elapsedTime * 0.01);
    }

    // Animate bouncing balls with unique properties for each
    if (bouncingBallsRef.current) {
      bouncingBallsRef.current.children.forEach((child, index) => {
        const data = ballsData[index];
        const time = state.clock.elapsedTime * data.speed + data.phase;

        child.position.x =
          data.initialPosition[0] + data.amplitude.x * Math.sin(time);
        child.position.y =
          data.initialPosition[1] +
          Math.abs(data.amplitude.y * Math.cos(time * 1.2));
        child.position.z =
          data.initialPosition[2] + data.amplitude.z * Math.cos(time * 0.8);
      });
    }
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

      <group ref={bouncingBallsRef}>
        {ballsData.map((data, index) => (
          <mesh
            key={index}
            geometry={sphereGeometry}
            position={data.initialPosition}
            scale={data.scale}
          >
            <meshStandardMaterial color={data.color} />
          </mesh>
        ))}
      </group>
    </>
  );
}
