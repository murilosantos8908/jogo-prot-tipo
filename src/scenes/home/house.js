import * as THREE from "three";
import { makeMaterials } from "../../three/materials";
import { box, lamp, leaf, puddle, reedClump, root } from "../../three/forms";

function latheMesh(profile, material, segments = 24) {
  const points = profile.map(([radius, height]) => new THREE.Vector2(radius, height));
  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function vesselProfile(radius, height, neck = .58) {
  return [
    [0, 0],
    [radius * .55, 0],
    [radius * .78, height * .08],
    [radius, height * .35],
    [radius * .94, height * .57],
    [radius * neck, height * .82],
    [radius * neck * .94, height * .94],
    [radius * .76, height],
    [radius * .71, height * .94],
    [radius * neck * .78, height * .78],
    [radius * .85, height * .53],
    [radius * .83, height * .38],
    [radius * .61, height * .14],
    [0, height * .12]
  ];
}

function addGlazedJar(group, material, x, baseY, z, radius = .18, height = .46, neck = .58) {
  const jar = latheMesh(vesselProfile(radius, height, neck), material, 28);
  jar.position.set(x, baseY, z);
  group.add(jar);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * neck * .98, .025, 8, 20), material);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(x, baseY + height - .012, z);
  group.add(rim);
  return jar;
}

