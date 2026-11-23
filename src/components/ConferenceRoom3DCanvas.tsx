import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ROOM_ENDPOINTS,
  RoomDesignerState,
  RoomEngineeringReport,
  TableFinish,
} from '../lib/room-designer-catalog';

export type CameraPresetKey = 'iso' | 'front' | 'top' | 'seat';

export interface RoomOverlayFlags {
  showCameraFov: boolean;
  showMicZones: boolean;
  showViewingZone: boolean;
  showSeatStatus: boolean;
}

export interface ConferenceRoom3DHandle {
  setCameraPreset: (preset: CameraPresetKey) => void;
  captureSnapshot: () => string | null;
}

interface ConferenceRoom3DCanvasProps {
  state: RoomDesignerState;
  report: RoomEngineeringReport;
  overlays: RoomOverlayFlags;
  cameraPreset: CameraPresetKey;
  presetNonce: number;
  onWebglFallback?: () => void;
}

const FINISH_PALETTE: Record<TableFinish, { hex: number; grainDark: string; grainLight: string; roughness: number }> = {
  oak: { hex: 0xc89d6c, grainDark: '#a67b4b', grainLight: '#d8b080', roughness: 0.42 },
  walnut: { hex: 0x5d3d28, grainDark: '#3f2617', grainLight: '#734d34', roughness: 0.36 },
  birch: { hex: 0xe3cfb2, grainDark: '#cbb38f', grainLight: '#efe1c9', roughness: 0.46 },
  charcoal: { hex: 0x2b303a, grainDark: '#1f232b', grainLight: '#383e4a', roughness: 0.38 },
};

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

