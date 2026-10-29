import * as THREE from "three";
import { box, leaf, puddle, reedClump, root } from "./forms";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function seededNoise(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function surfaceHeightAt(x, z, base = 0) {
  return base + Math.sin(x * .55) * .12 + Math.cos(z * .42) * .11 + Math.sin((x + z) * .8) * .035;
}

export function settleMesh(mesh, x, z, groundY = 0, clearance = 0) {
  mesh.position.x = x;
  mesh.position.z = z;
  mesh.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(mesh);
  mesh.position.y += groundY + clearance - bounds.min.y;
  mesh.updateMatrixWorld(true);
  return mesh;
}

export function makeLeafMaterial(color, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: .88,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1
  });
}

export function addFern(group, mats, x, z, scale = 1, rotation = 0) {
  const plant = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(.018 * scale, .035 * scale, .82 * scale, 7),
    mats.moss
  );
  stem.position.y = .41 * scale;
  plant.add(stem);
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 1 : -1;
    const row = Math.floor(i / 2);
    const frond = new THREE.Mesh(
      new THREE.SphereGeometry(1, 10, 7),
      i % 3 ? mats.leaf : mats.leafLight
    );
    frond.scale.set(.13 * scale, .38 * scale, .055 * scale);
    frond.position.set(side * (.12 + row * .055) * scale, (.18 + row * .075) * scale, 0);
    frond.rotation.z = -side * (.5 + row * .08);
    plant.add(frond);
  }
  plant.position.set(x, .015, z);
  plant.rotation.y = rotation;
  plant.scale.setScalar(scale);
  plant.traverse((object) => { if (object.isMesh) object.castShadow = true; });
  group.add(plant);
  return plant;
}

export function addLeafLitter(group, mats, x, z, count = 12, spread = 1.2, seed = 1) {
  const random = seededNoise(seed);
  const patch = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * spread;
    const scale = .12 + random() * .22;
    const blade = new THREE.Mesh(
      new THREE.SphereGeometry(1, 7, 5),
      random() > .5 ? mats.leaf : mats.leafLight
    );
    blade.scale.set(scale * 1.8, .018, scale * .85);
    blade.position.set(Math.cos(angle) * radius, .022 + random() * .012, Math.sin(angle) * radius);
    blade.rotation.y = angle;
    blade.rotation.z = (random() - .5) * .16;
    patch.add(blade);
  }
  patch.position.set(x, 0, z);
  group.add(patch);
  return patch;
}

export function addForestFloorPatch(group, mats, x, z, radius = 2, seed = 1) {
  const random = seededNoise(seed);
  for (let i = 0; i < 5; i++) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * radius;
    const px = x + Math.cos(angle) * distance;
    const pz = z + Math.sin(angle) * distance;
    if (i % 2 === 0) {
      addFern(group, mats, px, pz, .55 + random() * .5, angle);
    } else {
      reedClump(group, mats, px, pz, .55 + random() * .45);
    }
  }
  addLeafLitter(group, mats, x, z, 8 + Math.floor(random() * 8), radius, seed + 91);
}

export function addVineCurtain(group, mats, x, z, height = 4, count = 5, seed = 1, inward = 0) {
  const random = seededNoise(seed);
  const curtain = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const offset = (i - (count - 1) / 2) * .32;
    const length = height * (.62 + random() * .38);
    const sway = (random() - .5) * .5;
    const width = .14 + random() * .12;
    root(curtain, mats.wood, [
      [offset, height, 0],
      [offset + sway, height * .68, inward * .35],
      [offset - sway * .6, height * .34, inward * .65],
      [offset + sway * .4, height - length, inward]
    ], .018 + random() * .012);
    for (let leafIndex = 0; leafIndex < 4; leafIndex++) {
      const t = .2 + leafIndex * .18;
      const leafMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 6),
        (leafIndex + i) % 2 ? mats.leaf : mats.leafLight
      );
      leafMesh.scale.set(width, width * .27, width * .7);
      leafMesh.position.set(offset + sway * t, height * (1 - t), inward * t);
      leafMesh.rotation.y = random() * Math.PI;
      curtain.add(leafMesh);
    }
  }
  curtain.position.set(x, 0, z);
  curtain.traverse((object) => { if (object.isMesh) object.castShadow = true; });
  group.add(curtain);
  return curtain;
}

