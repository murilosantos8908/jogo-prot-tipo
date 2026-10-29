import * as THREE from "three";
import { makeMaterials, addGround } from "../../three/materials";
import { box, leaf, root, tree } from "../../three/forms";
import { addMossyAlleyWalls } from "../../three/alleyWalls";
import { addClothLine, addCrateStack, addFern, addVineCurtain, addForestFloorPatch, addMushroomCluster, addWaterEdgePlants, buildForestMarketStall, seededNoise } from "../../three/forestKit";

function addFavelaBackdrop(group, mats) {
  // Stacked homes climb above the market wall, closing the distant view with the district.
  for (let side of [-1, 1]) for (let row = 0; row < 5; row++) {
    const x = side * (17.8 + row * 2.25), baseY = row * 2.35, count = 13 - row;
    for (let i = 0; i < count; i++) {
      const z = -27 + i * 4.15 + (row % 2) * 1.2;
      const width = 3.4 + (i % 3) * .35, height = 2.8 + ((row + i) % 3) * .48;
      const wall = [mats.woodDark, mats.alleyStoneDark, mats.wood, mats.stallTeal, mats.trashCloth][(row * 3 + i) % 5];
      box(group, wall, [x, baseY + height / 2, z], [width, height, 3.8], [0, 0, ((i + row) % 2 ? 1 : -1) * .025]);
      const frontX = x - side * (width / 2 + .055);
      // Repeated windows, patched shutters and tin awnings define every small facade.
      for (let window = 0; window < 2; window++) {
        const wz = z + (window ? .85 : -.85), wy = baseY + 1.25 + ((i + window) % 2) * .25;
        box(group, mats.woodDark, [frontX, wy, wz], [.08, .75, .62]);
        box(group, (i + window) % 3 ? mats.glass : mats.stallCloth, [frontX - side * .055, wy, wz], [.035, .56, .43]);
        box(group, mats.woodEdge, [frontX - side * .09, wy + .4, wz], [.12, .08, .72]);
      }
      box(group, i % 2 ? mats.rust : mats.woodEdge,
        [x - side * (width * .58), baseY + height + .08, z], [width * 1.18, .16, 4.25], [0, 0, .03]);
      // Roof gardens and hanging vines connect the informal homes to the surrounding forest.
      if ((i + row) % 2 === 0) {
        addFern(group, mats, x + side * .45, z + .8, .85 + (i % 3) * .15, i * .5);
        root(group, mats.woodDark, [[frontX, baseY + height, z - 1.3], [frontX - side * .12, baseY + 1.7, z - 1.1], [frontX - side * .08, baseY + .3, z - .8]], .028);
        for (let leafIndex = 0; leafIndex < 4; leafIndex++) leaf(group, mats.leaf, frontX - side * .1, baseY + .55 + leafIndex * .48, z - .8, .22, i + leafIndex);
      }
      if (row === 0 && i % 3 === 0) {
        const warmWindow = new THREE.PointLight(0xffb868, .8, 3.2);
        warmWindow.position.set(frontX - side * .2, baseY + 1.35, z); group.add(warmWindow);
      }
    }
  }
  // High silhouettes and canopy growth hide the horizon behind dense, lived-in rooftops.
  for (let i = 0; i < 32; i++) {
    const side = i % 2 ? 1 : -1, x = side * (19 + (i % 5) * 2.3), z = -25 + (i * 9 % 49);
    const tree = new THREE.Mesh(new THREE.ConeGeometry(1.8 + (i % 3) * .4, 5 + (i % 4) * .8, 7), i % 2 ? mats.leaf : mats.leafLight);
    tree.position.set(x, 7.2 + (i % 3) * 1.2, z); tree.rotation.z = side * .12; group.add(tree);
  }
}