function createWoodTexture(lightHex: string, darkHex: string, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = lightHex;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = darkHex;
    for (let i = 0; i < 90; i++) {
      ctx.globalAlpha = 0.08 + (i % 5) * 0.03;
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      const y = (i / 90) * 512;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + ((i % 7) - 3) * 4, 340, y - ((i % 5) - 2) * 4, 512, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createCarpetFloorTexture(widthM: number, lengthM: number, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e4e8ee';
    ctx.fillRect(0, 0, 512, 512);
    // Subtle architectural carpet tile weave
    ctx.fillStyle = '#d7dde6';
    for (let x = 0; x < 512; x += 64) {
      for (let y = 0; y < 512; y += 64) {
        if (((x + y) / 64) % 2 === 0) {
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x, y, 64, 64);
        }
      }
    }
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#c1cad6';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(Math.max(2, Math.round(widthM / 2)), Math.max(2, Math.round(lengthM / 2)));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createMeetingScreenTexture(
  mode: 'video' | 'content' | 'smd',
  endpointLabel: string,
  smdCols?: number,
  smdRows?: number,
  maxAniso = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 1024, 576);
    grad.addColorStop(0, '#0f1b33');
    grad.addColorStop(1, '#1a2b4c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 576);

    // Header chrome
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, 1024, 48);
    ctx.fillStyle = '#00b4d8';
    ctx.fillRect(28, 16, 16, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(mode === 'smd' ? 'AV LIVE · SEAMLESS SMD LED STAGE' : `AV LIVE · ${endpointLabel}`, 58, 31);

    if (mode === 'content') {
      // Presentation Slide Chart layout
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(48, 82, 928, 444);
      ctx.fillStyle = '#1a2b4c';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Q3 Regional Operations & Enterprise Expansion', 86, 140);
      ctx.fillStyle = '#00b4d8';
      ctx.fillRect(86, 160, 180, 6);

      const bars = [180, 240, 210, 290, 340, 310];
      bars.forEach((h, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#1a2b4c' : '#00b4d8';
        ctx.fillRect(100 + i * 115, 480 - h, 72, h);
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText('Lahore HQ · Karachi Clifton · Islamabad Blue Area', 86, 510);
    } else {
      // Multi-participant video grid (4 tiles)
      const tiles = [
        { x: 40, y: 76, w: 460, h: 224, name: 'Islamabad Executive Hub', bg: '#1e3a5f', accent: '#00b4d8' },
        { x: 524, y: 76, w: 460, h: 224, name: 'Karachi Regional Office', bg: '#203654', accent: '#10b981' },
        { x: 40, y: 318, w: 460, h: 214, name: 'Dubai Partner Desk', bg: '#243b59', accent: '#38bdf8' },
        { x: 524, y: 318, w: 460, h: 214, name: 'Active Speaker Framing', bg: '#162944', accent: '#f59e0b' },
      ];
      tiles.forEach((t, idx) => {
        ctx.fillStyle = t.bg;
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.strokeStyle = idx === 3 ? '#00b4d8' : 'rgba(255,255,255,0.16)';
        ctx.lineWidth = idx === 3 ? 4 : 2;
        ctx.strokeRect(t.x, t.y, t.w, t.h);

        // Abstract participant silhouette
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2, t.y + t.h * 0.42, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(t.x + t.w / 2, t.y + t.h * 0.85, 62, 46, 0, Math.PI, 0);
        ctx.fill();

        // Nameplate
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(t.x + 12, t.y + t.h - 38, 250, 26);
        ctx.fillStyle = t.accent;
        ctx.fillRect(t.x + 12, t.y + t.h - 38, 5, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(t.name, t.x + 26, t.y + t.h - 20);
      });
    }

    if (mode === 'smd' && smdCols && smdRows) {
      // Subtle 500x500mm cabinet grid lines over SMD wall
      ctx.strokeStyle = 'rgba(0, 180, 216, 0.25)';
      ctx.lineWidth = 1.5;
      for (let c = 1; c < smdCols; c++) {
        const x = (c / smdCols) * 1024;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 576);
        ctx.stroke();
      }
      for (let r = 1; r < smdRows; r++) {
        const y = (r / smdRows) * 576;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function buildTableGeometry(shapeType: RoomDesignerState['tableShape'], widthM: number, lengthM: number): THREE.BufferGeometry {
  const hw = widthM / 2;
  const hl = lengthM / 2;
  const shape = new THREE.Shape();

  if (shapeType === 'oval') {
    shape.absellipse(0, 0, hw, hl, 0, Math.PI * 2, false, 0);
  } else if (shapeType === 'boat') {
    const endW = hw * 0.72;
    shape.moveTo(-endW, -hl);
    shape.quadraticCurveTo(-hw * 1.08, 0, -endW, hl);
    shape.quadraticCurveTo(0, hl + 0.08, endW, hl);
    shape.quadraticCurveTo(hw * 1.08, 0, endW, -hl);
    shape.quadraticCurveTo(0, -hl - 0.08, -endW, -hl);
  } else if (shapeType === 'u-shape') {
    const armThick = Math.min(0.85, widthM * 0.26);
    const bridgeThick = Math.min(0.9, lengthM * 0.24);
    shape.moveTo(-hw, -hl);
    shape.lineTo(-hw + armThick, -hl);
    shape.lineTo(-hw + armThick, hl - bridgeThick);
    shape.lineTo(hw - armThick, hl - bridgeThick);
    shape.lineTo(hw - armThick, -hl);
    shape.lineTo(hw, -hl);
    shape.lineTo(hw, hl);
    shape.lineTo(-hw, hl);
    shape.closePath();
  } else {
    // Rounded rectangle
    const r = Math.min(0.14, hw * 0.2, hl * 0.2);
    shape.moveTo(-hw + r, -hl);
    shape.lineTo(hw - r, -hl);
    shape.quadraticCurveTo(hw, -hl, hw, -hl + r);
    shape.lineTo(hw, hl - r);
    shape.quadraticCurveTo(hw, hl, hw - r, hl);
    shape.lineTo(-hw + r, hl);
    shape.quadraticCurveTo(-hw, hl, -hw, hl - r);
    shape.lineTo(-hw, -hl + r);
    shape.quadraticCurveTo(-hw, -hl, -hw + r, -hl);
  }

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 24,
  });
  extrude.rotateX(Math.PI / 2);
  return extrude;
}

function buildErgonomicChair(
  seatMat: THREE.Material,
  frameMat: THREE.Material,
  statusColorHex?: number
): THREE.Group {
  const chair = new THREE.Group();

  // Optional status ring grounded slightly above floor
  if (statusColorHex !== undefined) {
    const ringGeo = new THREE.RingGeometry(0.27, 0.33, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: statusColorHex,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.008;
    chair.add(ring);
  }

  // 5-star base hub & legs
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.06, 12), frameMat);
  hub.position.y = 0.06;
  chair.add(hub);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.024, 0.25), frameMat);
    spoke.position.set(Math.sin(a) * 0.125, 0.045, Math.cos(a) * 0.125);
    spoke.rotation.y = a;
    chair.add(spoke);
  }

  // Pneumatic column
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.36, 12), frameMat);
  stem.position.y = 0.26;
  chair.add(stem);

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.075, 0.45), seatMat);
  seat.position.set(0, 0.46, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  chair.add(seat);

  // Backrest spine + contoured back
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.035), frameMat);
  spine.position.set(0, 0.69, -0.22);
  spine.rotation.x = -0.12;
  chair.add(spine);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.055), seatMat);
  backrest.position.set(0, 0.78, -0.2);
  backrest.rotation.x = -0.1;
  backrest.castShadow = true;
  chair.add(backrest);

  // Armrests
  [-0.25, 0.25].forEach((ax) => {
    const armPost = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.19, 0.035), frameMat);
    armPost.position.set(ax, 0.56, -0.04);
    chair.add(armPost);
    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 0.26), frameMat);
    armPad.position.set(ax, 0.65, 0.02);
    chair.add(armPad);
  });

  return chair;
}

