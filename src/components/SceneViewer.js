"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildRuins } from "../scenes/scene1/RuinsEnvironment";
import { buildHome } from "../scenes/scene2/HomeEnvironment";
import { buildDinner } from "../scenes/scene3/DinnerEnvironment";
import { buildCollapse } from "../scenes/scene4/CollapseEnvironment";
import { buildRoad } from "../scenes/scene5/RoadEnvironment";

const builders = { ruins: buildRuins, home: buildHome, dinner: buildDinner, collapse: buildCollapse, road: () => buildRoad(false), metamorphosis: (awakened) => buildRoad(awakened) };

export default function SceneViewer({ sceneId, awakened }) {
  const hostRef = useRef(null), stateRef = useRef({});
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(sceneId === "home" || sceneId === "dinner" || sceneId === "collapse" ? 0x18211d : 0x17221f);
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 180);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .065; controls.maxPolarAngle = Math.PI * .49; controls.minPolarAngle = .16; controls.screenSpacePanning = false;
    let current = null;
    const draw = () => {
      if (current) { scene.remove(current.group); current.group.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) mat.dispose(); } }); }
      current = builders[sceneId](awakened); scene.add(current.group); scene.fog = current.group.fog || null;
      camera.position.set(...current.camera.position); controls.target.set(...current.camera.target); controls.minDistance = current.camera.minDistance; controls.maxDistance = current.camera.maxDistance; controls.update();
      const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.render(scene, camera);
    };
    stateRef.current.draw = draw; draw();
    let frame; const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
    const resize = new ResizeObserver(() => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }); resize.observe(host);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); controls.dispose(); scene.remove(current?.group); current?.group.traverse((obj) => { obj.geometry?.dispose(); if (obj.material) for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) mat.dispose(); }); renderer.dispose(); renderer.domElement.remove(); };
  }, [sceneId, awakened]);

  return <div className="viewer" ref={hostRef} aria-label={`Visualização 3D: ${sceneId}`}><span className="viewer-hint">ORBITAR · ZOOM · PAN</span></div>;
}