export function addCanopyBridge(group, mats, left, right, z, height = 5.5, seed = 1) {
  const random = seededNoise(seed);
  const middle = (left + right) / 2;
  const sag = .18 + random() * .35;
  root(group, mats.woodDark, [
    [left, height - .4, z],
    [left * .55 + right * .45, height + .12, z - .35],
    [middle, height - sag, z - .8],
    [left * .42 + right * .58, height + .1, z - 1.1],
    [right, height - .3, z - 1.4]
  ], .15 + random() * .08);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = THREE.MathUtils.lerp(left, right, t);
    const y = height - Math.sin(t * Math.PI) * sag;
    const leafMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 10, 7),
      i % 2 ? mats.leaf : mats.leafLight
    );
    leafMesh.scale.set(.6 + random() * .28, .22 + random() * .13, .45 + random() * .24);
    leafMesh.position.set(x, y - .05, z - .6 + (random() - .5) * .5);
    leafMesh.rotation.y = random() * Math.PI;
    leafMesh.castShadow = true;
    group.add(leafMesh);
    if (i % 3 === 0) addVineCurtain(group, mats, x, z - .7, .9 + random() * .8, 2, seed + i, .15);
  }
}

export function addForestBoulder(group, mats, x, z, scale = 1, groundY = 0, seed = 1) {
  const random = seededNoise(seed);
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(scale, 2),
    mats.stone
  );
  rock.scale.set(1.35 + random() * .3, .55 + random() * .2, .95 + random() * .3);
  rock.rotation.set((random() - .5) * .2, random() * Math.PI, (random() - .5) * .16);
  settleMesh(rock, x, z, groundY, -.025);
  rock.castShadow = true;
  rock.receiveShadow = true;
  group.add(rock);
  const moss = new THREE.Mesh(
    new THREE.SphereGeometry(scale * .72, 10, 6),
    mats.moss
  );
  moss.scale.set(1.1, .19, .82);
  moss.rotation.y = rock.rotation.y;
  moss.position.set(x + (random() - .5) * scale * .25, rock.position.y + scale * .38, z);
  moss.castShadow = true;
  group.add(moss);
  return rock;
}

export function addFallenLog(group, mats, from, to, radius = .16, groundY = 0) {
  const start = new THREE.Vector3(from[0], from[1], from[2]);
  const end = new THREE.Vector3(to[0], to[1], to[2]);
  start.y = groundY + radius * .62;
  end.y = groundY + radius * .62;
  const direction = end.clone().sub(start);
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * .75, radius, direction.length(), 10, 2),
    mats.woodDark
  );
  log.position.copy(start).add(end).multiplyScalar(.5);
  log.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  log.castShadow = true;
  log.receiveShadow = true;
  group.add(log);
  const cut = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * .73, radius * .73, .025, 10),
    mats.woodEdge
  );
  cut.position.copy(end);
  cut.quaternion.copy(log.quaternion);
  group.add(cut);
  return log;
}

export function addMushroomCluster(group, mats, x, z, count = 8, spread = .8, seed = 1) {
  const random = seededNoise(seed);
  const cluster = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * spread;
    const size = .12 + random() * .22;
    const stemHeight = size * (1.1 + random() * .8);
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(size * .1, size * .16, stemHeight, 8),
      mats.bone
    );
    stem.position.set(Math.cos(angle) * radius, stemHeight / 2, Math.sin(angle) * radius);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(size, 12, 8),
      i % 3 ? mats.fungus : mats.amber
    );
    cap.scale.y = .38;
    cap.position.set(stem.position.x, stemHeight, stem.position.z);
    cap.castShadow = true;
    cluster.add(stem, cap);
  }
  cluster.position.set(x, .01, z);
  group.add(cluster);
  return cluster;
}

