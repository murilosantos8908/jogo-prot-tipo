import * as THREE from "three";
import { addGround } from "./materials";
import { box, leaf, puddle, reedClump, root, tree } from "./forms";

export function worldBackdrop(group, mats, seed = 0) {
  addGround(group, mats, 48, 52);
  for (let i = 0; i < 9; i++) { const x = -20 + i * 5 + (seed % 2); const z = -20 - (i % 3) * 1.2; tree(group, mats, x, z, 1.25 + (i % 3) * .15, true); }
  for (let i = 0; i < 10; i++) { const x = -20 + (i * 13 % 40), z = -18 + (i * 7 % 35); puddle(group, mats.water, x, z, 1.2 + i % 3 * .25, .5 + i % 2 * .3); }
  for (let i = 0; i < 16; i++) reedClump(group, mats, -19 + (i * 11 % 39), -17 + (i * 17 % 37), .6 + (i % 3) * .25);
  // Shared distant silhouette of the Bulbo da Vida.
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.3, 15, 12, 6), mats.woodDark); trunk.position.set(12, 7, -31); trunk.scale.set(1.9, 1, 1.4); group.add(trunk);
  for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; root(group, mats.wood, [[12, .4, -31], [12 + Math.cos(a) * 3, 1.2, -31 + Math.sin(a) * 2], [12 + Math.cos(a) * 8, .15, -31 + Math.sin(a) * 7]], .62); }
  for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9; const b = new THREE.Mesh(new THREE.SphereGeometry(3.2 + (i % 3) * .45, 10, 7), i % 2 ? mats.leaf : mats.leafLight); b.position.set(12 + Math.cos(a) * 3.1, 15 + (i % 3) * 1.5, -31 + Math.sin(a) * 2.5); b.scale.set(1.25, .6, 1); group.add(b); }
}

export function addFog(group, color = 0x344841, density = 0.025) { group.fog = new THREE.FogExp2(color, density); }

export function swampBanks(group, mats, x, z, span = 3) {
  box(group, mats.mudLight, [x, -.18, z], [span, .32, span * .7], [0, .14, 0]);
  for (let i = 0; i < 2; i++) root(group, mats.wood, [[x - span * .5, -.02, z - .3 + i * .45], [x, .13, z], [x + span * .6, -.08, z + .4]], .14);
}

export function fungusPatch(group, mats, x, z, count = 18, spread = 8) {
  const cap = new THREE.ConeGeometry(.12, .16, 7); cap.translate(0, .13, 0);
  const stem = new THREE.CylinderGeometry(.035, .055, .12, 6); stem.translate(0, .06, 0);
  const caps = new THREE.InstancedMesh(cap, mats.fungus, count); const stems = new THREE.InstancedMesh(stem, mats.bone, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) { const a = i * 2.399, r = .45 + ((i * 17) % 100) / 100 * spread; const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; const s = .65 + ((i * 31) % 60) / 100; dummy.position.set(px, .02, pz); dummy.scale.setScalar(s); dummy.rotation.y = a; dummy.updateMatrix(); caps.setMatrixAt(i, dummy.matrix); stems.setMatrixAt(i, dummy.matrix); }
  caps.castShadow = false; stems.castShadow = false; group.add(stems, caps);
}

export function bulboTree(group, mats, x, z) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 2.35, 15, 12, 5), mats.woodDark); trunk.position.set(x, 7.5, z); trunk.scale.set(1.55, 1, 1.35); trunk.castShadow = true; group.add(trunk);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    root(group, mats.wood, [[x, .25, z], [x + Math.cos(a) * 2.8, 1.1, z + Math.sin(a) * 2.2], [x + Math.cos(a) * 7.3, .08, z + Math.sin(a) * 5.7]], .48);
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(.17, .52, 7.5, 7), mats.woodDark); limb.position.set(x + Math.cos(a) * 3.3, 13.6, z + Math.sin(a) * 2.7); limb.rotation.z = -Math.cos(a) * .65; limb.rotation.x = Math.sin(a) * .65; group.add(limb);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(3.3, 10, 8), i % 2 ? mats.leaf : mats.leafLight); crown.position.set(x + Math.cos(a) * 4.4, 16 + (i % 3) * 1.1, z + Math.sin(a) * 3.3); crown.scale.set(1.45, .62, 1.12); group.add(crown);
  }
}

export function swampVegetation(group, mats, side = 1, start = -12, end = 18) {
  for (let z = start; z <= end; z += 5) { const x = side * (7.5 + (Math.sin(z * 1.7) + 1) * 2); tree(group, mats, x, z, 1 + ((z + 20) % 3) * .15, true); }
  for (let i = 0; i < 14; i++) { const x = side * (5.5 + (i % 4) * .65), z = start + i * ((end - start) / 14); reedClump(group, mats, x, z, .8 + (i % 3) * .2); if (i % 3 === 0) leaf(group, mats.leafLight, x - .4, .2, z + .5, .7, i); }
}
