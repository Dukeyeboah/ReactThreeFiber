//import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Clone, useGLTF } from '@react-three/drei';

export default function Model() {
//   const model = useLoader(GLTFLoader, './Male_character.glb');

// //   for Draco compression loader
//   const model = useLoader(
//     GLTFLoader,
//     './Male_character.glb',
//     (loader) =>
//     {
//         const dracoLoader = new DRACOLoader()
//         dracoLoader.setDecoderPath('./draco/')
//         loader.setDRACOLoader(dracoLoader)
//     }
// )

const model = useGLTF('./Male_character.glb');
console.log(model)
  return (
    <>
      {/* <primitive object={model.scene} scale={0.5}/> */}
      <Clone object={model.scene} scale={0.5} position-x={-4}/>
      <Clone object={model.scene} scale={0.5} position-x={0}/>
      <Clone object={model.scene} scale={0.5} position-x={4}/>
      </>
  );
}

useGLTF.preload('./Male_character.glb');
// useGLTF.preload('./Male_character.glb',
//     (loader) =>
//     {
//         const dracoLoader = new DRACOLoader()
//         dracoLoader.setDecoderPath('./draco/')
//         loader.setDRACOLoader(dracoLoader)
//     }
// )