export function addGroundDebris(group, mats, x, z, count = 12, spread = 1, seed = 1, groundY = 0) {
  const random = seededNoise(seed);
  const patch = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * spread;
    const width = .12 + random() * .42;
    const height = .025 + random() * .12;
    const depth = .1 + random() * .36;
    const materials = [mats.woodDark, mats.woodEdge, mats.rust, mats.stone];
    const item = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      materials[Math.floor(random() * materials.length)]
    );
    item.position.set(Math.cos(angle) * radius, groundY + height / 2 + .006, Math.sin(angle) * radius);
    item.rotation.y = random() * Math.PI;
    item.rotation.z = (random() - .5) * .05;
    item.castShadow = true;
    patch.add(item);
  }
  patch.position.set(x, 0, z);
  group.add(patch);
  return patch;
}

export function addTrashCan(group, mats, x, z, groundY = 0, tipped = false) {
  const can = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(.27, .3, .72, 16, 2, true),
    mats.rust
  );
  body.position.y = .36;
  body.castShadow = true;
  can.add(body);
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(.29, .29, .045, 16),
    mats.woodDark
  );
  bottom.position.y = .025;
  can.add(bottom);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(.275, .035, 8, 18),
    mats.woodEdge
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = .71;
  can.add(rim);
  for (let rib = 0; rib < 8; rib++) {
    const angle = rib * Math.PI / 4;
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(.025, .58, .025),
      mats.woodDark
    );
    strip.position.set(Math.cos(angle) * .28, .36, Math.sin(angle) * .28);
    strip.rotation.y = -angle;
    can.add(strip);
  }
  can.position.set(x, groundY + .015, z);
  if (tipped) {
    can.rotation.z = Math.PI / 2.25;
    can.position.y = groundY + .25;
  }
  can.traverse((object) => { if (object.isMesh) object.castShadow = true; });
  group.add(can);
  return can;
}

export function addClothLine(group, mats, from, to, pieces = 3, seed = 1) {
  const random = seededNoise(seed);
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const cableCurve = new THREE.QuadraticBezierCurve3(
    start,
    start.clone().add(end).multiplyScalar(.5).add(new THREE.Vector3(0, -.18, 0)),
    end
  );
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(cableCurve, 18, .018, 6, false),
    mats.woodDark
  );
  group.add(cable);
  for (let i = 0; i < pieces; i++) {
    const t = (i + 1) / (pieces + 1);
    const point = cableCurve.getPoint(t);
    const width = .35 + random() * .2;
    const height = .55 + random() * .32;
    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height, 3, 5),
      [mats.cloth, mats.clothOchre, mats.rust][i % 3]
    );
    cloth.material.side = THREE.DoubleSide;
    cloth.position.copy(point);
    cloth.position.y -= height / 2;
    cloth.rotation.y = (random() - .5) * .4;
    cloth.rotation.z = (random() - .5) * .1;
    cloth.castShadow = true;
    group.add(cloth);
  }
  return cable;
}

function addStallLeg(group, mats, x, z, height) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(.045, .065, height, 8),
    mats.woodDark
  );
  leg.position.set(x, height / 2, z);
  leg.castShadow = true;
  group.add(leg);
  return leg;
}

function addStallAwning(group, mats, x, z, width, depth, height, colorIndex = 0) {
  const colors = [mats.clothOchre, mats.cloth, mats.rust];
  const clothGroup = new THREE.Group();
  const stripes = 7;
  for (let i = 0; i < stripes; i++) {
    const stripeWidth = width / stripes;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(stripeWidth + .015, .11, depth),
      colors[(i + colorIndex) % colors.length]
    );
    stripe.position.set(-width / 2 + stripeWidth * (i + .5), 0, 0);
    stripe.rotation.x = -.035;
    stripe.castShadow = true;
    clothGroup.add(stripe);
    const shortValance = new THREE.Mesh(
      new THREE.BoxGeometry(stripeWidth + .01, .36, .055),
      colors[(i + colorIndex) % colors.length]
    );
    shortValance.position.set(-width / 2 + stripeWidth * (i + .5), -.19, depth / 2 - .02);
    clothGroup.add(shortValance);
  }
  clothGroup.position.set(x, height, z);
  group.add(clothGroup);
  return clothGroup;
}