function addCrowdPerson(group, mats, x, z, seed, role = "seller") {
  const random = seededNoise(seed), person = new THREE.Group();
  const coatMats = [mats.cloth, mats.stallRed, mats.stallTeal, mats.clothOchre, mats.woodDark];
  const coat = coatMats[Math.floor(random() * coatMats.length)];
  const height = .92 + random() * .3;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.2, height * .56, 4, 9), coat);
  torso.position.y = .73 + height * .28; torso.castShadow = true; person.add(torso);
  const headMaterial = random() > .5 ? mats.skinWarm : mats.skinDeep;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), headMaterial);
  head.position.y = 1.56 + height * .28; head.scale.y = 1.12; head.castShadow = true; person.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.176, 10, 7), mats.woodDark);
  hair.position.set(0, 1.65 + height * .28, -.015); hair.scale.set(1.02, .62, 1.02); person.add(hair);
  for (const legX of [-.105, .105]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.065, .08, .48, 8), mats.woodDark);
    leg.position.set(legX, .25, 0); person.add(leg);
  }
  for (let armSide of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, .56, 8), coat);
    arm.position.set(armSide * .25, 1.02 + height * .18, 0); arm.rotation.z = armSide * -.12; person.add(arm);
  }
  if (role === "seller") {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(.31, .42, .035), mats.stallCloth);
    apron.position.set(0, .95, .19); person.add(apron);
  } else if (seed % 3 === 0) {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(.17, .22, .2, 10), mats.woodEdge);
    basket.position.set(.32, .78, .05); person.add(basket);
  }
  person.position.set(x, 0, z); person.rotation.y = (random() - .5) * .55;
  group.add(person); return person;
}

function addMarketArch(group, mats, z, seed) {
  const arch = new THREE.Group();
  for (let side of [-1, 1]) {
    box(arch, mats.woodDark, [side * 13.3, 2.8, 0], [.28, 5.6, .35]);
    box(arch, mats.woodEdge, [side * 13.3, 5.55, 0], [1.05, .2, .55], [0, 0, side * -.08]);
  }
  box(arch, mats.woodDark, [0, 5.15, 0], [26.6, .3, .4]);
  for (let i = 0; i < 11; i++) {
    const x = -12 + i * 2.4;
    const tile = new THREE.Mesh(new THREE.ConeGeometry(.42, .35, 5), i % 2 ? mats.stallRed : mats.stallCloth);
    tile.position.set(x, 5.43, .03); tile.rotation.y = seed * .17 + i * .3; arch.add(tile);
  }
  arch.position.z = z; group.add(arch);
}

function addWovenMarketPanel(group, mats, x, z, side, seed) {
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.05, .88), new THREE.MeshStandardMaterial({
    color: seed % 2 ? 0x8e5639 : 0x9c7540,
    roughness: .96,
    side: THREE.DoubleSide
  }));
  panel.position.set(x - side * .035, 2.62, z);
  panel.rotation.y = -side * Math.PI / 2;
  panel.castShadow = true; group.add(panel);
  // Repeated lozenges and cross-bands suggest locally woven plant-fiber craft.
  const motifColors = [mats.clothOchre, mats.stallRed, mats.stallTeal];
  for (let row = 0; row < 3; row++) for (let column = 0; column < 5; column++) {
    const shape = new THREE.Shape();
    shape.moveTo(0, .12); shape.lineTo(.085, 0); shape.lineTo(0, -.12); shape.lineTo(-.085, 0); shape.closePath();
    const motifIndex = ((row + column + seed) % motifColors.length + motifColors.length) % motifColors.length;
    const diamond = new THREE.Mesh(new THREE.ShapeGeometry(shape), motifColors[motifIndex]);
    diamond.position.set(x - side * .07, 2.62 + (row - 1) * .23, z + (column - 2) * .18);
    diamond.rotation.y = -side * Math.PI / 2;
    diamond.castShadow = true; group.add(diamond);
  }
  for (let edge = -1; edge <= 1; edge += 2) {
    const braid = new THREE.Mesh(new THREE.TorusGeometry(.055, .012, 5, 12), mats.woodEdge);
    braid.position.set(x - side * .08, 2.62 + edge * .38, z); braid.rotation.y = -side * Math.PI / 2; group.add(braid);
  }
}

