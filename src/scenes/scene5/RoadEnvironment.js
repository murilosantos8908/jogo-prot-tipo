import * as THREE from "three";
import { makeMaterials, addGround } from "../../three/materials";
import { box, lamp, leaf, puddle, reedClump, root, tree } from "../../three/forms";
import { addFog, bulboTree, fungusPatch, swampVegetation } from "../../three/world";
import { addCanopyBridge, addClothLine, addCrateStack, addForestBoundary, addForestFloorPatch, addGroundDebris, addLampCluster, addMushroomCluster, addRaindropRipples, addRootsAcrossPath, addSwampGrassIsland, addTrashCan } from "../../three/forestKit";
import { addMossyAlleyWalls } from "../../three/alleyWalls";

export function buildRoad(awakened = false) {
  const group = new THREE.Group(), mats = makeMaterials();
  const floor = addGround(group, mats, 48, 58), floorY = floor.geometry.attributes.position;
  for (let i = 0; i < floorY.count; i++) floorY.setY(i, 0); floorY.needsUpdate = true; floor.geometry.computeVertexNormals();
  addFog(group, awakened ? 0x49383a : 0x34483b, awakened ? .021 : .019);
  addForestBoundary(group, mats, { width: 40, depth: 56, sideSpacing: 3, endSpacing: 2.8, inset: 1.5, seed: 955, vines: true });
  // Scenes 7 and 8 share this build: enclosing masonry closes the road on both versions.
  addMossyAlleyWalls(group, mats, { width: 46, depth: 58, height: 9.5, thickness: 1.25, sectionLength: 4.2, seed: 955, ends: true, vines: true });
  // Shared winding raised road and its surrounding open encounter clearing.
  for (let i = 0; i < 11; i++) {
    const z = 22 - i * 4.5, x = Math.sin(z * .16) * .8;
    box(group, i % 4 === 0 ? mats.stone : mats.wood, [x, .04, z], [5.2, .18, 4.1], [0, Math.sin(z) * .06, .025]);
  }
  swampVegetation(group, mats, -1, -20, 20); swampVegetation(group, mats, 1, -20, 20);
  // Extra wet growth thickens the roadside without narrowing the walking line.
  for (let side of [-1, 1]) for (let i = 0; i < 18; i++) {
    const x = side * (10.2 + (i % 4) * 1.65), z = -23 + i * 2.65;
    reedClump(group, mats, x, z, .75 + (i % 3) * .22);
    if (i % 3 === 0) {
      root(group, mats.wood, [[side * 10.5, .04, z - 1.3], [side * 9.1, .2, z], [side * 7.6, .03, z + 1.1]], .16);
      leaf(group, mats.leafLight, side * (8.2 + (i % 2)), .12, z + .5, .62, i * .7);
    }
  }
  // Forest limbs bridge the road, enclosing the settlement beneath the canopy.
  for (let side of [-1, 1]) for (let i = 0; i < 7; i++) {
    const z = 19 - i * 6.5;
    root(group, mats.woodDark, [[side * 17, 5.6, z], [side * 9, 6.4, z - .8], [side * 1.8, 5.9, z - 1.7]], .19);
    for (let j = 0; j < 4; j++) leaf(group, j % 2 ? mats.leaf : mats.leafLight, side * (.6 + j * .95), 5.4 + (j % 2) * .3, z - 1.4, .62, j * 1.4);
  }
  // Weathered timber homes on stilts; every post reaches the uneven earth plane.
  const groundY = () => 0;
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = side * (12.2 + (i % 3) * .45), z = 22 - Math.floor(i / 2) * 9.5;
    const gy = groundY(x, z), w = 4.9 + (i % 3) * .28, d = 3.8 + (i % 2) * .25, floor = gy + .82;
    // Short foundation piles, raised floor, and patched plank walls.
    for (let dx of [-w * .38, w * .38]) for (let dz of [-d * .36, d * .36]) box(group, mats.woodDark, [x + dx, gy + .4, z + dz], [.2, .8, .2]);
    for (let dx of [-w * .38, w * .38]) box(group, mats.woodEdge, [x + dx, gy + .31, z], [.14, .12, d]);
    box(group, mats.woodEdge, [x, floor, z], [w, .18, d], [0, 0, 0], .035);
    box(group, mats.wood, [x, floor + 1.15, z - d * .46], [w, 2.3, .16]);
    box(group, mats.woodDark, [x - w * .48, floor + 1.15, z], [.16, 2.3, d]);
    box(group, mats.wood, [x + w * .48, floor + 1.15, z], [.16, 2.3, d]);
    for (let row = 0; row < 5; row++) for (let plank = 0; plank < 5; plank++) {
      const plankX = x - 1.9 + plank * .95, plankY = floor + .3 + row * .43;
      box(group, (row + plank + i) % 4 === 0 ? mats.woodEdge : mats.wood, [plankX, plankY, z + d * .46 + .09], [.9, .39, .035], [0, 0, ((row + plank) % 2) * .012]);
    }
    // Front face leaves a narrow door opening in the middle.
    box(group, mats.woodEdge, [x - 1.65, floor + 1.15, z + d * .46], [1.6, 2.3, .16]);
    box(group, mats.wood, [x + 1.65, floor + 1.15, z + d * .46], [1.6, 2.3, .16]);
    box(group, mats.woodDark, [x, floor + 2.15, z + d * .46], [1.8, .3, .16]);
    // Uneven overlapping roof sheets with a slight slope.
    box(group, i % 2 ? mats.woodDark : mats.rust, [x - .08, floor + 2.35, z], [w + .75, .18, d + 1.05], [0, side * .04, side * .09]);
    for (let plank = 0; plank < 5; plank++) box(group, mats.woodEdge, [x - 1.8 + plank * .9, floor + 2.45, z], [.055, .05, d + .95], [0, side * .04, side * .09]);
    // Warm doorway light and a small awning over the porch.
    box(group, mats.wood, [x, floor + .78, z + d * .49], [1.05, 1.52, .08]);
    const windowX = x - side * 1.55;
    box(group, mats.woodDark, [windowX - .45, floor + 1.53, z + d * .505], [.08, .82, .1]);
    box(group, mats.woodDark, [windowX + .45, floor + 1.53, z + d * .505], [.08, .82, .1]);
    box(group, mats.glass, [windowX, floor + 1.53, z + d * .51], [.78, .64, .035]);
    box(group, mats.woodEdge, [windowX, floor + 1.53, z + d * .54], [.07, .72, .06]);
    box(group, mats.woodEdge, [windowX, floor + 1.53, z + d * .54], [.9, .07, .06]);
    box(group, mats.clothOchre, [x, floor + 2.22, z + d * .8], [2.4, .12, 1.15], [side * .04, 0, .04]);
    const glow = new THREE.PointLight(0xffa936, 3.4, 6); glow.position.set(x, floor + 1.8, z + d * .58); group.add(glow);
    for (let vine = 0; vine < 2; vine++) {
      const vx = x + (vine ? 1 : -1) * w * .44;
      root(group, mats.woodDark, [[vx, floor + 2.4, z - 1.3], [vx + .08, floor + 1.6, z - .7], [vx - .06, floor + .18, z - .4]], .035);
      leaf(group, mats.leaf, vx, floor + .6, z - .45, .3, vine * 1.4);
    }
  }
  for (let row = 0; row < 6; row++) {
    const z = 22 - row * 9.5;
    addClothLine(group, mats, [-12.5, 4.7, z + .7], [12.5, 4.3, z - .6], 5, row + 204);
    addCanopyBridge(group, mats, -16.5, 16.5, z - 2, 7 + (row % 2) * .4, row + 621);
    for (let side of [-1, 1]) {
      addCrateStack(group, mats, side * 9.4, z + 2.8, 2 + (row % 3), 0, row + side * 42);
      addGroundDebris(group, mats, side * 7.3, z - 2.2, 9, 1.2, row + side * 81, 0);
      if (row % 2 === 0) addTrashCan(group, mats, side * 9.1, z - 2.8, 0, row % 4 === 0);
      addForestFloorPatch(group, mats, side * 15.5, z, 2.2, row * 11 + side * 3);
      addRaindropRipples(group, mats, side * 5.2, z - 1.2, 6, row * 9 + side * 13);
    }
    addRootsAcrossPath(group, mats, -5.5, 5.5, z + 3.4, .05, row + 77);
  }
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    const z = -21 + i * 5.2;
    addSwampGrassIsland(group, mats, side * (6.1 + (i % 3) * .35), z, 2.1, 1.15, i + 15);
    if (i % 3 === 0) addMushroomCluster(group, mats, side * 8.1, z + 1.5, 9, .65, i + 91);
    if (i % 2 === 0) addLampCluster(group, mats, side * 6.5, z, 0, 2.6 + (i % 3) * .25, 0xffc078);
  }
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
  for (let x of [2.15, 4.25]) box(group, mats.woodDark, [x, .42, 17], [.12, .84, .12]);
  box(group, mats.wood, [3.2, .82, 17], [2.4, .12, .12], [0, .15, .13]);
  // Dim high-district skyline on the far horizon; Bulbo silhouette to its left.
  for (let i = 0; i < 8; i++) {
    const x = 10 + (i % 4) * .8, z = -26 - Math.floor(i / 4) * 1.2, h = 4 + (i % 3) * 1.7;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, h, 1), mats.woodDark); tower.position.set(x, h / 2, z); group.add(tower);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(.08, .12, .035), mats.amber); glow.position.set(x - .18, h * .65, z + .52); group.add(glow);
  }
  bulboTree(group, mats, -13, -24);
  for (let i = 0; i < 8; i++) reedClump(group, mats, -8 + i * 2.4, -19 - (i % 3) * 2, .9);
  fungusPatch(group, mats, -7, -7, 36, 4); fungusPatch(group, mats, 7, -10, 30, 3.4);
  // The red source is an environmental preview point only; no fragment object is placed.
  const red = new THREE.PointLight(0xf02532, awakened ? 28 : 0, awakened ? 11 : 1); red.position.set(0, 1.45, -1); group.add(red);
  const redGlow = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), mats.red); redGlow.position.copy(red.position); redGlow.visible = awakened; group.add(redGlow);
  const ambient = new THREE.HemisphereLight(awakened ? 0xb8989b : 0xb1bd8b, 0x292b20, awakened ? 1.05 : 1.3); group.add(ambient);
  const moon = new THREE.DirectionalLight(awakened ? 0xa9929b : 0xb9d2c4, awakened ? 1.5 : 1.8); moon.position.set(-8, 12, 6); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); group.add(moon);
  // Ambient motes, held to a modest count for browser performance.
  if (awakened) { const positions = new Float32Array(180 * 3); for (let i = 0; i < 180; i++) { const a = i * 2.399; const radius = .3 + (i % 29) / 29 * 7; positions[i * 3] = Math.cos(a) * radius; positions[i * 3 + 1] = ((i * 37) % 100) / 25; positions[i * 3 + 2] = -1 + Math.sin(a) * radius; } const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(positions, 3)); const motes = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xe6b0a5, size: .035, transparent: true, opacity: .68 })); group.add(motes); }
  return { group, camera: { position: [10, 8, 18], target: [0, 1, -2], minDistance: 8, maxDistance: 32 } };
}