function addProducePile(group, mats, x, y, z, count, seed = 1) {
  const random = seededNoise(seed);
  const fruitMaterials = [mats.amber, mats.moss, mats.clothOchre, mats.food];
  for (let i = 0; i < count; i++) {
    const angle = i * 2.399;
    const radius = .12 + Math.sqrt(random()) * .48;
    const fruit = new THREE.Mesh(
      new THREE.SphereGeometry(.13 + random() * .055, 14, 10),
      fruitMaterials[i % fruitMaterials.length]
    );
    fruit.scale.y = .82 + random() * .28;
    fruit.position.set(x + Math.cos(angle) * radius, y + random() * .06, z + Math.sin(angle) * radius);
    fruit.castShadow = true;
    group.add(fruit);
  }
}

export function buildForestMarketStall(group, mats, options = {}) {
  const {
    x = 0,
    z = 0,
    width = 4,
    depth = 3.2,
    deckY = -.08,
    style = 0,
    seed = 1,
    produce = true
  } = options;
  const stall = new THREE.Group();
  const topHeight = .96;
  const canopyHeight = 3.25 + (style % 3) * .12;
  const legHeight = topHeight - .16 - deckY;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  // A grounded raised counter has feet, a cross frame and a thick work surface.
  for (let sx of [-1, 1]) for (let sz of [-1, 1]) {
    addStallLeg(stall, mats, sx * (halfWidth - .18), sz * (halfDepth - .2), legHeight);
  }
  box(stall, mats.woodDark, [0, .45, 0], [width - .18, .12, .12]);
  box(stall, mats.woodDark, [0, .45, 0], [.12, .12, depth - .18]);
  box(stall, mats.woodEdge, [0, topHeight, 0], [width + .12, .16, depth + .12], [0, 0, 0], .035);
  box(stall, mats.wood, [0, topHeight + .1, 0], [width - .2, .035, depth - .2]);

  // The rear of the stall is a patchwork display wall rather than a solid cube.
  for (let board = 0; board < 7; board++) {
    const boardHeight = .27 + board * .3;
    const boardMaterial = (board + style) % 3 ? mats.wood : mats.woodEdge;
    box(stall, boardMaterial, [0, boardHeight, -halfDepth + .12], [width - .2, .24, .12]);
  }
  for (let postX of [-halfWidth + .12, halfWidth - .12]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(.07, .1, canopyHeight, 9),
      mats.woodDark
    );
    post.position.set(postX, canopyHeight / 2, halfDepth - .06);
    post.castShadow = true;
    stall.add(post);
  }
  const rearPostLeft = new THREE.Mesh(new THREE.CylinderGeometry(.065, .09, canopyHeight, 8), mats.woodDark);
  const rearPostRight = rearPostLeft.clone();
  rearPostLeft.position.set(-halfWidth + .12, canopyHeight / 2, -halfDepth + .1);
  rearPostRight.position.set(halfWidth - .12, canopyHeight / 2, -halfDepth + .1);
  stall.add(rearPostLeft, rearPostRight);
  addStallAwning(stall, mats, 0, 0, width + .35, depth + .25, canopyHeight, style);

  // Shelves, bins and varied produce give each stall a distinct silhouette.
  for (let shelf = 0; shelf < 2; shelf++) {
    const shelfY = topHeight + .48 + shelf * .52;
    box(stall, mats.woodEdge, [0, shelfY, -halfDepth + .35], [width - .35, .09, .5], [0, 0, 0], .025);
    for (let bracketX of [-halfWidth + .35, halfWidth - .35]) {
      box(stall, mats.woodDark, [bracketX, shelfY - .22, -halfDepth + .14], [.09, .45, .12]);
    }
  }
  for (let crate = 0; crate < 3; crate++) {
    const crateX = -halfWidth + .62 + crate * (width - 1.24) / 2;
    const crateZ = halfDepth - .55;
    box(stall, mats.woodDark, [crateX, topHeight + .25, crateZ], [.72, .5, .6]);
    for (let slat = 0; slat < 3; slat++) {
      box(stall, mats.woodEdge, [crateX - .2 + slat * .2, topHeight + .25, crateZ + .31], [.045, .42, .025]);
    }
    if (produce) addProducePile(stall, mats, crateX, topHeight + .55, crateZ, 5 + style % 4, seed + crate * 17);
  }
  if (produce) {
    addProducePile(stall, mats, -width * .25, topHeight + .22, 0, 8, seed + 29);
    addProducePile(stall, mats, width * .22, topHeight + .22, .18, 6, seed + 61);
  }

  // Hand-painted sign, hanging herbs and a warm lantern anchor the shop front.
  box(stall, mats.woodDark, [0, canopyHeight - .48, halfDepth + .12], [1.25, .48, .1]);
  box(stall, style % 2 ? mats.clothOchre : mats.woodEdge, [0, canopyHeight - .48, halfDepth + .19], [1.08, .32, .035]);
  for (let herb = 0; herb < 4; herb++) {
    const herbX = -halfWidth + .55 + herb * .31;
    root(stall, mats.moss, [[herbX, canopyHeight - .1, -halfDepth + .35], [herbX + .05, canopyHeight - .4, -halfDepth + .32], [herbX - .04, canopyHeight - .73, -halfDepth + .34]], .018);
    leaf(stall, mats.leaf, herbX, canopyHeight - .55, -halfDepth + .3, .16, herb * .8);
  }
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(.22, .2, 12, 1, true), mats.woodDark);
  lampShade.position.set(halfWidth - .28, canopyHeight - .3, halfDepth + .08);
  lampShade.rotation.x = Math.PI;
  stall.add(lampShade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 10), mats.glass);
  bulb.position.set(halfWidth - .28, canopyHeight - .43, halfDepth + .08);
  stall.add(bulb);
  const glow = new THREE.PointLight(0xffb763, 2.1, 5);
  glow.position.copy(bulb.position);
  stall.add(glow);

  stall.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  stall.position.set(x, deckY, z);
  group.add(stall);
  return stall;
}

