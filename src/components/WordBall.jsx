import * as THREE from 'three';
import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';

// Portfolio words array
const portfolioWords = [
  'Prompt Engineer',
  'Developer',
  'Art',
  'AI Art',
  'Resume',
  'afrospiritart',
  'Writer',
  'Creative',
  'Designer',
  'Innovator',
  'Technologist',
  'Artist',
  'Coder',
  'Thinker',
  'Builder',
  'Creator',
];

function Word({ children, ...props }) {
  const color = new THREE.Color();
  const fontProps = {
    font: '/Orbitron-Regular.woff',
    fontSize: 2.5,
    letterSpacing: -0.05,
    lineHeight: 1,
    'material-toneMapped': false,
  };
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const over = (e) => (e.stopPropagation(), setHovered(true));
  const out = () => setHovered(false);
  // Change the mouse cursor on hover¨
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer';
    return () => (document.body.style.cursor = 'auto');
  }, [hovered]);
  // Tie component to the render-loop
  useFrame(() => {
    ref.current.material.color.lerp(
      color.set(hovered ? '#fa2720' : 'black'),
      0.1
    );
  });
  return (
    <Billboard {...props}>
      <Text
        ref={ref}
        onPointerOver={over}
        onPointerOut={out}
        onClick={() => console.log('clicked')}
        {...fontProps}
        children={children}
      />
    </Billboard>
  );
}

function Cloud({ count = 4, radius = 20 }) {
  // Create a count x count portfolio words with spherical distribution
  const words = useMemo(() => {
    const temp = [];
    const spherical = new THREE.Spherical();
    const phiSpan = Math.PI / (count + 1);
    const thetaSpan = (Math.PI * 2) / count;
    let wordIndex = 0;
    for (let i = 1; i < count + 1; i++)
      for (let j = 0; j < count; j++) {
        // Cycle through portfolio words
        const word = portfolioWords[wordIndex % portfolioWords.length];
        wordIndex++;
        temp.push([
          new THREE.Vector3().setFromSpherical(
            spherical.set(radius, phiSpan * i, thetaSpan * j)
          ),
          word,
        ]);
      }
    return temp;
  }, [count, radius]);
  return words.map(([pos, word], index) => (
    <Word key={index} position={pos} children={word} />
  ));
}

export default function WordBall({
  count = 8,
  radius = 20,
  rotation = [10, 10.5, 10],
}) {
  return (
    <group rotation={rotation}>
      <Cloud count={count} radius={radius} />
    </group>
  );
}
