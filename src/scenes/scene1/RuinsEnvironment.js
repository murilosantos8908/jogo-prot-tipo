import * as THREE from "three";
import { makeMaterials, addGround } from "../../three/materials";
import { box, lamp, leaf, puddle, reedClump, root, tree } from "../../three/forms";
import { addFog, bulboTree, fungusPatch } from "../../three/world";
import { addCanopyBridge, addClothLine, addFallenLog, addForestFloorPatch, addGroundDebris, addMosquitoCloud, addMushroomCluster, addRaindropRipples, addRootsAcrossPath, addSwampGrassIsland, addTrashCan, animateMosquitoClouds } from "../../three/forestKit";

export function buildRuins() {
  const group = new THREE.Group(), mats = makeMaterials();
  const floor = addGround(group, mats, 19, 42);
  const floorY = floor.geometry.attributes.position;
  for (let i = 0; i < floorY.count; i++) floorY.setY(i, 0);
  floorY.needsUpdate = true;
  floor.geometry.computeVertexNormals();
  addFog(group, 0x3a4434, .027);
  const groundY = () => 0;
  // A sealed, damp alley: rough masonry replaces the forest line on both sides.
  for (let side of [-1, 1]) {
    for (let section = 0; section < 13; section++) {
      const z = -23 + section * 3.8;
      const x = side * 10.7;
      const height = 5.8 + (section % 4) * .35;
      box(group, mats.alleyStone, [x, height / 2, z], [1.2, height, 4.1], [0, 0, (section % 2 ? 1 : -1) * .015]);
      // Offset masonry joints and broken coping catch the warm lights.
      for (let row = 0; row < 7; row++) for (let brick = 0; brick < 3; brick++) {
        const bx = x - side * .62, bz = z - 1.28 + brick * 1.32 + (row % 2) * .25;
        box(group, (row + brick + section) % 4 ? mats.alleyStone : mats.alleyStoneLight,
          [bx, .42 + row * .76, bz], [.11, .66, 1.2], [0, 0, (brick % 2 ? 1 : -1) * .018]);
      }
      // Moss mats climb upward in irregular patches, with thin damp trails.
      for (let patch = 0; patch < 4; patch++) {
        const pz = z - 1.4 + ((section * 17 + patch * 13) % 29) / 10;
        const py = .18 + ((section * 11 + patch * 7) % 35) / 10;
        const width = .45 + ((section + patch) % 4) * .19;
        const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), patch % 2 ? mats.moss : mats.mossDeep);
        moss.position.set(x - side * .68, py, pz); moss.scale.set(.09, .22 + patch * .035, width); moss.rotation.y = section * .7; group.add(moss);
      }
      box(group, mats.alleyStoneDark, [x, height + .12, z], [1.42, .24, 4.22], [0, 0, .02]);
    }
  }
  // Back wall closes the far end; the opening is framed by scavenged timber.
  box(group, mats.alleyStone, [0, 3.1, -24], [22, 6.2, 1.1]);
  for (let side of [-1, 1]) for (let k = 0; k < 8; k++) {
    const x = side * (8.6 + (k % 2) * .7), z = 15.5 + (k % 4) * .47;
    const sack = new THREE.Mesh(new THREE.SphereGeometry(.52 + (k % 3) * .12, 12, 9), k % 2 ? mats.trashCloth : mats.woodDark);
    sack.position.set(x, .35 + (k % 3) * .18, z); sack.scale.set(1.25, .8 + (k % 2) * .2, .85); sack.rotation.y = k * .73; sack.castShadow = true; group.add(sack);
    if (k % 3 === 0) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.28, .055, 7, 14), mats.rust);
      rim.position.set(x + .28, .12, z - .18); rim.rotation.set(Math.PI / 2.4, 0, .3); group.add(rim);
    }
  }
  // The player wakes beside a heap of refuse pressed into the alley's dead end.
  for (let i = 0; i < 17; i++) {
    const angle = i * 2.399, radius = .35 + (i % 6) * .2;
    const x = Math.cos(angle) * radius, z = 18.8 + Math.sin(angle) * radius * .58;
    if (i % 4 === 0) {
      const sack = new THREE.Mesh(new THREE.SphereGeometry(.26 + (i % 3) * .08, 12, 8), mats.trashCloth);
      sack.position.set(x, .17 + (i % 2) * .08, z); sack.scale.set(1.3, .72, .9); sack.rotation.y = angle; sack.castShadow = true; group.add(sack);
    } else if (i % 4 === 1) {
      box(group, i % 2 ? mats.wood : mats.woodDark, [x, .08, z], [.42, .14, .27], [0, angle, .04]);
    } else if (i % 4 === 2) {
      const scrap = new THREE.Mesh(new THREE.ConeGeometry(.12, .26, 7), mats.rust);
      scrap.position.set(x, .13, z); scrap.rotation.z = Math.PI / 2; group.add(scrap);
    } else {
      puddle(group, mats.waterLight, x, z, .19 + (i % 3) * .06, .12);
    }
  }
  // Layered bags and broken furniture form a broad heap that the player wakes from.
  for (let layer = 0; layer < 3; layer++) {
    const count = 8 - layer * 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + layer * .31;
      const radius = 1.05 + layer * .12 + Math.sin(i * 4.1) * .12;
      const bag = new THREE.Mesh(new THREE.SphereGeometry(.46 + (i % 3) * .09, 13, 10),
        [mats.trashCloth, mats.woodDark, mats.stallRed][(i + layer) % 3]);
      bag.position.set(Math.cos(angle) * radius, .34 + layer * .48, 18.6 + Math.sin(angle) * radius * .48);
      bag.scale.set(1.18 + (i % 2) * .22, .78, .88); bag.rotation.set((i % 3) * .12, angle, (i % 2) * .16); bag.castShadow = true; bag.receiveShadow = true; group.add(bag);
    }
  }
  // Split boards, a crushed crate, torn fabric and wet paper make the mound read as refuse.
  for (let i = 0; i < 12; i++) {
    const a = i * 2.17, r = .45 + (i % 4) * .24, x = Math.cos(a) * r, z = 18.6 + Math.sin(a) * r * .55;
    if (i % 3 === 0) {
      const plank = box(group, i % 2 ? mats.woodEdge : mats.woodDark, [x, .72 + (i % 2) * .12, z], [.9, .09, .18], [(.15 - i * .02), a, .12]);
      plank.castShadow = true;
    } else if (i % 3 === 1) {
      const paper = box(group, mats.clothOchre, [x, .15, z], [.52, .025, .4], [0, a, .04]);
      paper.scale.set(1, 1, .8);
    } else {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, .27, 10), mats.rust);
      can.position.set(x, .23, z); can.rotation.set(.5, a, 1.1); group.add(can);
    }
  }
  addMushroomCluster(group, mats, -1.6, 17.4, 15, .8, 124);
  addMushroomCluster(group, mats, 1.7, 18.2, 12, .72, 128);
  fungusPatch(group, mats, 0, 18, 24, 2.2);
  // Ivy and broken drain pipes soften the masonry edges without obscuring the lane.
  for (let side of [-1, 1]) for (let i = 0; i < 12; i++) {
    const z = -21 + i * 3.7, x = side * 10.02;
    root(group, mats.woodDark, [[x, 5.3, z], [x - side * .12, 3.7, z + .3], [x - side * .08, 1.1, z - .15]], .035);
    if (i % 2 === 0) for (let j = 0; j < 4; j++) leaf(group, j % 2 ? mats.leaf : mats.moss, x - side * .12, 1.4 + j * .67, z + j * .16, .28, i + j);
    if (i % 3 === 0) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 3.6, 10), mats.rust);
      pipe.position.set(side * 9.82, 1.9, z + 1.1); group.add(pipe);
      for (let y of [.35, 3.35]) box(group, mats.woodDark, [side * 9.82, y, z + 1.1], [.24, .12, .28]);
    }
  }

  // A narrow muddy lane is boxed in by patched homes and wet forest growth.
  const channel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 39), mats.water);
  channel.rotation.x = -Math.PI / 2; channel.position.set(7.7, -.06, -1); group.add(channel);
  for (let side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const z = 12 - i * 5.7, x = side * (4.55 + (i % 2) * .28);
    const width = 3.2 + (i % 3) * .28, depth = 4.25, floorHeight = .84;
    const inner = x - side * (depth / 2 - .12), wallY = floorHeight + 1.25;

    // Each stilt reaches the mud; cross braces lock the raised floor together.
    for (let dx of [-1.35, 1.35]) for (let dz of [-1.72, 1.72]) {
      box(group, mats.woodDark, [x + dx, floorHeight / 2, z + dz], [.2, floorHeight, .2]);
    }
    for (let dz of [-1.72, 1.72]) box(group, mats.woodEdge, [x, .28, z + dz], [3, .12, .13], [0, 0, side * .09]);
    box(group, mats.woodEdge, [x, floorHeight, z], [3, .18, depth]);

    // Three walls leave a narrow doorway facing the lane.
    box(group, mats.woodDark, [x + side * 1.48, wallY, z], [.16, 2.5, depth]);
    for (let dz of [-1.98, 1.98]) box(group, mats.wood, [x, wallY, z + dz], [3, 2.5, .16]);
    box(group, mats.wood, [inner, wallY, z - 1.25], [.14, 2.5, 1.25]);
    box(group, mats.woodEdge, [inner, wallY, z + 1.45], [.14, 2.5, 2.15]);

    // Uneven plank siding, patched cloth and a lit window break up each facade.
    for (let row = 0; row < 5; row++) for (let panel = 0; panel < 4; panel++) {
      const panelZ = z - 1.62 + panel * 1.04, tint = (row + panel + i) % 4 === 0 ? mats.woodEdge : mats.wood;
      box(group, tint, [inner - side * .085, floorHeight + .28 + row * .43, panelZ], [.035, .39, 1.0], [0, 0, ((row + panel) % 2 ? -1 : 1) * .018]);
    }
    const windowZ = z - .9 + (i % 2) * 1.8;
    box(group, mats.woodDark, [inner - side * .105, wallY + .18, windowZ], [.08, .78, .86]);
    box(group, mats.glass, [inner - side * .16, wallY + .18, windowZ], [.035, .58, .64]);
    box(group, mats.woodEdge, [inner - side * .2, wallY + .18, windowZ], [.07, .08, .98]);
    box(group, mats.woodEdge, [inner - side * .2, wallY + .18, windowZ], [.07, .82, .08]);
    box(group, mats.clothOchre, [inner - side * .24, floorHeight + 1.7, z + .5], [.05, .75, 1.15], [0, 0, .08]);
    box(group, mats.woodDark, [x, floorHeight + 2.56, z], [3.5, .18, 4.55], [0, side * .035, side * .045]);
    for (let plank = 0; plank < 5; plank++) box(group, mats.woodEdge, [x - 1.45 + plank * .72, floorHeight + 2.68, z], [.045, .05, 4.3], [0, side * .035, side * .045]);
    for (let support of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.035, .055, 1.3, 8), mats.woodDark);
      pole.position.set(inner - side * .62, floorHeight + 1.75, z + support * 1.55); pole.rotation.z = side * .08; pole.scale.y = .62; group.add(pole);
    }
    box(group, mats.cloth, [inner - side * .72, floorHeight + 2.12, z], [1.25, .12, 3.45], [0, side * .04, side * .06]);
    addClothLine(group, mats, [inner, 3.55, z - 1.25], [inner - side * .35, 3.4, z + 1.45], 3, i + side * 44);

    // Roots and creepers climb onto roofs, tying the shacks into the forest.
    for (let vine = 0; vine < 3; vine++) {
      const vz = z - 1.5 + vine * 1.35;
      root(group, mats.woodDark, [[inner, 3.9, vz], [inner - side * .08, 3.1, vz + .25], [inner - side * .1, 1.05, vz - .15]], .035);
      if (vine !== 1) leaf(group, mats.leaf, inner - side * .12, 2.1, vz, .35, vine * 1.4);
    }
    for (let p = 0; p < 4; p++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(.62, .12, .72), mats.woodEdge);
      // Each riser advances from the lane into the doorway, so the stairs climb toward the house.
      step.position.set(inner + side * (.35 + p * .48), .11 + p * .24, z - .1); step.rotation.y = side * .03; group.add(step);
    }
  }

  // Discarded sheets, broken crates, cans and cloth lie directly on the lane margins.
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1, z = 16 - i * 1.82, x = side * (1.7 + (i % 3) * .12);
    if (i % 3 === 0) {
      box(group, mats.woodDark, [x, .12, z], [.72, .24, .58], [0, i * .7, .06]);
      box(group, mats.woodEdge, [x - side * .12, .255, z - .03], [.38, .04, .42], [0, i * .7, 0]);
    } else if (i % 3 === 1) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.16, .18, .42, 12), mats.rust);
      can.position.set(x, .21, z); can.rotation.z = i % 2 ? .18 : -.12; group.add(can);
    } else {
      box(group, mats.rust, [x, .045, z], [.9, .09, .62], [0, i * .47, .025]);
      box(group, mats.wood, [x + side * .34, .08, z + .38], [.75, .12, .12], [0, i * .2, .08]);
    }
    if (i % 4 === 0) puddle(group, mats.waterLight, x - side * .36, z + .5, .52, .26);
    if (i % 3 === 0) addGroundDebris(group, mats, x, z, 8, .55, i + 90, groundY(x, z));
    if (i % 5 === 0) addTrashCan(group, mats, side * 2.05, z - .2, groundY(x, z), i % 2 === 0);
  }
  for (let side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const z = 15 - i * 5.6;
      addSwampGrassIsland(group, mats, side * 3.05, z, 2.2, 1.15, i + side * 18);
      addForestFloorPatch(group, mats, side * 8.9, z - 1.3, 2.4, i + side * 51);
      addRaindropRipples(group, mats, side * 5.9, z + .6, 6, i + side * 93);
      if (i % 2 === 0) addMushroomCluster(group, mats, side * 6.4, z + 1.7, 9, .75, i + 190);
    }
    addFallenLog(group, mats, [side * 4.2, 0, -5], [side * 6.8, 0, -4.3], .2, 0);
    addFallenLog(group, mats, [side * 6.1, 0, 11], [side * 8.3, 0, 12.5], .24, 0);
  }
  for (let i = 0; i < 6; i++) {
    const z = 12 - i * 5.7;
    addCanopyBridge(group, mats, -7.2, 7.2, z - 2.7, 6.3 + (i % 2) * .4, i + 281);
    if (i % 2 === 1) addRootsAcrossPath(group, mats, -3.5, 3.5, z + 1.2, .04, i + 311);
  }
  const flyClouds = [];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    const z = 12 - Math.floor(i / 2) * 8;
    flyClouds.push(addMosquitoCloud(group, mats, side * 1.55, z, 36 + (i % 3) * 8, 1.5 + (i % 2) * .5, 1.25 + (i % 2) * .35, i + 31));
  }

  // Story props and the movable barrier are grounded to the same flat lane datum.
  box(group, mats.clothOchre, [-1, .023, 14], [.9, .045, .62], [0, -.24, -.06]);
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, .56, 16), mats.ceramic);
  jar.position.set(1, .28, 12); jar.castShadow = true; group.add(jar);
  const jarLid = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .08, 16), mats.woodEdge);
  jarLid.position.set(1, .6, 12); group.add(jarLid);
  const barrier = box(group, mats.woodDark, [0, .65, -9], [3.8, 1.3, .18], [0, 0, .02]); barrier.name = "alley_exit_barrier";
  for (let x of [-1.75, 1.75]) box(group, mats.wood, [x, .65, -9], [.16, 1.3, .16], [0, 0, x * .025]);
  for (let side of [-1, 1]) {
    box(group, mats.woodDark, [side * 4.35, 1.2, -12.7], [1.8, 2.4, .35]);
    box(group, mats.woodEdge, [side * 4.3, 2.45, -12.7], [2.15, .16, 1.2], [0, side * .04, .04]);
  }

  // Dense trunks and layered crowns make the alley feel swallowed by the canopy.
  for (let side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const z = 18 - i * 4.6, x = side * (7.1 + (i % 3) * .8);
    tree(group, mats, x, z, 1.35 + (i % 3) * .12, i % 4 === 0);
    if (i % 2 === 0) tree(group, mats, x + side * 2.8, z + 1.8, 1.02 + (i % 3) * .1, false);
    reedClump(group, mats, side * (2.8 + (i % 2) * .45), z + 1.5, .8 + (i % 3) * .18);
    if (i % 3 === 0) root(group, mats.wood, [[side * 8.5, .04, z + 2], [side * 6, .18, z + .8], [side * 3.3, .05, z - .5]], .18);
  }
  // Branches and hanging vines arch overhead while leaving the walking line open.
  for (let side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const z = 15 - i * 6.5, x = side * 7.3;
    root(group, mats.woodDark, [[x, 4.2, z], [side * 4.8, 5.1, z - 1], [side * 1.1, 5.35, z - 2.1]], .2);
    for (let j = 0; j < 4; j++) leaf(group, j % 2 ? mats.leaf : mats.leafLight, side * (.4 + j * .8), 4.75 + (j % 2) * .25, z - 1.8, .62, j * 1.6);
    if (i % 2 === 0) root(group, mats.leaf, [[side * 4, 5, z], [side * 3.5, 3.8, z + .2], [side * 3.4, 2.6, z + .4]], .035);
  }
  for (let i = 0; i < 16; i++) {
    const x = -8 + (i * 13 % 16), z = -17 + (i * 7 % 36);
    if (i % 2 === 0) puddle(group, mats.water, x, z, .55 + (i % 3) * .2, .28 + (i % 2) * .14);
    reedClump(group, mats, x, z, .45 + (i % 3) * .15);
  }
  // The timber homes are being reclaimed too: luminous fungi spread at their damp footings.
  for (const [x, z, seed] of [[-5.3, 9, 171], [5.5, 3, 183], [-5.2, -5, 195], [5.4, -16, 207]]) {
    fungusPatch(group, mats, x, z, 16, 1.8);
    addMushroomCluster(group, mats, x + .65, z + .25, 8, .55, seed);
  }
  bulboTree(group, mats, -13, -31);
  fungusPatch(group, mats, -6, -8, 36, 3.5); fungusPatch(group, mats, 7, -15, 30, 3);
  lamp(group, mats, -2.75, 7, 3.1, 0xffa933, 8); lamp(group, mats, 2.7, -2, 3, 0xffa52e, 7); lamp(group, mats, -2.6, -10, 2.8, 0xffad3b, 8);
  const light = new THREE.HemisphereLight(0xa9bd83, 0x34372a, 1.35); group.add(light);
  const moon = new THREE.DirectionalLight(0xb5c89a, 1.2); moon.position.set(-8, 14, 8); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); group.add(moon);
  return { group, camera: { position: [0, 5.8, 21], target: [0, 1.6, 4], minDistance: 8, maxDistance: 29 }, spawn: [0, .48, 18.1], update: (time) => animateMosquitoClouds(flyClouds, time) };
}