export function buildHouse(group, mats) {
  // One shared, cutaway floor plan used by scenes 2, 3 and 4.
  box(group, mats.woodDark, [0, -.13, 0], [12, .28, 9], [0, 0, 0], .045);
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
  box(group, mats.woodEdge, [-2.5, 1.05, -1.8], [3.3, .18, .9], [0, 0, 0], .035); box(group, mats.woodDark, [-3.8, .52, -1.8], [.18, 1.05, .8]); box(group, mats.woodDark, [-1.2, .52, -1.8], [.18, 1.05, .8]);
  box(group, mats.rust, [-2.65, .92, -1.82], [1.05, .12, .68]);
  const basin = latheMesh([[0, 0], [.22, 0], [.35, .03], [.39, .13], [.36, .19], [.33, .16], [.31, .06], [0, .05]], mats.ceramic, 28);
  basin.position.set(-2.55, 1.14, -1.8); group.add(basin);
  const basinWater = new THREE.Mesh(new THREE.CircleGeometry(.3, 28), mats.waterLight);
  basinWater.rotation.x = -Math.PI / 2; basinWater.position.set(-2.55, 1.3, -1.8); group.add(basinWater);
  box(group, mats.rust, [-4.65, .78, -1.8], [.55, 1.4, .65]);
  const emberBed = new THREE.Mesh(new THREE.DodecahedronGeometry(.2, 1), mats.amber);
  emberBed.position.set(-4.65, 1.55, -1.8); emberBed.scale.set(1.2, .65, .9); group.add(emberBed);
  for (let y of [2.5, 3.5]) {
    box(group, mats.woodEdge, [-2.3, y, -4.05], [3.9, .12, .48]);
    for (let j = 0; j < 4; j++) {
      const jarHeight = .35 + (j % 2) * .12;
      addGlazedJar(group, j % 2 ? mats.ceramic : mats.bone, -3.7 + j * .9, y + .06, -4.03, .15, jarHeight, .6);
    }
  }
  // table and fixed family seating
  box(group, mats.woodEdge, [.05, 1.25, .25], [3.25, .18, 2.0], [0, 0, 0], .045); for (let x of [-1.25, 1.35]) for (let z of [-.45, .95]) box(group, mats.woodDark, [x, .62, z], [.14, 1.2, .14]);
  for (let z of [-1.1, 1.7]) { box(group, mats.wood, [.05, .62, z], [2.25, .22, .48]); for (let x of [-.85, .95]) box(group, mats.woodDark, [x, .32, z], [.12, .65, .12]); }
  // storage jars, rag hooks and lived-in repairs
  for (let i = 0; i < 4; i++) {
    const height = .45 + i % 2 * .12;
    addGlazedJar(group, i % 2 ? mats.bone : mats.ceramic, -5.15 + i * .5, .01, 4.05, .21, height, .55);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.13, .16, .055, 20), mats.woodEdge);
    lid.position.set(-5.15 + i * .5, .01 + height + .026, 4.05); group.add(lid);
  }
  for (let i = 0; i < 3; i++) { box(group, mats.cloth, [-.9 + i * .9, 2.5, 4.32], [.5, .78, .035], [0, 0, .1 * (i - 1)]); }
  for (let i = 0; i < 4; i++) root(group, mats.wood, [[-5.7 + i * .22, 4.4, -3.5], [-4.7 + i * .5, 3.4, -3.8], [-4.9 + i * .35, 1.9, -4.2]], .035);
  // Damp growth has crept in along the walls, leaving the kitchen and table clear.
  for (let i = 0; i < 6; i++) {
    const x = -5.1 + i * 2.02;
    root(group, mats.woodDark, [[x, .08, -4.14], [x + .18, .72, -4.18], [x - .16, 1.52 + (i % 2) * .28, -4.2]], .055);
    if (i % 2 === 0) leaf(group, mats.leaf, x + .22, 1.15, -4.12, .38, i * .8);
  }
  for (const [x, z] of [[-5.15,-3.55],[5.05,-3.25],[-5.1,3.7],[5.1,3.65]]) {
    const undergrowth = new THREE.Group(); reedClump(undergrowth, mats, 0, 0, .62); undergrowth.position.set(x, .01, z); group.add(undergrowth);
  }
  for (let i = 0; i < 5; i++) root(group, mats.wood, [[-5.7, .05, -3.7 + i * 1.5], [-5.42, .22, -3.1 + i * 1.35], [-5.75, .48 + i % 2 * .2, -2.5 + i * 1.1]], .045);
  // resting space in the side alcove
  box(group, mats.woodDark, [4.85, .42, .4], [1.6, .5, 2.7], [0, 0, 0], .04); box(group, mats.cloth, [4.85, .72, .4], [1.7, .18, 2.75], [0, 0, 0], .035);
  box(group, mats.clothOchre, [4.85, .85, .95], [1.65, .14, 1.15]);
  const quilt = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), mats.cloth);
  quilt.scale.set(.82, .11, .53); quilt.position.set(4.85, .88, .58); quilt.rotation.y = -.08; group.add(quilt);
  box(group, mats.woodEdge, [4.85, .75, 2.35], [1.7, .2, .2]);
  box(group, mats.wood, [4.85, .72, -1.75], [.85, .12, .7]);
  // rainy light through the narrow window, warm lamp above the table
  // The house remains set for four even when the player first enters it.
  // Small cold portions and the warm pot are narrative dressing, not structural changes.
  const moss = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.05, .035), mats.moss); moss.position.set(-5.78, 1.2, 2.6); group.add(moss);
  for (let i = 0; i < 5; i++) { const mark = new THREE.Mesh(new THREE.BoxGeometry(.14 + (i % 2) * .08, .025, .025), mats.bone); mark.position.set(-5.65, .55 + i * .42, 2.58); group.add(mark); }
  const cold = new THREE.PointLight(0x71918f, 6, 6); cold.position.set(4.45, 3.2, -3.4); group.add(cold);
  lamp(group, mats, .1, .1, 3.65, 0xffaa39, 13);
  const fill = new THREE.HemisphereLight(0xaac7ae, 0x37372a, 1.25); group.add(fill);
  const cool = new THREE.DirectionalLight(0xa8baa4, .9); cool.position.set(-3, 5, 5); cool.castShadow = true; group.add(cool);
}

