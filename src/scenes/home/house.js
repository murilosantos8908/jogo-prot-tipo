import * as THREE from "three";
import { makeMaterials } from "../../three/materials";
import { box, lamp, leaf, puddle, root } from "../../three/forms";

export function buildHouse(group, mats) {
  // One shared, cutaway floor plan used by scenes 2, 3 and 4.
  box(group, mats.woodDark, [0, -.13, 0], [12, .28, 9]);
  box(group, mats.wood, [0, 2.45, -4.45], [12, 4.9, .22]);
  box(group, mats.woodDark, [-5.9, 2.45, 0], [.22, 4.9, 9]); box(group, mats.wood, [5.9, 2.45, 0], [.22, 4.9, 9]);
  // low ceiling and exposed cross-beams
  box(group, mats.woodDark, [0, 4.9, 0], [12, .18, 9]);
  for (let x = -5; x <= 5; x += 2.5) box(group, mats.woodEdge, [x, 4.72, 0], [.15, .25, 9.1]);
  // patched paneling, repaired seams and doorway to sleeping alcove
  for (let i = 0; i < 9; i++) box(group, i % 3 ? mats.wood : mats.woodEdge, [-5.75 + i * 1.42, 2.5, -4.3], [1.32, 4.45, .1], [0, 0, (i % 2) * .012]);
  box(group, mats.wood, [1.7, 1.8, -4.29], [2.7, 3.5, .12]); box(group, mats.rust, [-3.7, 2.25, -4.28], [2.3, 2.8, .08]);
  // Entry at the left, open central kitchen, sleeping nook to the right.
  box(group, mats.woodDark, [-5.75, 1.55, 2.6], [.12, 3.1, 2.05]); box(group, mats.woodEdge, [-5.63, 1.55, 2.6], [.1, 3, 1.9]);
  // Leave a wide doorway between the kitchen and sleeping alcove.
  box(group, mats.woodDark, [3.85, 2.35, -2.95], [.14, 4.7, 2.9]); box(group, mats.woodDark, [3.85, 2.35, 3.45], [.14, 4.7, 1.9]);
  box(group, mats.wood, [3.75, 3.25, -2.95], [.16, 3, 2.8]); box(group, mats.wood, [3.75, 3.25, 3.45], [.16, 3, 1.8]);
  // narrow window and view glint
  box(group, mats.woodDark, [4.45, 3.15, -4.29], [1.7, 1.05, .14]); box(group, mats.waterLight, [4.45, 3.16, -4.19], [1.42, .8, .035]);
  for (let z of [-.3, 2.9]) box(group, mats.woodEdge, [-5.75, .7, z], [.13, 1.4, .55]);
  // kitchen counter, wash basin, cooking hearth and shelves
  box(group, mats.woodEdge, [-2.5, 1.05, -1.8], [3.3, .18, .9]); box(group, mats.woodDark, [-3.8, .52, -1.8], [.18, 1.05, .8]); box(group, mats.woodDark, [-1.2, .52, -1.8], [.18, 1.05, .8]);
  box(group, mats.rust, [-2.65, .92, -1.82], [1.05, .12, .68]);
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(.37, .3, .18, 12), mats.ceramic); basin.position.set(-2.55, 1.16, -1.8); group.add(basin);
  box(group, mats.rust, [-4.65, .78, -1.8], [.55, 1.4, .65]); const fire = new THREE.Mesh(new THREE.SphereGeometry(.28, 10, 8), mats.amber); fire.position.set(-4.65, 1.55, -1.8); group.add(fire);
  for (let y of [2.5, 3.5]) { box(group, mats.woodEdge, [-2.3, y, -4.05], [3.9, .12, .48]); for (let j = 0; j < 4; j++) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, .35 + (j % 2) * .12, 8), j % 2 ? mats.ceramic : mats.bone); jar.position.set(-3.7 + j * .9, y + .25, -4.03); group.add(jar); } }
  // table and fixed family seating
  box(group, mats.woodEdge, [.05, 1.25, .25], [3.25, .18, 2.0]); for (let x of [-1.25, 1.35]) for (let z of [-.45, .95]) box(group, mats.woodDark, [x, .62, z], [.14, 1.2, .14]);
  for (let z of [-1.1, 1.7]) { box(group, mats.wood, [.05, .62, z], [2.25, .22, .48]); for (let x of [-.85, .95]) box(group, mats.woodDark, [x, .32, z], [.12, .65, .12]); }
  // storage jars, rag hooks and lived-in repairs
  for (let i = 0; i < 4; i++) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.16, .21, .45 + i % 2 * .12, 8), i % 2 ? mats.bone : mats.ceramic); jar.position.set(-5.15 + i * .5, .48, 4.05); group.add(jar); }
  for (let i = 0; i < 3; i++) { box(group, mats.cloth, [-.9 + i * .9, 2.5, 4.32], [.5, .78, .035], [0, 0, .1 * (i - 1)]); }
  for (let i = 0; i < 4; i++) root(group, mats.wood, [[-5.7 + i * .22, 4.4, -3.5], [-4.7 + i * .5, 3.4, -3.8], [-4.9 + i * .35, 1.9, -4.2]], .035);
  // resting space in the side alcove
  box(group, mats.woodDark, [4.85, .42, .4], [1.6, .5, 2.7]); box(group, mats.cloth, [4.85, .72, .4], [1.7, .18, 2.75]);
  box(group, mats.clothOchre, [4.85, .85, .95], [1.65, .14, 1.15]); box(group, mats.woodEdge, [4.85, .75, 2.35], [1.7, .2, .2]);
  box(group, mats.wood, [4.85, .72, -1.75], [.85, .12, .7]);
  // rainy light through the narrow window, warm lamp above the table
  const cold = new THREE.PointLight(0x71918f, 6, 6); cold.position.set(4.45, 3.2, -3.4); group.add(cold);
  lamp(group, mats, .1, .1, 3.65, 0xffb55e, 16);
  const fill = new THREE.HemisphereLight(0x8eaaa0, 0x28251d, .85); group.add(fill);
  const cool = new THREE.DirectionalLight(0x8d9d94, .5); cool.position.set(-3, 5, 5); group.add(cool);
}