function getCameraPresetVectors(
  preset: CameraPresetKey,
  state: RoomDesignerState,
  report: RoomEngineeringReport
): { pos: [number, number, number]; target: [number, number, number] } {
  const halfLen = state.roomLengthM / 2;
  const centerZ = state.tableOffsetFromWallM + state.tableLengthM * 0.42;

  switch (preset) {
    case 'top':
      return {
        pos: [0, Math.max(8.5, state.roomLengthM * 1.15), centerZ + 0.05],
        target: [0, 0.2, centerZ],
      };
    case 'front':
      // Camera lens perspective looking down the conference table!
      return {
        pos: [0, 1.48, 0.24],
        target: [0, 0.92, state.tableOffsetFromWallM + state.tableLengthM * 0.78],
      };
    case 'seat':
      // Far end executive seat sightline toward front display wall
      return {
        pos: [0, 1.24, Math.min(state.roomLengthM - 0.35, state.tableOffsetFromWallM + state.tableLengthM + 0.45)],
        target: [0, report.displayCenterY, 0.1],
      };
    case 'iso':
    default:
      return {
        pos: [
          state.roomWidthM * 0.72,
          Math.max(4.4, state.ceilingHeightM * 1.45),
          state.roomLengthM * 0.92 + 1.8,
        ],
        target: [0, 0.95, halfLen * 0.85],
      };
  }
}

