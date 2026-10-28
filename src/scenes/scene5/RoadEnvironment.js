import * as THREE from "three";
import { makeMaterials, addGround } from "../../three/materials";
import { box, lamp, leaf, puddle, reedClump, root, tree } from "../../three/forms";
import { addFog, bulboTree, fungusPatch, swampVegetation } from "../../three/world";

export function buildRoad(awakened = false) {
  const group = new THREE.Group(), mats = makeMaterials(); addGround(group, mats, 38, 52); addFog(group, awakened ? 0x3b2428 : 0x192b2b, awakened ? .025 : .032);
  // Shared winding raised road and its surrounding open encounter clearing.
  for (let i = 0; i < 11; i++) {
    const z = 22 - i * 4.5, x = Math.sin(z * .16) * .8;
    box(group, i % 4 === 0 ? mats.stone : mats.wood, [x, .04, z], [5.2, .18, 4.1], [0, Math.sin(z) * .06, .025]);
  }
  swampVegetation(group, mats, -1, -20, 20); swampVegetation(group, mats, 1, -20, 20);
  // roots, logs, stones and shallow pools stay at the clearing margins
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1, z = -10 + Math.floor(i / 2) * 5;
    root(group, mats.wood, [[side * 5.5, .05, z - 2], [side * 4.4, .25, z], [side * 3.25, .05, z + 2]], .2 + (i % 3) * .06);
    if (i % 2 === 0) { const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.6 + (i % 3) * .18, 1), mats.stone); rock.position.set(side * (4 + (i % 2)), .4, z + 1); rock.scale.set(1.4, .75, 1); rock.rotation.set(.1, i, .24); group.add(rock); }
    puddle(group, mats.water, side * (5 + i % 2), z, 1.4, .7);
  }
  for (let i = 0; i < 5; i++) {
    const postX = i % 2 ? -4.5 : 4.5, z = 16 - i * 8;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .12, 3.1, 6), mats.rust); pole.position.set(postX, 1.5, z); group.add(pole);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), mats.glass); bulb.position.set(postX, 3, z); group.add(bulb);
    const light = new THREE.PointLight(0xffbc74, 7, 7); light.position.set(postX, 2.95, z); group.add(light);
  }
  // abandoned marker / broken fence at approach
  box(group, mats.rust, [-3.8, 1.6, 12], [.1, 3.2, .1]); box(group, mats.woodEdge, [-3.2, 2.5, 12], [1.1, .7, .12], [0, -.15, .05]);
  box(group, mats.wood, [3.2, .65, 17], [2.4, .12, .12], [0, .15, .13]);
  // Dim high-district skyline on the far horizon; Bulbo silhouette to its left.
  for (let i = 0; i < 8; i++) {
    const x = 10 + (i % 4) * .8, z = -26 - Math.floor(i / 4) * 1.2, h = 4 + (i % 3) * 1.7;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, h, 1), mats.woodDark); tower.position.set(x, h / 2, z); group.add(tower);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(.08, .12, .035), mats.amber); glow.position.set(x - .18, h * .65, z + .52); group.add(glow);
  }
  bulboTree(group, mats, -13, -30);
  for (let i = 0; i < 8; i++) reedClump(group, mats, -8 + i * 2.4, -19 - (i % 3) * 2, .9);
  fungusPatch(group, mats, -7, -7, 36, 4); fungusPatch(group, mats, 7, -10, 30, 3.4);
  // The red source is an environmental preview point only; no fragment object is placed.
  const red = new THREE.PointLight(0xf02532, awakened ? 28 : 0, awakened ? 11 : 1); red.position.set(0, 1.45, -1); group.add(red);
  const redGlow = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), mats.red); redGlow.position.copy(red.position); redGlow.visible = awakened; group.add(redGlow);
  const ambient = new THREE.HemisphereLight(awakened ? 0x8e797c : 0x748b91, 0x151e1a, awakened ? .72 : 1.0); group.add(ambient);
  const moon = new THREE.DirectionalLight(awakened ? 0x8c7c83 : 0x9bb6bd, awakened ? 1.3 : 1.55); moon.position.set(-8, 12, 6); group.add(moon);
  // Ambient motes, held to a modest count for browser performance.
  if (awakened) { const positions = new Float32Array(180 * 3); for (let i = 0; i < 180; i++) { const a = i * 2.399; const radius = .3 + (i % 29) / 29 * 7; positions[i * 3] = Math.cos(a) * radius; positions[i * 3 + 1] = ((i * 37) % 100) / 25; positions[i * 3 + 2] = -1 + Math.sin(a) * radius; } const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(positions, 3)); const motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xe6b0a5, size: .035, transparent: true, opacity: .68 })); group.add(motes); }
  return { group, camera: { position: [10, 8, 18], target: [0, 1, -2], minDistance: 8, maxDistance: 32 } };
}