export function addCrateStack(group, mats, x, z, count = 3, baseY = 0, seed = 1) {
  const random = seededNoise(seed);
  for (let i = 0; i < count; i++) {
    const width = .55 + random() * .28;
    const height = .48 + random() * .22;
    const depth = .5 + random() * .24;
    const offsetX = (random() - .5) * .55;
    const offsetZ = (random() - .5) * .42;
    const centerY = baseY + height / 2 + i * .46;
    box(group, i % 2 ? mats.woodDark : mats.wood, [x + offsetX, centerY, z + offsetZ], [width, height, depth], [0, (random() - .5) * .18, (random() - .5) * .08]);
    for (let slat = 0; slat < 3; slat++) {
      const slatX = x + offsetX - width * .36 + slat * width * .36;
      box(group, mats.woodEdge, [slatX, centerY, z + offsetZ + depth / 2 + .012], [.035, height * .82, .018]);
    }
  }
}

export function addUnderbrushRow(group, mats, side, startZ, endZ, step = 1.5, seed = 1) {
  const random = seededNoise(seed);
  let index = 0;
  for (let z = startZ; z <= endZ; z += step) {
    const offset = (random() - .5) * .9;
    const x = side * (5.8 + random() * 2.4);
    if (index % 4 === 0) addFern(group, mats, x, z + offset, .62 + random() * .52, random() * Math.PI * 2);
    else reedClump(group, mats, x, z + offset, .65 + random() * .55);
    if (index % 3 === 0) addLeafLitter(group, mats, x, z + offset, 9, .9, seed + index);
    index++;
  }
}