export function buildMarketEnvironment() {
  const group = new THREE.Group(), mats = makeMaterials();
  group.fog = new THREE.FogExp2(0x394438, .014);
  const floor = addGround(group, mats, 33, 52);
  const floorPos = floor.geometry.attributes.position;
  for (let i = 0; i < floorPos.count; i++) floorPos.setY(i, 0);
  floorPos.needsUpdate = true; floor.geometry.computeVertexNormals();
  addMossyAlleyWalls(group, mats, { width: 31.2, depth: 52, height: 7.2, thickness: 1.15, seed: 711, ends: false, vines: true });
  addFavelaBackdrop(group, mats);
  for (let side of [-1, 1]) for (let i = 0; i < 7; i++) {
    const z = -21 + i * 7;
    tree(group, mats, side * (12.9 + (i % 2) * .55), z, 1.08 + (i % 3) * .1, i % 3 === 0);
    addVineCurtain(group, mats, side * 14.7, z + 2, 5.7, 7, i + side * 610, -side * 1.5);
    for (let rootIndex = 0; rootIndex < 4; rootIndex++) root(group, mats.woodDark, [[side * 14.2, .08, z], [side * 12.8, .35, z + rootIndex * .36], [side * 11.4, .06, z + .6], [side * 10.2, .02, z + .9]], .09);
  }
  // At either end, timber lintels and weathered signs make the market read as a lived-in lane.
  for (const z of [-25.6, 25.6]) {
    box(group, mats.alleyStone, [0, 3.1, z], [31.5, 6.2, .9]);
    box(group, mats.woodDark, [0, 5.25, z - Math.sign(z) * .52], [8.2, .35, .2]);
    for (let i = 0; i < 9; i++) box(group, i % 3 ? mats.woodEdge : mats.stallRed,
      [-3.6 + i * .9, 5.25, z - Math.sign(z) * .65], [.78, .12, .035], [0, 0, (i % 2 ? 1 : -1) * .035]);
  }
  // Narrow drainage channel and uneven boardwalks preserve the damp alley character.
  const channel = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 50), mats.water);
  channel.rotation.x = -Math.PI / 2; channel.position.set(0, -.045, 0); group.add(channel);
  for (let z = -24.5; z < 25; z += .82) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(28.3, .16, .75), z % 3 < 1 ? mats.woodEdge : mats.wood);
    plank.position.set(0, -.025 + Math.sin(z * .7) * .018, z); plank.rotation.y = Math.sin(z * .31) * .008; plank.castShadow = true; plank.receiveShadow = true; group.add(plank);
  }
  for (let side of [-1, 1]) for (let i = 0; i < 7; i++) {
    const z = -21 + i * 7, x = side * (8.65 + (i % 2) * .45);
    buildForestMarketStall(group, mats, { x, z, width: 4.5, depth: 4, deckY: .06, style: (i + (side > 0 ? 1 : 0)) % 3, seed: i * 23 + side * 31, produce: true });
    addWovenMarketPanel(group, mats, x - side * 2.28, z, side, i + side * 19);
    // Back wall panels, fabric valances and hanging produce fill out each stall.
    for (let panel = 0; panel < 4; panel++) {
      const clothMat = [mats.stallCloth, mats.stallRed, mats.stallTeal][(panel + i) % 3];
      box(group, clothMat, [x - side * 1.55, 2.8, z - 1.35 + panel * .88], [.045, 1.3, .78], [0, 0, (panel % 2 ? 1 : -1) * .025]);
    }
    for (let j = 0; j < 5; j++) {
      const fruit = new THREE.Mesh(new THREE.SphereGeometry(.16 + (j % 2) * .035, 10, 8), [mats.amber, mats.stallRed, mats.leaf][j % 3]);
      fruit.position.set(x - .85 + j * .42, 1.08 + (j % 2) * .12, z + .2); fruit.scale.y = .84; fruit.castShadow = true; group.add(fruit);
    }
    addCrowdPerson(group, mats, x - side * 2.7, z + .4, i * 7 + side * 15, "seller");
    if (i % 2 === 0) addCrowdPerson(group, mats, x - side * 4.4, z - 1.3, i * 11 + 3, "shopper");
  }
  for (const z of [-17, 0, 17]) addMarketArch(group, mats, z, z + 71);
  // Small groups of residents animate the scale of the lane without blocking its route.
  for (let i = 0; i < 18; i++) {
    const z = -22 + (i * 13 % 44), side = i % 2 ? 1 : -1;
    const x = side * (2.1 + (i % 4) * .62);
    addCrowdPerson(group, mats, x, z, 400 + i, i % 4 === 0 ? "seller" : "shopper");
  }
  for (let side of [-1, 1]) {
    addClothLine(group, mats, [side * 14.1, 5.9, -20], [side * 14.1, 5.4, 20], 9, side + 522);
    addWaterEdgePlants(group, mats, side * 14.1, 0, 18, 2.5, side + 58);
    for (let i = 0; i < 7; i++) {
      const z = -20 + i * 6.4;
      addForestFloorPatch(group, mats, side * 14.3, z, 1.4, i + side * 19);
      if (i % 2 === 0) addMushroomCluster(group, mats, side * 14.2, z + 1.2, 7, .48, i + 70);
      // Iron wall lanterns alternate with the cloth lines.
      const lx = side * 14.75;
      box(group, mats.rust, [lx, 3.4, z], [.12, .9, .12]);
      box(group, mats.woodDark, [lx - side * .12, 3.9, z], [.42, .12, .4]);
      const lamp = new THREE.PointLight(0xffb85b, 4.2, 8); lamp.position.set(lx - side * .22, 3.5, z); group.add(lamp);
    }
  }
  for (let i = 0; i < 8; i++) addCrateStack(group, mats, (i % 2 ? -1 : 1) * (4.1 + (i % 3) * .2), -19 + i * 5.2, 1 + i % 3, .03, i + 3);
  // Rain-worn banners, awnings and overhead wires create a layered roofline.
  for (let i = 0; i < 6; i++) {
    const z = -20 + i * 8;
    addClothLine(group, mats, [-13.8, 6.15, z], [13.8, 6.15 - (i % 2) * .3, z + 2.1], 8, i + 401);
    root(group, mats.woodDark, [[-14.8, 6.4, z], [-6, 7.2, z - .6], [0, 7.5, z - 1], [8, 7.1, z - .4], [14.8, 6.4, z]], .035);
  }
  // Timber canopy frame and scattered roof leaves keep the upper silhouette busy.
  for (let z = -23; z <= 23; z += 5.8) {
    for (let side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .13, 6.3, 9), mats.woodDark);
      pole.position.set(side * 13.9, 3.05, z); pole.castShadow = true; group.add(pole);
    }
    root(group, mats.woodDark, [[-14, 6.1, z], [-7, 6.8, z - .2], [0, 7.05, z - .4], [7, 6.8, z - .2], [14, 6.1, z]], .13);
  }
  for (let i = 0; i < 38; i++) {
    const x = -13 + (i * 17 % 26), z = -23 + (i * 11 % 46);
    const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(.45, 8, 6), i % 2 ? mats.leaf : mats.leafLight);
    leafMesh.position.set(x, 6.3 + (i % 4) * .22, z); leafMesh.scale.set(1.1, .3, .72); leafMesh.rotation.y = i * 1.3; group.add(leafMesh);
  }
  for (let side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const z = -22 + i * 6.1, x = side * (17.3 + (i % 3) * 1.1);
    tree(group, mats, x, z, 1.15 + (i % 3) * .13, i % 4 === 0);
  }
  const ambient = new THREE.HemisphereLight(0xb8c5a0, 0x352e24, 1.55); group.add(ambient);
  const key = new THREE.DirectionalLight(0xffd9a0, 1.75); key.position.set(-9, 18, 8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); group.add(key);
  return { group, camera: { position: [0, 5.2, 19], target: [0, 1.8, 2], minDistance: 8, maxDistance: 30 }, spawn: [0, 0, 19] };
}
