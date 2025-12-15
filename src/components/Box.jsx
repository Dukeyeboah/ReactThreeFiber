export default function Box() {
  return (
    <mesh position={[1.75, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='#888888' wireframe />
    </mesh>
  );
}