export function addMosquitoCloud(group, mats, x, z, count = 45, radius = 2.2, height = 1.7, seed = 1) {
  const random = seededNoise(seed);
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const distance = Math.sqrt(random()) * radius;
    points[i * 3] = Math.cos(angle) * distance;
    points[i * 3 + 1] = random() * height;
    points[i * 3 + 2] = Math.sin(angle) * distance;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
  const material = new THREE.PointsMaterial({
    color: 0x171a13,
    size: .075,
    sizeAttenuation: true,
    transparent: true,
    opacity: .88,
    depthWrite: false
  });
  const cloud = new THREE.Points(geometry, material);
  cloud.position.set(x, .12, z);
  cloud.frustumCulled = false;
  cloud.userData.basePositions = points.slice();
  cloud.userData.seed = seed;
  cloud.userData.height = height;
  cloud.userData.radius = radius;
  cloud.userData.centerX = x;
  cloud.userData.centerZ = z;
  group.add(cloud);
  return cloud;
}

export function animateMosquitoClouds(group, time) {
  const clouds = Array.isArray(group) ? group : [group];
  clouds.forEach((object) => {
    if (!object.isPoints || !object.userData.basePositions) return;
    const positions = object.geometry.attributes.position;
    const base = object.userData.basePositions;
    const seed = object.userData.seed;
    for (let i = 0; i < positions.count; i++) {
      const phase = time * (1.7 + (i % 7) * .08) + seed * .73 + i * 1.91;
      const drift = Math.sin(phase) * .16;
      positions.setXYZ(
        i,
        base[i * 3] + Math.cos(phase * .7) * drift,
        clamp(base[i * 3 + 1] + Math.sin(phase * 1.4) * .08, .03, object.userData.height),
        base[i * 3 + 2] + Math.sin(phase) * drift
      );
    }
    positions.needsUpdate = true;
  });
}

export function addRaindropRipples(group, mats, x, z, count = 12, seed = 1) {
  const random = seededNoise(seed);
  const ripples = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const radius = .08 + random() * .2;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, .008, 5, 20),
      mats.waterLight
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set((random() - .5) * 2.4, .045, (random() - .5) * 2.2);
    ripples.add(ring);
  }
  ripples.position.set(x, 0, z);
  group.add(ripples);
  return ripples;
}

export function addForestFence(group, mats, side, startZ, endZ, spacing = 2.5) {
  const length = Math.max(1, Math.ceil((endZ - startZ) / spacing));
  for (let i = 0; i <= length; i++) {
    const z = THREE.MathUtils.lerp(startZ, endZ, i / length);
    const x = side * (6.8 + Math.sin(i * 1.7) * .24);
    const height = .55 + (i % 3) * .1;
    box(group, mats.woodDark, [x, height / 2, z], [.12, height, .12], [0, 0, Math.sin(i) * .04]);
    if (i < length) {
      const nextZ = THREE.MathUtils.lerp(startZ, endZ, (i + 1) / length);
      const middleZ = (z + nextZ) / 2;
      const middleX = side * (6.8 + Math.sin((i + .5) * 1.7) * .24);
      const distance = Math.hypot(nextZ - z, middleX - x);
      box(group, mats.wood, [middleX, .34, middleZ], [distance, .08, .07], [0, Math.atan2(middleX - x, nextZ - z), 0]);
    }
  }
}

export function addLampCluster(group, mats, x, z, groundY = 0, height = 2.8, color = 0xffbd69) {
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(.055, .105, height, 10),
    mats.rust
  );
  post.position.set(x, groundY + height / 2, z);
  post.castShadow = true;
  group.add(post);
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(.035, .045, .48, 8),
    mats.woodDark
  );
  arm.position.set(x + .18, groundY + height - .16, z);
  arm.rotation.z = Math.PI / 2;
  group.add(arm);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(.18, .17, 12, 1, true),
    mats.woodDark
  );
  shade.position.set(x + .4, groundY + height - .2, z);
  shade.rotation.x = Math.PI;
  group.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(.075, 12, 10),
    mats.glass
  );
  bulb.position.set(x + .4, groundY + height - .31, z);
  group.add(bulb);
  const light = new THREE.PointLight(color, 2.5, 6);
  light.position.copy(bulb.position);
  group.add(light);
  return post;
}

