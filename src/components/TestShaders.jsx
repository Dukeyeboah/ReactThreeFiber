import testPatternsVertexShader from '../shaders/testpatterns/vertex.glsl?raw';
import testPatternsFragmentShader from '../shaders/testpatterns/fragment.glsl?raw';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';

/** All library images for general `uTexture`. */
const TEST_PATTERN_FILES = [
  'black sword2.png',
  'sankofa 1.png',
  'sankofa.jpg',
  'bi nka bi.gif',
  'dame-dame.gif',
  'gye nyame.gif',
  'mmusuyidee.gif',
  'nea onnim no sua a , ohu.gif',
  'nkyinkyim.gif',
  'nyame dua.gif',
  'nyame ye ohene.gif',
  'owuo atwedee.gif',
];

/** Motifs for `uPattern` (GIF + stills you want as cell patterns). */
const GIF_PATTERN_FILES = [
  'sankofa.jpg',
  'bi nka bi.gif',
  'dame-dame.gif',
  'gye nyame.gif',
  'mmusuyidee.gif',
  'nea onnim no sua a , ohu.gif',
  'nkyinkyim.gif',
  'nyame dua.gif',
  'nyame ye ohene.gif',
  'owuo atwedee.gif',
];

function publicTextureUrl(filename) {
  return `/textures/testPatterns/${encodeURIComponent(filename)}`;
}

const LIBRARY_OPTIONS = Object.fromEntries(
  TEST_PATTERN_FILES.map((filename) => [filename, publicTextureUrl(filename)]),
);

const GIF_PATTERN_OPTIONS = Object.fromEntries(
  GIF_PATTERN_FILES.map((filename) => [filename, publicTextureUrl(filename)]),
);

/** Change this in code to force a default pattern without touching Leva. */
const DEFAULT_GIF_PATTERN = GIF_PATTERN_OPTIONS['sankofa.jpg'];

const TestPatternsShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: [window.innerWidth, window.innerHeight],
    uMouse: [0, 0],
    uTexture: new THREE.Texture(),
    uPattern: new THREE.Texture(),
    uPreviewTexture: 0,
    uPreviewPattern: 0,
    side: THREE.DoubleSide,
  },
  testPatternsVertexShader,
  testPatternsFragmentShader,
);
extend({ TestPatternsShaderMaterial: TestPatternsShaderMaterial });

function configureTexture(tex) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function useLoadedTexture(url) {
  const [texture, setTexture] = useState(() => new THREE.Texture());

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        configureTexture(tex);
        setTexture((prev) => {
          prev?.dispose();
          return tex;
        });
      },
      undefined,
      (err) => {
        console.error('TestShaders: texture failed to load', url, err);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}

export default function Shader({ materialRef: materialRefProp }) {
  const localMaterialRef = useRef();
  const materialRef = materialRefProp ?? localMaterialRef;
  const {
    library,
    upload,
    previewTexture,
    gifPattern,
    previewPattern,
  } = useControls(
    'Test shaders',
    {
      library: {
        value: LIBRARY_OPTIONS[TEST_PATTERN_FILES[0]],
        options: LIBRARY_OPTIONS,
        label: 'From folder',
      },
      upload: { image: undefined, label: 'Upload image' },
      previewTexture: { value: false, label: 'Preview texture' },
      gifPattern: {
        value: DEFAULT_GIF_PATTERN,
        options: GIF_PATTERN_OPTIONS,
        label: 'Motif pattern',
      },
      previewPattern: { value: false, label: 'Preview motif (full plane)' },
    },
    { collapsed: true },
  );

  const textureUrl = upload || library;
  const texture = useLoadedTexture(textureUrl);
  const pattern = useLoadedTexture(gifPattern);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <mesh receiveShadow position={[0, -1.5, 0]} scale={[13, 13, 0.2]}>
      <planeGeometry args={[4, 4, 64, 64]} />
      <testPatternsShaderMaterial
        ref={materialRef}
        uTexture={texture}
        uPattern={pattern}
        uPreviewTexture={previewTexture ? 1 : 0}
        uPreviewPattern={previewPattern ? 1 : 0}
      />
    </mesh>
  );
}