export const ConferenceRoom3DCanvas = React.forwardRef<ConferenceRoom3DHandle, ConferenceRoom3DCanvasProps>(
  function ConferenceRoom3DCanvas({ state, report, overlays, cameraPreset, presetNonce, onWebglFallback }, ref) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [webglUnavailable, setWebglUnavailable] = useState(false);

    const sceneCtxRef = useRef<{
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      dynamicRoot: THREE.Group;
      maxAniso: number;
      isSoftwareGl: boolean;
      transitionActive: boolean;
      requestRender: () => void;
    } | null>(null);

    const stateRef = useRef(state);
    const reportRef = useRef(report);
    stateRef.current = state;
    reportRef.current = report;

    useImperativeHandle(ref, () => ({
      setCameraPreset: (preset: CameraPresetKey) => {
        const ctx = sceneCtxRef.current;
        if (!ctx) return;
        const { pos, target } = getCameraPresetVectors(preset, stateRef.current, reportRef.current);
        _targetPos.set(pos[0], pos[1], pos[2]);
        _targetLook.set(target[0], target[1], target[2]);
        ctx.transitionActive = true;
        ctx.requestRender();
      },
      captureSnapshot: () => {
        const ctx = sceneCtxRef.current;
        if (!ctx) return null;
        try {
          ctx.renderer.render(ctx.scene, ctx.camera);
          return ctx.renderer.domElement.toDataURL('image/jpeg', 0.9);
        } catch {
          return null;
        }
      },
    }));

    // Initialize WebGL Scene once
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const isSoftwareGl = detectSoftwareWebGL();
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        });
      } catch {
        setWebglUnavailable(true);
        onWebglFallback?.();
        return;
      }

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(container.clientWidth || 800, container.clientHeight || 560);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf1f5f9);
      scene.fog = new THREE.Fog(0xf1f5f9, 18, 42);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();

      const camera = new THREE.PerspectiveCamera(
        45,
        (container.clientWidth || 800) / Math.max(container.clientHeight || 560, 1),
        0.1,
        120
      );

      const initVec = getCameraPresetVectors(cameraPreset, stateRef.current, reportRef.current);
      camera.position.set(...initVec.pos);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(...initVec.target);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.07;
      controls.maxPolarAngle = Math.PI / 2 - 0.02;
      controls.minDistance = 1.4;
      controls.maxDistance = 26;
      controls.update();

      // Architectural 3-point lighting rig
      const hemi = new THREE.HemisphereLight(0xf8fafc, 0xcbd5e1, 0.85);
      hemi.position.set(0, 12, 0);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.45);
      keyLight.position.set(6.5, 9.5, 7.5);
      if (!isSoftwareGl) {
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 32;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        keyLight.shadow.bias = -0.0005;
        keyLight.shadow.normalBias = 0.02;
      }
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
      fillLight.position.set(-6, 5, 4);
      scene.add(fillLight);

      const dynamicRoot = new THREE.Group();
      scene.add(dynamicRoot);

      const maxAniso = renderer.capabilities.getMaxAnisotropy?.() || 1;

      let frameId = 0;
      let disposed = false;
      let renderBusy = false;
      let renderDirty = false;
      let lastTime = performance.now();

      function afterDraw(cb: () => void) {
        if (disposed) return;
        const gl = renderer.getContext() as WebGL2RenderingContext | null;
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (status === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 80);
        }
      }

      function requestRender() {
        if (disposed) return;
        if (renderBusy) {
          renderDirty = true;
          return;
        }
        renderBusy = true;
        frameId = requestAnimationFrame(() => {
          if (disposed) return;
          renderDirty = false;

          const now = performance.now();
          const delta = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          const ctx = sceneCtxRef.current;
          let stillAnimating = false;

          if (ctx && ctx.transitionActive) {
            const lambda = 7.5;
            camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, lambda, delta);
            camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, lambda, delta);
            camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, lambda, delta);
            controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLook.x, lambda, delta);
            controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLook.y, lambda, delta);
            controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLook.z, lambda, delta);

            if (
              camera.position.distanceTo(_targetPos) < 0.02 &&
              controls.target.distanceTo(_targetLook) < 0.02
            ) {
              camera.position.copy(_targetPos);
              controls.target.copy(_targetLook);
              ctx.transitionActive = false;
            } else {
              stillAnimating = true;
            }
          }

          controls.update();
          renderer.render(scene, camera);

          const finishFrame = () => {
            renderBusy = false;
            if (renderDirty || stillAnimating) {
              requestRender();
            }
          };
          if (isSoftwareGl) afterDraw(finishFrame);
          else finishFrame();
        });
      }

      controls.addEventListener('start', () => {
        if (sceneCtxRef.current) {
          sceneCtxRef.current.transitionActive = false;
        }
      });
      controls.addEventListener('change', requestRender);

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setWebglUnavailable(true);
        onWebglFallback?.();
      };
      const handleContextRestored = () => {
        setWebglUnavailable(false);
        requestRender();
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

      const resizeObserver = new ResizeObserver(() => {
        if (!container || disposed) return;
        const w = container.clientWidth || 800;
        const h = Math.max(container.clientHeight || 560, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      });
      resizeObserver.observe(container);

      sceneCtxRef.current = {
        renderer,
        scene,
        camera,
        controls,
        dynamicRoot,
        maxAniso,
        isSoftwareGl,
        transitionActive: false,
        requestRender,
      };

      requestRender();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        resizeObserver.disconnect();
        controls.dispose();
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        envTex.dispose();
        renderer.dispose();
        sceneCtxRef.current = null;
      };
    }, []);

    // Trigger smooth camera transition on preset change
    useEffect(() => {
      const ctx = sceneCtxRef.current;
      if (!ctx) return;
      const { pos, target } = getCameraPresetVectors(cameraPreset, state, report);
      _targetPos.set(pos[0], pos[1], pos[2]);
      _targetLook.set(target[0], target[1], target[2]);
      ctx.transitionActive = true;
      ctx.requestRender();
    }, [cameraPreset, presetNonce]);

    // Rebuild procedural conference room geometry whenever configuration/overlays change
    useEffect(() => {
      const ctx = sceneCtxRef.current;
      if (!ctx) return;
      const { dynamicRoot, maxAniso, isSoftwareGl, requestRender } = ctx;

      // Dispose previous geometries, materials & textures
      dynamicRoot.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (!m) return;
            const std = m as THREE.MeshStandardMaterial;
            std.map?.dispose();
            m.dispose();
          });
        }
      });
      dynamicRoot.clear();

      const endpoint =
        ROOM_ENDPOINTS.find((e) => e.slug === state.endpointSlug) || ROOM_ENDPOINTS[3];
      const W = state.roomWidthM;
      const L = state.roomLengthM;
      const H = state.ceilingHeightM;
      const hw = W / 2;

      // 1. Floor Carpet & Grounding Grid
      const carpetTex = createCarpetFloorTexture(W, L, maxAniso);
      const floorMat = new THREE.MeshStandardMaterial({
        map: carpetTex,
        roughness: 0.9,
        metalness: 0.02,
      });
      const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.08, L + 0.3), floorMat);
      floorMesh.position.set(0, -0.04, L / 2);
      floorMesh.receiveShadow = true;
      dynamicRoot.add(floorMesh);

      // Subtle architectural outer plinth
      const plinthMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7, metalness: 0.1 });
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(W + 0.45, 0.06, L + 0.45), plinthMat);
      plinth.position.set(0, -0.09, L / 2);
      dynamicRoot.add(plinth);

      // 2. Architectural Walls (Front Wall Z=0, Left Wall X=-hw, Right Wall X=+hw glazed cutaway)
      const frontWallColor = state.wallStyle === 'slatted-wood' ? 0x1e293b : 0xe2e8f0;
      const wallMat = new THREE.MeshStandardMaterial({
        color: frontWallColor,
        roughness: 0.78,
        metalness: 0.04,
      });
      const sideWallMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.82,
        metalness: 0.02,
      });

      const frontWall = new THREE.Mesh(new THREE.BoxGeometry(W + 0.24, H, 0.14), wallMat);
      frontWall.position.set(0, H / 2, -0.07);
      frontWall.receiveShadow = true;
      dynamicRoot.add(frontWall);

      // Architectural Acoustic Wood Slats on front wall when selected
      if (state.wallStyle === 'slatted-wood') {
        const slatMat = new THREE.MeshStandardMaterial({ color: 0xb0895c, roughness: 0.55, metalness: 0.05 });
        const slatCount = Math.min(28, Math.floor(W / 0.22));
        const slatGeo = new THREE.BoxGeometry(0.035, H - 0.12, 0.025);
        const instSlats = new THREE.InstancedMesh(slatGeo, slatMat, slatCount);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < slatCount; i++) {
          const sx = -hw + 0.18 + (i / Math.max(slatCount - 1, 1)) * (W - 0.36);
          dummy.position.set(sx, H / 2, 0.014);
          dummy.updateMatrix();
          instSlats.setMatrixAt(i, dummy.matrix);
        }
        instSlats.computeBoundingSphere();
        dynamicRoot.add(instSlats);
      }

      // Left structural wall (solid acoustic side)
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, H, L), sideWallMat);
      leftWall.position.set(-hw - 0.06, H / 2, L / 2);
      leftWall.receiveShadow = true;
      dynamicRoot.add(leftWall);

      // Left acoustic panels if enabled
      if (state.includeAcousticPanels) {
        const acousticFeltMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92, metalness: 0 });
        const panelCount = Math.min(5, Math.max(2, Math.floor((L - 1.5) / 1.1)));
        for (let i = 0; i < panelCount; i++) {
          const pz = 1.4 + i * 1.15;
          const panel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.35, 0.72), acousticFeltMat);
          panel.position.set(-hw + 0.02, 1.55, pz);
          dynamicRoot.add(panel);
        }
      }

      // Entrance door on back-left wall for realistic scale
      const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x1a2b4c, roughness: 0.45, metalness: 0.3 });
      const doorLeafMat = new THREE.MeshStandardMaterial({ color: 0xd6b88e, roughness: 0.55, metalness: 0.05 });
      const doorZ = Math.max(1.2, L - 0.85);
      const doorGroup = new THREE.Group();
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.18, 0.98), doorFrameMat);
      doorFrame.position.set(-hw + 0.02, 1.09, doorZ);
      const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.065, 2.1, 0.88), doorLeafMat);
      doorLeaf.position.set(-hw + 0.025, 1.05, doorZ);
      doorGroup.add(doorFrame, doorLeaf);
      dynamicRoot.add(doorGroup);

      // Right glazed glass partition (low wall cutaway + glass mullions so isometric camera never clips)
      const lowWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, L), sideWallMat);
      lowWall.position.set(hw + 0.05, 0.21, L / 2);
      dynamicRoot.add(lowWall);

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        roughness: 0.08,
        metalness: 0.05,
        transparent: true,
        opacity: isSoftwareGl ? 0.28 : 0.22,
        depthWrite: false,
      });
      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(0.03, Math.min(H - 0.42, 2.15), L - 0.2), glassMat);
      glassPane.position.set(hw + 0.05, 0.42 + Math.min(H - 0.42, 2.15) / 2, L / 2);
      dynamicRoot.add(glassPane);

      const mullionCount = Math.max(3, Math.floor(L / 1.5));
      for (let i = 0; i <= mullionCount; i++) {
        const mz = 0.08 + (i / mullionCount) * (L - 0.16);
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, Math.min(H - 0.42, 2.15), 0.05), doorFrameMat);
        mullion.position.set(hw + 0.05, 0.42 + Math.min(H - 0.42, 2.15) / 2, mz);
        dynamicRoot.add(mullion);
      }

      // 3. Display Wall (Single / Dual 4K Commercial Display OR 500x500mm SMD LED Video Wall)
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32, metalness: 0.65 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.22, metalness: 0.88 });
      const camLensMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.08, metalness: 0.9 });
      const statusCyanMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8 });

      if (state.displayMode === 'smd-wall') {
        const smdTex = createMeetingScreenTexture(
          'smd',
          endpoint.name,
          report.smdStats.cols,
          report.smdStats.rows,
          maxAniso
        );
        const smdFrame = new THREE.Mesh(
          new THREE.BoxGeometry(report.displayWidthM + 0.08, report.displayHeightM + 0.08, 0.09),
          bezelMat
        );
        smdFrame.position.set(0, report.displayCenterY, 0.055);
        smdFrame.castShadow = true;

        const smdFace = new THREE.Mesh(
          new THREE.PlaneGeometry(report.displayWidthM, report.displayHeightM),
          new THREE.MeshBasicMaterial({ map: smdTex })
        );
        smdFace.position.set(0, report.displayCenterY, 0.105);
        dynamicRoot.add(smdFrame, smdFace);
      } else if (state.displayMode === 'dual') {
        const singleW = (report.displayWidthM - 0.06) / 2;
        const screenH = report.displayHeightM;
        const vidTex = createMeetingScreenTexture('video', endpoint.name, undefined, undefined, maxAniso);
        const slideTex = createMeetingScreenTexture('content', endpoint.name, undefined, undefined, maxAniso);

        [-1, 1].forEach((side, idx) => {
          const sx = side * (singleW / 2 + 0.03);
          const casing = new THREE.Mesh(new THREE.BoxGeometry(singleW + 0.04, screenH + 0.04, 0.055), bezelMat);
          casing.position.set(sx, report.displayCenterY, 0.05);
          casing.castShadow = true;
          const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(singleW, screenH),
            new THREE.MeshBasicMaterial({ map: idx === 0 ? vidTex : slideTex })
          );
          panel.position.set(sx, report.displayCenterY, 0.08);
          dynamicRoot.add(casing, panel);
        });
      } else {
        const vidTex = createMeetingScreenTexture('video', endpoint.name, undefined, undefined, maxAniso);
        const casing = new THREE.Mesh(
          new THREE.BoxGeometry(report.displayWidthM + 0.04, report.displayHeightM + 0.04, 0.055),
          bezelMat
        );
        casing.position.set(0, report.displayCenterY, 0.05);
        casing.castShadow = true;
        const panel = new THREE.Mesh(
          new THREE.PlaneGeometry(report.displayWidthM, report.displayHeightM),
          new THREE.MeshBasicMaterial({ map: vidTex })
        );
        panel.position.set(0, report.displayCenterY, 0.08);
        dynamicRoot.add(casing, panel);
      }

      // 4. Composite Conferencing Video Bar / Camera System (3-6 part THREE.Group)
      const camBarGroup = new THREE.Group();
      const barY = Math.max(0.92, report.displayCenterY - report.displayHeightM / 2 - 0.095);
      const barWidth = endpoint.formFactor === 'quad-cam-kit' ? 0.96 : endpoint.formFactor === 'dual-lens-bar' ? 0.84 : 0.72;
      const barBody = new THREE.Mesh(new THREE.BoxGeometry(barWidth, 0.11, 0.1), bezelMat);
      const barGrille = new THREE.Mesh(
        new THREE.BoxGeometry(barWidth - 0.06, 0.085, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.15 })
      );
      barGrille.position.z = 0.052;
      const statusLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.008, 0.014), statusCyanMat);
      statusLed.position.set(0, -0.036, 0.054);

      const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 20), chromeMat);
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.set(0, 0.008, 0.056);
      const lensGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 20), camLensMat);
      lensGlass.rotation.x = Math.PI / 2;
      lensGlass.position.set(0, 0.008, 0.057);

      camBarGroup.add(barBody, barGrille, statusLed, lensRing, lensGlass);

      if (endpoint.formFactor === 'dual-lens-bar' || endpoint.formFactor === 'quad-cam-kit') {
        [-0.085, 0.085].forEach((lx) => {
          const secLens = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 16), camLensMat);
          secLens.rotation.x = Math.PI / 2;
          secLens.position.set(lx, 0.008, 0.056);
          camBarGroup.add(secLens);
        });
      }

      camBarGroup.position.set(0, barY, 0.11);
      dynamicRoot.add(camBarGroup);

      // Credenza / equipment cabinet neatly under the display wall
      const credenzaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.2 });
      const credenzaW = Math.min(W - 0.8, Math.max(1.6, report.displayWidthM * 0.72));
      const credenza = new THREE.Mesh(new THREE.BoxGeometry(credenzaW, 0.56, 0.36), credenzaMat);
      credenza.position.set(0, 0.28, 0.2);
      credenza.castShadow = true;
      credenza.receiveShadow = true;
      dynamicRoot.add(credenza);

      // 5. Conference Table(s) + Bases + Accessories
      const finish = FINISH_PALETTE[state.tableFinish];
      const woodTex = createWoodTexture(finish.grainLight, finish.grainDark, maxAniso);
      const tableMat = new THREE.MeshStandardMaterial({
        map: woodTex,
        roughness: finish.roughness,
        metalness: 0.06,
      });
      const legSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.32, metalness: 0.82 });

      const tStart = state.tableOffsetFromWallM;
      const tMidZ = tStart + state.tableLengthM / 2;

      if (state.tableShape === 'classroom') {
        const rowCount = state.seats >= 18 ? 3 : state.seats >= 8 ? 2 : 1;
        const rowSpacing = Math.max(1.25, state.tableLengthM / Math.max(rowCount, 1));
        const deskW = Math.max(1.8, state.tableWidthM - 0.3);
        for (let r = 0; r < rowCount; r++) {
          const rz = tStart + r * rowSpacing + 0.15;
          const deskTop = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.045, 0.62), tableMat);
          deskTop.position.set(0, 0.74, rz);
          deskTop.castShadow = true;
          deskTop.receiveShadow = true;
          dynamicRoot.add(deskTop);
          [-deskW / 2 + 0.15, deskW / 2 - 0.15].forEach((lx) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.45), legSteelMat);
            leg.position.set(lx, 0.36, rz);
            leg.castShadow = true;
            dynamicRoot.add(leg);
          });
        }
      } else {
        const tableGeo = buildTableGeometry(state.tableShape, state.tableWidthM, state.tableLengthM);
        const tableTop = new THREE.Mesh(tableGeo, tableMat);
        tableTop.position.set(0, 0.76, tMidZ);
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        dynamicRoot.add(tableTop);

        // Table pedestals grounded at y=0
        const pedestalPositions: [number, number][] =
          state.tableShape === 'u-shape'
            ? [
                [-state.tableWidthM * 0.37, tStart + 0.65],
                [state.tableWidthM * 0.37, tStart + 0.65],
                [-state.tableWidthM * 0.37, tStart + state.tableLengthM - 0.7],
                [state.tableWidthM * 0.37, tStart + state.tableLengthM - 0.7],
                [0, tStart + state.tableLengthM - 0.45],
              ]
            : state.tableLengthM > 3.2
            ? [
                [0, tStart + state.tableLengthM * 0.24],
                [0, tStart + state.tableLengthM * 0.76],
              ]
            : [[0, tMidZ]];

        pedestalPositions.forEach(([px, pz]) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.71, 16), legSteelMat);
          col.position.set(px, 0.355, pz);
          col.castShadow = true;
          const baseFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.31, 0.03, 20), legSteelMat);
          baseFoot.position.set(px, 0.015, pz);
          dynamicRoot.add(col, baseFoot);
        });

        // Recessed brushed aluminum power/cable grommet
        if (state.tableShape !== 'u-shape') {
          const grommet = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.012, 0.45), chromeMat);
          grommet.position.set(0, 0.77, tMidZ);
          dynamicRoot.add(grommet);
        }
      }

      // Touch Controller Console (Poly TC10 / Cisco Navigator / Tap)
      if (state.includeTouchController || endpoint.includesTouchController) {
        const tcGroup = new THREE.Group();
        const tcBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.16), bezelMat);
        const tcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.012, 0.13), bezelMat);
        tcScreen.position.set(0, 0.04, 0);
        tcScreen.rotation.x = 0.45;
        const tcGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.11), statusCyanMat);
        tcGlow.position.set(0, 0.047, 0.002);
        tcGlow.rotation.x = -Math.PI / 2 + 0.45;
        tcGroup.add(tcBase, tcScreen, tcGlow);
        const tcZ = state.tableShape === 'u-shape' ? tStart + state.tableLengthM - 0.45 : tStart + 0.55;
        tcGroup.position.set(0.18, 0.77, tcZ);
        dynamicRoot.add(tcGroup);
      }

      // Placed Expansion Table Mics & Ceiling Mic Array
      report.micNodes.forEach((mn) => {
        if (mn.type === 'table-pod') {
          const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.026, 20), bezelMat);
          pod.position.set(mn.x, 0.785, mn.z);
          const podRing = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.004, 8, 24), statusCyanMat);
          podRing.rotation.x = Math.PI / 2;
          podRing.position.set(mn.x, 0.799, mn.z);
          dynamicRoot.add(pod, podRing);
        } else if (mn.type === 'ceiling-array') {
          const tile = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.58), sideWallMat);
          tile.position.set(mn.x, Math.min(H - 0.12, 2.75), mn.z);
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, H - tile.position.y, 8), chromeMat);
          rod.position.set(mn.x, (H + tile.position.y) / 2, mn.z);
          const ledRim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.012, 0.6), statusCyanMat);
          ledRim.position.set(mn.x, tile.position.y - 0.022, mn.z);
          dynamicRoot.add(tile, rod, ledRim);
        }
      });

      // 6. Ergonomic Conference Chairs + Per-Seat Status Markers
      const seatFabMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.72, metalness: 0.05 });
      const chairFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.75 });

      report.seatPoints.forEach((seat) => {
        const ringHex = overlays.showSeatStatus
          ? seat.status === 'optimal'
            ? 0x10b981
            : seat.status === 'edge'
            ? 0xf59e0b
            : 0xef4444
          : undefined;

        const chair = buildErgonomicChair(seatFabMat, chairFrameMat, ringHex);
        chair.position.set(seat.x, 0, seat.z);
        chair.rotation.y = seat.angleRad;
        dynamicRoot.add(chair);
      });

      // 7. Webex Designer Spatial Engineering Overlays
      // 7A. Camera Horizontal Field of View (FOV) Wedge
      if (overlays.showCameraFov) {
        const fovRad = THREE.MathUtils.degToRad(endpoint.fovDeg / 2);
        const reach = Math.min(L - 0.1, endpoint.maxOpticalDistanceM);
        const halfSpread = Math.tan(fovRad) * reach;

        const fovShape = new THREE.Shape();
        fovShape.moveTo(0, 0);
        fovShape.lineTo(-halfSpread, reach);
        fovShape.lineTo(halfSpread, reach);
        fovShape.closePath();

        const fovGeo = new THREE.ShapeGeometry(fovShape);
        fovGeo.rotateX(Math.PI / 2);
        const fovMat = new THREE.MeshBasicMaterial({
          color: 0x00b4d8,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const fovMesh = new THREE.Mesh(fovGeo, fovMat);
        fovMesh.position.set(0, 0.022, 0.16);
        dynamicRoot.add(fovMesh);

        // Crisp cyan FOV boundary edges
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-halfSpread, 0.026, 0.16 + reach),
          new THREE.Vector3(0, 0.026, 0.16),
          new THREE.Vector3(halfSpread, 0.026, 0.16 + reach),
          new THREE.Vector3(-halfSpread, 0.026, 0.16 + reach),
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.75 });
        dynamicRoot.add(new THREE.Line(lineGeo, lineMat));
      }

      // 7B. Microphone Acoustic Pickup Zones
      if (overlays.showMicZones) {
        report.micNodes.forEach((mn) => {
          const isBar = mn.type === 'bar';
          const discGeo = isBar
            ? new THREE.CircleGeometry(mn.radiusM, 40, -Math.PI * 0.55, Math.PI * 1.1)
            : new THREE.CircleGeometry(mn.radiusM, 36);
          discGeo.rotateX(-Math.PI / 2);
          if (isBar) {
            discGeo.rotateY(-Math.PI / 2);
          }

          const discMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: isBar ? 0.09 : 0.11,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const disc = new THREE.Mesh(discGeo, discMat);
          disc.position.set(mn.x, 0.805, mn.z);
          dynamicRoot.add(disc);

          const ringGeo = new THREE.RingGeometry(mn.radiusM - 0.03, mn.radiusM, 44);
          ringGeo.rotateX(-Math.PI / 2);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0x059669,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(mn.x, 0.808, mn.z);
          dynamicRoot.add(ring);
        });
      }

      // 7C. AVIXA Display Viewing Zone (4/6/8 Rule Corridor)
      if (overlays.showViewingZone) {
        const minD = report.minViewingDistM;
        const maxD = Math.min(L - 0.15, report.maxViewingDistM);
        if (maxD > minD) {
          const arcGeo = new THREE.RingGeometry(minD, maxD, 48, 1, -Math.PI * 0.35, Math.PI * 0.7);
          arcGeo.rotateX(-Math.PI / 2);
          arcGeo.rotateY(-Math.PI / 2);
          const arcMat = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.09,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const arcMesh = new THREE.Mesh(arcGeo, arcMat);
          arcMesh.position.set(0, 0.015, 0.1);
          dynamicRoot.add(arcMesh);
        }
      }

      requestRender();
    }, [state, report, overlays]);

    if (webglUnavailable) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-[#1A2B4C] p-6 text-center">
          <p className="font-bold text-base mb-1">3D WebGL Context Unavailable</p>
          <p className="text-xs text-slate-600 max-w-md">
            Switch to the 2D CAD Floorplan mode above to inspect exact dimensions, camera FOV angles, and acoustic coverage zones.
          </p>
        </div>
      );
    }

    return <div ref={mountRef} className="w-full h-full select-none cursor-grab active:cursor-grabbing" />;
  }
);