export function addRootsAcrossPath(group, mats, left, right, z, height = .1, seed = 1) {
  const random = seededNoise(seed);
  const middle = (left + right) / 2;
  const wobble = (random() - .5) * .5;
  root(group, mats.wood, [
    [left, height, z],
    [left * .55 + right * .45, height + .18, z + wobble],
    [middle, height - .03, z + wobble * 1.6],
    [left * .4 + right * .6, height + .2, z + wobble],
    [right, height, z]
  ], .09 + random() * .06);
}

export function addSwampGrassIsland(group, mats, x, z, width = 2.4, depth = 1.2, seed = 1) {
  const random = seededNoise(seed);
  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(width * .42, width * .5, .16, 12, 2),
    mats.mudLight
  );
  island.position.set(x, .06, z);
  island.scale.z = depth / width;
  island.castShadow = true;
  island.receiveShadow = true;
  group.add(island);
  for (let i = 0; i < 7; i++) {
    const angle = i * 2.399;
    const radius = random() * width * .32;
    const px = x + Math.cos(angle) * radius;
    const pz = z + Math.sin(angle) * radius * depth / width;
    if (i % 3 === 0) addFern(group, mats, px, pz, .45 + random() * .28, angle);
    else reedClump(group, mats, px, pz, .45 + random() * .35);
  }
  return island;
}

export function addWoodenBoardwalk(group, mats, points, width = 3.2, plankLength = .85, groundY = 0) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, groundY, z)));
  const sampleCount = Math.max(2, Math.ceil(curve.getLength() / plankLength));
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(width, .16, plankLength * .96),
      i % 5 === 0 ? mats.woodEdge : mats.wood
    );
    plank.position.set(point.x, groundY + .08, point.z);
    plank.rotation.y = Math.atan2(tangent.x, tangent.z);
    plank.rotation.z = Math.sin(t * Math.PI * 4) * .012;
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
    if (i % 2 === 0) {
      for (let side of [-1, 1]) {
        const support = new THREE.Mesh(
          new THREE.CylinderGeometry(.06, .09, .65, 8),
          mats.woodDark
        );
        support.position.set(point.x + side * width * .38, groundY - .29, point.z);
        support.rotation.y = plank.rotation.y;
        group.add(support);
      }
    }
  }
  return curve;
}

export function addWaterEdgePlants(group, mats, x, z, count = 8, spread = 2, seed = 1) {
  const random = seededNoise(seed);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * spread;
    const px = x + Math.cos(angle) * radius;
    const pz = z + Math.sin(angle) * spread * .5;
    if (i % 3 === 0) addFern(group, mats, px, pz, .5 + random() * .45, angle);
    else reedClump(group, mats, px, pz, .55 + random() * .5);
  }
}

