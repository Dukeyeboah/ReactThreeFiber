import { Canvas, } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  PivotControls,
  Float,
  MeshReflectorMaterial,
  BakeShadows,
  SoftShadows,
  AccumulativeShadows,
  RandomizedLight,
  ContactShadows,
  Sky,
  Environment,
  Lightformer,
  Stage
} from '@react-three/drei';
import Sphere from './components/Sphere';
import Box from './components/Box';
import Face from './components/Face';
import Floor from './components/Floor';
import CustomObject from './components/CustomObject';
import * as THREE from 'three';
import { useRef } from 'react';
import { Mesh } from 'three';
// import { useControls, 
//   // button 

// } from 'leva';
import { Perf } from 'r3f-perf';

export default function Scene() {
  // const cameraRef = useRef();
    // const controls = useControls({
    //   position: -2,
    // })
  // //change background color
  // const created=({gl, scene})=>{
  //   gl.setClearColor('#ffff00',1) // one way of setting backgroundcolor using gl
  //   scene.background = new THREE.Color('purple'); //other way of setting background color using scene
  // }
  const sphereRef = useRef();
  
 const perfVisible =false;
  // const { perfVisible } = useControls({ perfVisible: true });
  // const { position, color, visible } = useControls('sphere folder', {
  //   visible: true,
  //   position: {
  //     value: { x: 0, y: 1 },
  //     min: -4,
  //     max: 5,
  //     step: 0.01,
  //     joystick: 'invertY',
  //   },
  //   color: 'turquoise',
  //   choice: { options: ['red', 'green', 'blue'] },
  //   clickMe: button(() => {
  //     console.log('button clicked');
  //   }),
  //   //options:['#111111', '#222222', '#333333']
  // });

  // const { contactShadowsColor, contactShadowsOpacity, contactShadowsBlur } =
  //   useControls('contact shadows', {
  //     contactShadowsColor: '#000000',
  //     contactShadowsOpacity: { value: 0.5, min: 0, max: 1 },
  //     contactShadowsBlur: { value: 1, min: 0, max: 10 },
  //   });

  // const {sunPosition} = useControls('sky',{
  //   sunPosition:{value:[1,2,3]}
  // })
  // const {envMapIntensity} = useControls('environment',{
  //   envMapIntensity:{value:1,min:0,max:12}
  // })
  return (
    <Canvas
      // gl={ {
      //     antialias: true,
      //     toneMapping: THREE.CineonToneMapping
      //     outputCOlorSpace:THREE.SRGBColorSpace
      // } }
      //dpr={[1,2]} //default set by three fiber
      shadows={true}
      camera={{ position: [0, 0, 10], fov: 45, near: 0.1, far: 1000 }}
      style={{ width: '100%', height: '100vh' }}
      // onCreated={created}
    >
      <color attach='background' args={['ivory']} />
      {/* <Environment
        //background
        // files={'/textures/cube/px.hdr'}
        preset='sunset'
        ground={{
          height: 7,
          radius: 28,
          scale: 100,
        }}
        resolution={32}
      > */}
        {/* <color args={['black']} attach='background' /> */}
        {/* <Lightformer
          position-z={-5}
          scale={5}
          form='ring'
          type='sphere'
          color='red'
          intensity={100}
        /> */}
        {/* <mesh position-z={-5} scale={8}>
          <planeGeometry />
          <meshBasicMaterial color={[10,0,0]} />
        </mesh> */}
      {/* </Environment> */}
      {/* <Sky sunPosition={sunPosition}/> */}
      {/* <ambientLight intensity={1.2} /> */}
      {/* <directionalLight
        // position={[0, 5, 5]}
        position={sunPosition}
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={10}
        shadow-camera-top={5}
        shadow-camera-right={5}
        shadow-camera-bottom={-5}
        shadow-camera-left={-5}
      /> */}
      {/* <BakeShadows /> */}
      {/* <ContactShadows
        position={[0, 0, 0]}
        scale={10}
        resolution={512}
        far={5}
        color={contactShadowsColor}
        opacity={contactShadowsOpacity}
        blur={contactShadowsBlur}
        frames={1}
      /> */}
      {/* <SoftShadows size={ 50 } near={1} samples={ 10 } focus={ 0 } />
       */}
      {/* <AccumulativeShadows
        position={[0, -0.99, 0]}
        scale={20}
        color='#316d39'
        opacity={0.8}
        frames={Infinity}
        temporal
        blend={100}
      >
        <RandomizedLight
          amount={8}
          radius={1}
          ambient={0.5}
          intensity={3}
          position={[1, 2, 3]}
          bias={0.001}
        />
      </AccumulativeShadows> */}
      {/* <mesh
        castShadow
        ref={sphereRef}
        position={[position.x, position.y, 0]}
        scale={0.5}
        visible={visible}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh
        castShadow
        position={[position.x + 3, 1, 0]}
        scale={0.5}
        visible={visible}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh> */}
      {/* <TransformControls object={sphereRef} mode='translate' /> */}
      {/* <Box position={[1.75, 0, 0]} />
      <Sphere position={[-1.75, 0, 0]} /> */}
      {/* <CustomObject/> */}
      {/* <Floor position={[0, -1.5, 0]} /> */}
      {/* <PivotControls
        anchor={[0, 0, 0]}
        depthTest={false}
        lineWidth={4}
        axisColors={['#9381ff', '#ff4d6d', '#7ae582']}
        scale={100}
        fixed={true}
        hidden={true}
      >
        <Float speed={5} floatIntensity={2}>
          <mesh position-x={-3} scale={0.3}>
            <sphereGeometry />
            <meshStandardMaterial color='orange' />
          </mesh>
        </Float>
      </PivotControls> */}
      {/* <mesh
        // receiveShadow
        position={[0, 0, 0]}
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color='yellowgreen' /> */}
      {/* <meshStandardMaterial color='#888888' wireframe /> */}
      {/* <meshStandardMaterial color='pink' /> */}
      {/* <MeshReflectorMaterial
          mirror={0.5}
          color='white'
          //   metalness={0.5}
          //   roughness={0.5}
          blur={[1000, 500]}
          mixBlur={30}
          //   mixStrength={60}
          //   mixContrast={1}
          //   resolution={1024}
          //   depthScale={0.01}
          //   minDepthThreshold={0.9}
          //   maxDepthThreshold={1}
        /> */}
      {/* </mesh> */}
      {perfVisible && <Perf position='top-left' />}
      <Stage adjustCamera= {[3.5]} intensity={1.5} environment="studio" shadows={{type:'contact', preset:'upfront'}} >
      <mesh
        castShadow
        ref={sphereRef}
        position={[0, 1, 0]}
        scale={1}
        visible={true}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='turquoise' />
      </mesh>
      <Box/>
      <Face position={[3,4,0]} />
      {/* <Face position={[-3,4,0]} /> */}
      {/* <mesh
        castShadow
         position={[position.x , position.y+1.7, 0]}
        scale={1.5}
        visible={visible}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='crimson'/>
      </mesh> */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </Stage >
    </Canvas>
  );
}