export function dressDinner(group, mats) {
  // Deliberately sparse meal: small portions, repeated plate geometry.
  for (let [x, z] of [[-.85, .15], [.85, .15], [-.85, .72], [.85, .72]]) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.37, .34, .055, 20), mats.ceramic); plate.position.set(x, 1.38, z); group.add(plate);
    const meal = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 7), mats.food); meal.scale.set(1.15, .3, .8); meal.position.set(x, 1.43, z); group.add(meal);
    box(group, mats.bone, [x + .48, 1.39, z], [.045, .025, .48], [0, .02, 0]); box(group, mats.rust, [x + .57, 1.39, z], [.045, .025, .3]);
  }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.3, .37, .4, 12), mats.rust); pot.position.set(.05, 1.55, .2); group.add(pot);
  const veg = new THREE.Mesh(new THREE.SphereGeometry(.16, 9, 7), mats.moss); veg.position.set(.05, 1.79, .2); group.add(veg);
}

export function dressCollapse(group, mats) {
  // Broken plate by the basin and a small spill mark.
  const pieces = [[-2.15, .04, -1.2, .45], [-2.7, .04, -1.1, -.7], [-3.05, .04, -1.45, .2]];
  for (const [x, y, z, r] of pieces) { const shard = new THREE.Mesh(new THREE.ConeGeometry(.29, .045, 3), mats.ceramic); shard.rotation.x = -Math.PI / 2; shard.rotation.z = r; shard.position.set(x, y, z); group.add(shard); }
  const spill = new THREE.Mesh(new THREE.CircleGeometry(.34, 18), mats.waterLight); spill.rotation.x = -Math.PI / 2; spill.position.set(-3.35, .025, -1.35); spill.scale.set(1.4, .7, 1); group.add(spill);
  for (let i = 0; i < 3; i++) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.12, .17, .28, 8), i % 2 ? mats.moss : mats.bone); jar.position.set(-1.35 + i * .38, 1.2, -1.85); group.add(jar); }
  box(group, mats.clothOchre, [-2.2, .14, -2.65], [.75, .04, .45], [0, -.3, 0]);
}

export function homeScene(kind) {
  const group = new THREE.Group(), mats = makeMaterials();
  buildHouse(group, mats);
  if (kind === "dinner") dressDinner(group, mats);
  if (kind === "collapse") dressCollapse(group, mats);
  return { group, camera: kind === "home" ? { position: [11, 7.2, 12], target: [0, 1.6, 0], minDistance: 7, maxDistance: 20 } : kind === "dinner" ? { position: [1.4, 3.3, 9.3], target: [0, 1.2, .2], minDistance: 5, maxDistance: 14 } : { position: [-5.8, 4.4, 7.8], target: [1.8, 1.3, -.3], minDistance: 5, maxDistance: 15 } };
}

