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

function makeToxicWaterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d");
  const base = context.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0, "#172b26"); base.addColorStop(.42, "#354b34"); base.addColorStop(.72, "#29372b"); base.addColorStop(1, "#514631");
  context.fillStyle = base; context.fillRect(0, 0, 512, 512);
  let seed = 41293;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // Slow oily eddies with layered translucent rings.
  for (let i = 0; i < 34; i++) {
    const x = random() * 512, y = random() * 512, radius = 14 + random() * 76;
    const oil = context.createRadialGradient(x, y, radius * .08, x, y, radius);
    oil.addColorStop(0, "rgba(151,157,76,.06)"); oil.addColorStop(.55, "rgba(112,137,66,.16)"); oil.addColorStop(1, "rgba(12,28,24,0)");
    context.fillStyle = oil; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
    context.strokeStyle = i % 3 ? "rgba(179,169,96,.18)" : "rgba(111,157,117,.2)";
    context.lineWidth = 1 + random() * 4; context.beginPath();
    context.ellipse(x, y, radius * (.64 + random() * .3), radius * (.28 + random() * .2), random() * Math.PI, .1, Math.PI * (1.1 + random() * .75)); context.stroke();
  }
  // Silt trails, algae flecks and pale chemical scum add a contaminated surface grain.
  for (let i = 0; i < 1900; i++) {
    const x = random() * 512, y = random() * 512, size = .6 + random() * 4.4;
    const palette = i % 5 === 0 ? "177,171,103" : i % 3 === 0 ? "99,139,88" : "9,24,23";
    context.fillStyle = `rgba(${palette},${.08 + random() * .24})`;
    context.beginPath(); context.ellipse(x, y, size * (1 + random() * 2.8), size * .42, random() * 3, 0, Math.PI * 2); context.fill();
  }
  for (let i = 0; i < 70; i++) {
    const x = random() * 512, y = random() * 512;
    context.strokeStyle = `rgba(173,178,127,${.06 + random() * .14})`; context.lineWidth = 1 + random() * 2;
    context.beginPath(); context.moveTo(x, y); context.bezierCurveTo(x + 22, y - 10, x - 12, y + 25, x + 35, y + 18); context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5); texture.anisotropy = 8;
  return texture;
}

export function makeMaterials(options = {}) {
  const mudTexture = makeSurfaceTexture("mud"), woodTexture = makeSurfaceTexture("wood");
  const toxicWaterTexture = options.toxicWater ? makeToxicWaterTexture() : null;
  const toxicWaterMaterial = toxicWaterTexture ? new THREE.MeshPhysicalMaterial({ color: "#c0d084", map: toxicWaterTexture, bumpMap: toxicWaterTexture, bumpScale: .055, roughness: .27, metalness: .32, clearcoat: .88, clearcoatRoughness: .16, emissive: "#253c1c", emissiveIntensity: .22 }) : null;
  const standard = (color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  return {
    mud: standard("#52604b", 1, { map: mudTexture }), mudLight: standard("#66705a", 1, { map: mudTexture }), wood: standard("#76634b", 0.92, { map: woodTexture }), woodDark: standard("#4b4b3d", 0.95, { map: woodTexture }), woodEdge: standard("#917b59", 0.9, { map: woodTexture }), rust: standard("#74604c", 0.72, { metalness: 0.2, map: woodTexture }), cloth: standard("#62604d"), clothOchre: standard("#947548"), stone: standard("#656555"),
    alleyStone: standard("#665e4c", .96, { map: mudTexture }), alleyStoneLight: standard("#82745c", .92, { map: woodTexture }), alleyStoneDark: standard("#403d32", 1, { map: mudTexture }), moss: standard("#81905a", .98), mossDeep: standard("#3f6442", 1), trashCloth: standard("#574c3b", .98), stallCloth: standard("#a87843", .9), stallRed: standard("#8a3f35", .88), stallTeal: standard("#526b5c", .9), skinWarm: standard("#a97858", .86), skinDeep: standard("#67483c", .88),
    leaf: standard("#526d45"), leafLight: standard("#83965c"), fungus: standard("#aab276", 0.55, { emissive: "#4b542b", emissiveIntensity: 0.5 }), water: new THREE.MeshPhysicalMaterial({ color: "#233c33", roughness: 0.3, metalness: 0.15, clearcoat: 0.65, transparent: true, opacity: 0.9 }), toxicWater: toxicWaterMaterial, waterLight: new THREE.MeshPhysicalMaterial({ color: "#46594a", roughness: 0.32, metalness: 0.12, transparent: true, opacity: 0.8 }), glass: new THREE.MeshStandardMaterial({ color: "#d6a45d", emissive: "#d18136", emissiveIntensity: 1.8, roughness: 0.35 }), amber: new THREE.MeshStandardMaterial({ color: "#e5b66c", emissive: "#ce7734", emissiveIntensity: 1.2, roughness: 0.5 }), bone: standard("#b0a384"), ceramic: standard("#b0a68a", 0.45), food: standard("#806044"), red: new THREE.MeshStandardMaterial({ color: "#711b25", emissive: "#a31722", emissiveIntensity: 2.5, roughness: 0.25 }),
  };
}

export function addGround(group, mats, width = 46, depth = 48) {
  const geo = new THREE.PlaneGeometry(width, depth, 64, 64); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.55) * 0.12 + Math.cos(z * 0.42) * 0.11 + Math.sin((x + z) * 0.8) * 0.035); }
  geo.computeVertexNormals(); const ground = new THREE.Mesh(geo, mats.mud); ground.receiveShadow = true; group.add(ground); return ground;
}
