import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Keeps a ref pointed at the R3F WebGLRenderer (must be mounted inside <Canvas>).
 */
export function GlBridge({ glRef }) {
  const { gl } = useThree();
  useEffect(() => {
    glRef.current = gl;
    return () => {
      if (glRef.current === gl) glRef.current = null;
    };
  }, [gl, glRef]);
  return null;
}

/**
 * Renders the current shader material to a square still (UV plane, front-on)
 * and triggers a browser download as PNG or JPEG.
 *
 * Color note: PracticeScene Canvas uses `flat`, so on-screen colors are the
 * shader's raw outputs (no sRGB encode). The download must match that — an
 * sRGB render-target was previously double-encoding midtones and shifting
 * turquoise/gold away from what you see on screen.
 */
export function downloadShaderStill(
  gl,
  material,
  { format = 'png', size = 2048, fileName } = {},
) {
  if (!gl || !material) {
    console.warn('downloadShaderStill: missing gl or material');
    return;
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const name =
    fileName ||
    `shader-still-${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;

  const prevRt = gl.getRenderTarget();
  const prevColor = new THREE.Color();
  gl.getClearColor(prevColor);
  const prevAlpha = gl.getClearAlpha();
  const prevOutput = gl.outputColorSpace;
  const prevToneMapping = gl.toneMapping;

  // Match R3F <Canvas flat />: no tone map, no output encode.
  gl.outputColorSpace = THREE.LinearSRGBColorSpace;
  gl.toneMapping = THREE.NoToneMapping;

  const rt = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.UnsignedByteType,
    format: THREE.RGBAFormat,
    // Store shader bytes as written (same as flat on-screen look).
    colorSpace: THREE.LinearSRGBColorSpace,
  });

  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  cam.position.z = 1;

  gl.setRenderTarget(rt);
  gl.setClearColor(0xffffff, 1);
  gl.clear();
  gl.render(scene, cam);

  const pixels = new Uint8Array(size * size * 4);
  gl.readRenderTargetPixels(rt, 0, 0, size, size, pixels);

  gl.setRenderTarget(prevRt);
  gl.setClearColor(prevColor, prevAlpha);
  gl.outputColorSpace = prevOutput;
  gl.toneMapping = prevToneMapping;

  // WebGL is bottom-up; flip for a normal image.
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
  const imageData = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const srcRow = (size - 1 - y) * size * 4;
    const dstRow = y * size * 4;
    imageData.data.set(pixels.subarray(srcRow, srcRow + size * 4), dstRow);
  }
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL(mime, format === 'jpeg' ? 0.92 : undefined);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  a.click();

  rt.dispose();
  mesh.geometry.dispose();
}

/**
 * Fixed bottom-right download control (PNG / JPEG).
 */
export function ShaderDownloadButton({ glRef, materialRef }) {
  const onDownload = (format) => {
    downloadShaderStill(glRef.current, materialRef.current, {
      format,
      size: 2048,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 30,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <button
        type='button'
        onClick={() => onDownload('png')}
        style={buttonStyle}
      >
        Download PNG
      </button>
      <button
        type='button'
        onClick={() => onDownload('jpeg')}
        style={buttonStyle}
      >
        Download JPEG
      </button>
    </div>
  );
}

const buttonStyle = {
  appearance: 'none',
  border: '1px solid #222',
  background: '#111',
  color: '#f5f5f5',
  padding: '10px 14px',
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
  borderRadius: 4,
};