export function dressDinner(group, mats) {
  // Hand-shaped plates, tableware and a lidded cooking pot add believable scale.
  for (let [x, z] of [[-.85, .15], [.85, .15], [-.85, .72], [.85, .72]]) {
    const plate = latheMesh([[0, 0], [.23, 0], [.34, .015], [.38, .055], [.36, .08], [.31, .065], [.28, .035], [.12, .028], [0, .03]], mats.ceramic, 32);
    plate.position.set(x, 1.34, z); group.add(plate);
    const meal = new THREE.Mesh(new THREE.SphereGeometry(.17, 18, 12), mats.food);
    meal.scale.set(1.15, .31, .84); meal.position.set(x, 1.45, z); meal.castShadow = true; group.add(meal);
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .43, 8), mats.bone);
    fork.position.set(x + .48, 1.38, z); fork.rotation.x = Math.PI / 2; group.add(fork);
    const forkGrip = new THREE.Mesh(new THREE.CylinderGeometry(.027, .031, .19, 10), mats.rust);
    forkGrip.position.set(x + .48, 1.38, z + .14); forkGrip.rotation.x = Math.PI / 2; group.add(forkGrip);
    const knife = new THREE.Mesh(new THREE.BoxGeometry(.045, .012, .38), mats.bone);
    knife.position.set(x + .62, 1.39, z); knife.rotation.x = .02; group.add(knife);
  }
  const pot = latheMesh(vesselProfile(.38, .48, .7), mats.rust, 32);
  pot.position.set(.05, 1.34, .2); group.add(pot);
  const potRing = new THREE.Mesh(new THREE.TorusGeometry(.27, .045, 10, 24), mats.woodDark);
  potRing.rotation.x = Math.PI / 2; potRing.position.set(.05, 1.78, .2); group.add(potRing);
  for (let side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 8, 16), mats.rust);
    handle.position.set(.05 + side * .36, 1.64, .2); handle.rotation.y = Math.PI / 2; group.add(handle);
  }
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(.28, .3, .055, 28), mats.woodEdge);
  lid.position.set(.05, 1.81, .2); group.add(lid);
  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 9), mats.rust);
  lidKnob.position.set(.05, 1.87, .2); group.add(lidKnob);
  const herb = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 9), mats.moss);
  herb.scale.set(.8, .42, .7); herb.position.set(.05, 1.88, .2); group.add(herb);
}

export function dressCollapse(group, mats) {
  // Broken plate by the basin and a small spill mark.
  const pieces = [[-2.15, -1.2, .45], [-2.7, -1.1, -.7], [-3.05, -1.45, .2]];
  for (const [x, z, r] of pieces) {
    const shape = new THREE.Shape(); shape.moveTo(-.24, -.12); shape.lineTo(.27, -.08); shape.lineTo(-.03, .2); shape.closePath();
    const shard = new THREE.Mesh(new THREE.ShapeGeometry(shape), mats.ceramic); shard.rotation.set(-Math.PI / 2, 0, r); shard.position.set(x, .014, z); shard.castShadow = true; group.add(shard);
  }
  const spill = new THREE.Mesh(new THREE.CircleGeometry(.34, 18), mats.waterLight); spill.rotation.x = -Math.PI / 2; spill.position.set(-3.35, .012, -1.35); spill.scale.set(1.4, .7, 1); group.add(spill);
  for (let i = 0; i < 3; i++) { const jar = new THREE.Mesh(new THREE.CylinderGeometry(.12, .17, .28, 8), i % 2 ? mats.moss : mats.bone); jar.position.set(-1.35 + i * .38, .15, -1.85); group.add(jar); }
  box(group, mats.clothOchre, [-2.2, .035, -2.65], [.75, .04, .45], [0, -.3, 0]);
}

export function homeScene(kind) {
  const group = new THREE.Group(), mats = makeMaterials();
  buildHouse(group, mats);
  if (kind === "home" || kind === "dinner") dressDinner(group, mats);
  if (kind === "collapse") dressCollapse(group, mats);
  return { group, spawn: [-4.45, 0, 2.55], camera: kind === "home" ? { position: [-1, 4.8, 7.5], target: [-.7, 1.5, -.6], minDistance: 7, maxDistance: 20 } : kind === "dinner" ? { position: [1.4, 3.3, 9.3], target: [0, 1.2, .2], minDistance: 5, maxDistance: 14 } : { position: [-5.8, 4.4, 7.8], target: [1.8, 1.3, -.3], minDistance: 5, maxDistance: 15 } };
}

