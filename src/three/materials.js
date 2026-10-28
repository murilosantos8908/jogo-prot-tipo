import * as THREE from "three";

export function makeMaterials() {
  const standard = (color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  return {
    mud: standard("#252b25"), mudLight: standard("#34362d"), wood: standard("#49473b"), woodDark: standard("#292f2a"), woodEdge: standard("#625744"), rust: standard("#51483d", 0.72, { metalness: 0.52 }), cloth: standard("#414a40"), clothOchre: standard("#675640"), stone: standard("#454940"), moss: standard("#58654a"), leaf: standard("#36493a"), leafLight: standard("#56684a"), fungus: standard("#76805b", 0.55, { emissive: "#313a20", emissiveIntensity: 0.4 }), water: new THREE.MeshPhysicalMaterial({ color: "#102421", roughness: 0.22, metalness: 0.25, clearcoat: 0.7, transparent: true, opacity: 0.88 }), waterLight: new THREE.MeshPhysicalMaterial({ color: "#253a32", roughness: 0.28, metalness: 0.2, transparent: true, opacity: 0.78 }), glass: new THREE.MeshStandardMaterial({ color: "#b98b50", emissive: "#a65d22", emissiveIntensity: 1.5, roughness: 0.35 }), amber: new THREE.MeshStandardMaterial({ color: "#d09b56", emissive: "#bb6728", emissiveIntensity: 1.1, roughness: 0.5 }), bone: standard("#887e65"), ceramic: standard("#827c68", 0.45), food: standard("#56412f"), red: new THREE.MeshStandardMaterial({ color: "#711b25", emissive: "#a31722", emissiveIntensity: 2.5, roughness: 0.25 }),
  };
}

export function addGround(group, mats, width = 46, depth = 48) {
  const geo = new THREE.PlaneGeometry(width, depth, 36, 36); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.sin(x * 0.55) * 0.12 + Math.cos(z * 0.42) * 0.11 + Math.sin((x + z) * 0.8) * 0.035); }
  geo.computeVertexNormals(); const ground = new THREE.Mesh(geo, mats.mud); ground.receiveShadow = true; group.add(ground); return ground;
}
