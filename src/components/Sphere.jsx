export default function Sphere({ position = [0, 0, 0] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#111111" wireframe />
    </mesh>
  );
}