export function addForestBoundary(group, mats, options = {}) {
  const {
    width = 40,
    depth = 52,
    sideSpacing = 2.7,
    endSpacing = 2.8,
    inset = 1.2,
    seed = 1,
    vines = true
  } = options;
  const random = seededNoise(seed);
  const placements = [];
  const sideX = width / 2 - inset;
  const endZ = depth / 2 - inset;

  for (let z = -endZ; z <= endZ; z += sideSpacing) {
    for (let side of [-1, 1]) {
      placements.push({ x: side * sideX, z: z + (random() - .5) * .3, side, edge: "side" });
      if (random() > .52) {
        placements.push({
          x: side * (sideX - 2.2 - random() * 1.1),
          z: z + (random() - .5) * .9,
          side,
          edge: "side"
        });
      }
    }
  }

  for (let x = -sideX + endSpacing; x < sideX; x += endSpacing) {
    for (let end of [-1, 1]) {
      placements.push({ x: x + (random() - .5) * .35, z: end * endZ, side: end, edge: "end" });
      if (random() > .65) {
        placements.push({
          x: x + (random() - .5) * 1.5,
          z: end * (endZ - 2 - random() * 1.2),
          side: end,
          edge: "end"
        });
      }
    }
  }

  const trunkGeometry = new THREE.CylinderGeometry(.24, .62, 7.4, 10, 4);
  const crownGeometry = new THREE.SphereGeometry(1, 12, 9);
  const trunks = new THREE.InstancedMesh(trunkGeometry, mats.woodDark, placements.length);
  const crownFront = new THREE.InstancedMesh(crownGeometry, mats.leaf, placements.length);
  const crownBack = new THREE.InstancedMesh(crownGeometry, mats.leafLight, placements.length);
  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();

  placements.forEach((placement, index) => {
    const scale = .88 + random() * .65;
    const trunkHeight = 7.4 * scale;
    const trunkWidth = .82 + random() * .42;
    const lean = (random() - .5) * .16;
    dummy.position.set(placement.x, trunkHeight / 2, placement.z);
    dummy.scale.set(trunkWidth, scale, trunkWidth);
    dummy.rotation.set(lean, random() * Math.PI * 2, -lean * .5);
    dummy.updateMatrix();
    trunks.setMatrixAt(index, dummy.matrix);

    const canopyY = trunkHeight - .3;
    const radius = 1.75 + random() * 1.15;
    dummy.position.set(placement.x + (random() - .5) * 1.25, canopyY, placement.z + (random() - .5) * .85);
    dummy.scale.set(radius * 1.2, 1.35 + random() * .65, radius);
    dummy.rotation.set(0, random() * Math.PI, (random() - .5) * .16);
    dummy.updateMatrix();
    crownFront.setMatrixAt(index, dummy.matrix);

    dummy.position.set(placement.x + (random() - .5) * 1.65, canopyY + .9, placement.z + (random() - .5) * 1.25);
    dummy.scale.set(radius * .98, 1.15 + random() * .68, radius * .88);
    dummy.rotation.set((random() - .5) * .12, random() * Math.PI, (random() - .5) * .14);
    dummy.updateMatrix();
    crownBack.setMatrixAt(index, dummy.matrix);

    const colorShift = .88 + random() * .24;
    tint.setRGB(colorShift, colorShift, colorShift);
    crownFront.setColorAt(index, tint);
    crownBack.setColorAt(index, tint);
  });

  for (const mesh of [trunks, crownFront, crownBack]) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    group.add(mesh);
  }

  if (vines) {
    placements.forEach((placement, index) => {
      if (index % 5 !== 0) return;
      const hang = 2.8 + random() * 2.5;
      const direction = placement.edge === "side" ? -placement.side : 0;
      const x = placement.x + (placement.edge === "end" ? (random() - .5) * 2 : 0);
      const z = placement.z + (placement.edge === "side" ? (random() - .5) * 1.2 : -placement.side * .35);
      const vine = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, 6.8, z),
            new THREE.Vector3(x + direction * .25, 5.4, z + .2),
            new THREE.Vector3(x + direction * .45, 3.3, z - .2),
            new THREE.Vector3(x + direction * .35, 6.8 - hang, z + .1)
          ]),
          18,
          .026,
          6,
          false
        ),
        mats.wood
      );
      vine.castShadow = true;
      group.add(vine);
      for (let leafIndex = 0; leafIndex < 3; leafIndex++) {
        const leafMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 8, 6),
          leafIndex % 2 ? mats.leaf : mats.leafLight
        );
        leafMesh.scale.set(.18, .065, .13);
        leafMesh.position.set(
          x + direction * .38,
          5.9 - leafIndex * .75,
          z + .14 * (leafIndex % 2 ? 1 : -1)
        );
        leafMesh.rotation.y = random() * Math.PI;
        group.add(leafMesh);
      }
    });
  }

  trunks.computeBoundingSphere();
  crownFront.computeBoundingSphere();
  crownBack.computeBoundingSphere();
  return { placements, trunks, crownFront, crownBack };
}

