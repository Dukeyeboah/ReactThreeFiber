export default function Box({ position = [0, -1.5, 0] }) {
  return (
    <mesh position={position} scale={[200, 1, 200]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* <meshStandardMaterial color='#888888' wireframe /> */}
      <meshStandardMaterial color='pink' />
    </mesh>
  );
}
