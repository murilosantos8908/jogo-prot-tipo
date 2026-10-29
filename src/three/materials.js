import * as THREE from "three";

function makeSurfaceTexture(kind = "wood") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  context.fillStyle = kind === "mud" ? "#77766b" : "#80745f";
  context.fillRect(0, 0, 256, 256);
  let seed = kind === "mud" ? 721 : 1949;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  if (kind === "mud") {
    for (let i = 0; i < 1700; i++) {
      const shade = Math.floor(65 + random() * 100);
      context.fillStyle = `rgba(${shade},${shade},${shade - 8},${.08 + random() * .2})`;
      context.beginPath(); context.ellipse(random() * 256, random() * 256, 1 + random() * 7, 1 + random() * 3, random() * 3, 0, Math.PI * 2); context.fill();
    }
    for (let i = 0; i < 22; i++) { context.strokeStyle = "rgba(30,38,27,.25)"; context.lineWidth = 1 + random() * 3; context.beginPath(); context.moveTo(random() * 256, random() * 256); context.lineTo(random() * 256, random() * 256); context.stroke(); }
  } else {
    for (let i = 0; i < 36; i++) {
      const y = i * 8 + random() * 5;
      context.strokeStyle = `rgba(${random() > .5 ? "36,27,19" : "220,190,140"},${.12 + random() * .2})`;
      context.lineWidth = .5 + random() * 2;
      context.beginPath(); context.moveTo(0, y); context.bezierCurveTo(72, y - 3, 168, y + 4, 256, y + random() * 2); context.stroke();
    }
    for (let i = 0; i < 100; i++) { context.fillStyle = `rgba(25,22,17,${.08 + random() * .12})`; context.fillRect(random() * 256, random() * 256, 2 + random() * 8, 1 + random() * 2); }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "mud" ? 3 : 1.5, kind === "mud" ? 3 : 1.5);
  texture.anisotropy = 4;
  return texture;
}

export function makeMaterials() {
  const mudTexture = makeSurfaceTexture("mud"), woodTexture = makeSurfaceTexture("wood");
  const standard = (color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  return {
    mud: standard("#52604b", 1, { map: mudTexture }), mudLight: standard("#66705a", 1, { map: mudTexture }), wood: standard("#76634b", 0.92, { map: woodTexture }), woodDark: standard("#4b4b3d", 0.95, { map: woodTexture }), woodEdge: standard("#917b59", 0.9, { map: woodTexture }), rust: standard("#74604c", 0.72, { metalness: 0.2, map: woodTexture }), cloth: standard("#62604d"), clothOchre: standard("#947548"), stone: standard("#656555"), moss: standard("#81905a"), leaf: standard("#526d45"), leafLight: standard("#83965c"), fungus: standard("#aab276", 0.55, { emissive: "#4b542b", emissiveIntensity: 0.5 }), water: new THREE.MeshPhysicalMaterial({ color: "#233c33", roughness: 0.3, metalness: 0.15, clearcoat: 0.65, transparent: true, opacity: 0.9 }), waterLight: new THREE.MeshPhysicalMaterial({ color: "#46594a", roughness: 0.32, metalness: 0.12, transparent: true, opacity: 0.8 }), glass: new THREE.MeshStandardMaterial({ color: "#d6a45d", emissive: "#d18136", emissiveIntensity: 1.8, roughness: 0.35 }), amber: new THREE.MeshStandardMaterial({ color: "#e5b66c", emissive: "#ce7734", emissiveIntensity: 1.2, roughness: 0.5 }), bone: standard("#b0a384"), ceramic: standard("#b0a68a", 0.45), food: standard("#806044"), red: new THREE.MeshStandardMaterial({ color: "#711b25", emissive: "#a31722", emissiveIntensity: 2.5, roughness: 0.25 }),
  };
}

export function addGround(group, mats, width = 46, depth = 48) {
  const geo = new THREE.PlaneGeometry(width, depth, 64, 64); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.55) * 0.12 + Math.cos(z * 0.42) * 0.11 + Math.sin((x + z) * 0.8) * 0.035); }
  geo.computeVertexNormals(); const ground = new THREE.Mesh(geo, mats.mud); ground.receiveShadow = true; group.add(ground); return ground;
}
