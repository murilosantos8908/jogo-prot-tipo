import * as THREE from "three";
import { makeMaterials } from "../../three/materials";
import { box, leaf, root, tree } from "../../three/forms";

function addPlatformHouse(group, mats, platform, index) {
  const { x, y, z, width, depth } = platform;
  const house = new THREE.Group();
  const palette = [mats.woodDark, mats.alleyStoneDark, mats.stallTeal, mats.trashCloth, mats.wood][index % 5];
  box(house, palette, [0, 1.05, 0], [width, 2.1, depth]);
  // Stilt legs and diagonal braces expose the stacked, improvised construction.
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, 2.4, 8), mats.woodDark);
    leg.position.set(dx * (width * .39), -.15, dz * (depth * .37)); leg.rotation.z = dx * -.045; leg.castShadow = true; house.add(leg);
  }
  for (const side of [-1, 1]) root(house, mats.woodEdge,
    [[side * width * .42, .15, -depth * .45], [side * width * .25, .85, 0], [side * width * .43, 1.75, depth * .45]], .07);
  // Deep windows and an offset door give each jumping surface a recognizable home.
  const front = new THREE.Mesh(new THREE.BoxGeometry(.09, .78, .78), mats.glass);
  front.position.set(-width / 2 - .055, 1.3, -.48); house.add(front);
  box(house, mats.woodEdge, [-width / 2 - .11, 1.3, -.48], [.12, .11, .98]);
  box(house, mats.woodDark, [-width / 2 - .08, 1.02, .72], [.14, 1.7, .72]);
  // Corrugated roof and overhanging vegetated ledges form safe landing areas.
  box(house, index % 2 ? mats.rust : mats.woodEdge, [0, 2.18, 0], [width + .5, .2, depth + .45], [0, 0, .025 * (index % 2 ? 1 : -1)]);
  for (let rib = 0; rib < 8; rib++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.055, .035, depth + .35), mats.woodDark);
    strip.position.set(-width / 2 + rib * width / 7, 2.3, 0); house.add(strip);
  }
  for (let i = 0; i < 5; i++) {
    const planterX = -width * .35 + i * width * .17;
    const fern = new THREE.Mesh(new THREE.SphereGeometry(.34 + (i % 3) * .08, 9, 7), i % 2 ? mats.leaf : mats.moss);
    fern.position.set(planterX, 2.48, depth * .31); fern.scale.set(.85, .52, .75); house.add(fern);
    for (let tendril = 0; tendril < 2; tendril++) {
      root(house, mats.woodDark, [[planterX, 2.6, depth * .3], [planterX + (tendril ? .16 : -.16), 1.6, depth * .34], [planterX + (tendril ? .1 : -.1), .35, depth * .38]], .018);
    }
  }
  house.position.set(x, y, z); group.add(house);
  return house;
}

function addPursuer(group, mats, x, z, seed) {
  const person = new THREE.Group();
  const coat = new THREE.Mesh(new THREE.CapsuleGeometry(.26, .75, 5, 9), seed % 2 ? mats.stallRed : mats.woodDark);
  coat.position.y = .82; coat.castShadow = true; person.add(coat);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(.23, 12, 10), mats.trashCloth);
  hood.position.set(0, 1.57, -.03); hood.scale.set(1.1, 1.15, 1.1); person.add(hood);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.065, .09, .62, 8), mats.stallRed);
    arm.position.set(side * .32, 1.02, 0); arm.rotation.z = side * .28; person.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.08, .095, .52, 8), mats.woodDark);
    leg.position.set(side * .12, .27, 0); person.add(leg);
  }
  person.position.set(x, 0, z); group.add(person); return person;
}

export function buildMarketEscape() {
  const group = new THREE.Group(), mats = makeMaterials();
  group.fog = new THREE.FogExp2(0x42513c, .012);
  const background = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.mud);
  background.rotation.x = -Math.PI / 2; background.position.set(0, -8.4, 0); group.add(background);

  // A staggered sequence of roofs turns the steep favela into the parkour course.
  const route = [
    { x: 0, y: 0, z: 19, width: 5, depth: 4.2 },
    { x: -1.8, y: .35, z: 15.4, width: 3.8, depth: 3.5 },
    { x: 1.1, y: .8, z: 11.8, width: 3.7, depth: 3.3 },
    { x: 3.3, y: .2, z: 8.1, width: 3.9, depth: 3.5 },
    { x: 1.4, y: 1.05, z: 4.5, width: 3.7, depth: 3.4 },
    { x: -1.5, y: .45, z: .9, width: 3.8, depth: 3.4 },
    { x: -3.4, y: 1.25, z: -2.8, width: 3.9, depth: 3.5 },
    { x: -1.1, y: .6, z: -6.4, width: 3.8, depth: 3.4 },
    { x: 1.9, y: 1.45, z: -10, width: 3.8, depth: 3.4 },
    { x: 3.8, y: .65, z: -13.6, width: 3.8, depth: 3.4 },
    { x: 1.2, y: 1.2, z: -17.2, width: 4.2, depth: 3.8 },
    { x: -1.2, y: .35, z: -21, width: 5, depth: 4.5 },
    { x: 0, y: 0, z: -25, width: 6, depth: 5 }
  ];
  for (let i = 0; i < route.length; i++) addPlatformHouse(group, mats, route[i], i);

  // Dense homes rise in tiers on both sides, keeping the route inside the settlement.
  for (let side of [-1, 1]) for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) {
    const x = side * (7.8 + row * 3.2 + (i % 2) * .7), z = 20 - i * 4.2 + (row % 2) * 1.3;
    const width = 3 + (i % 3) * .35, height = 3 + ((i + row) % 3) * .55;
    box(group, [mats.woodDark, mats.alleyStoneDark, mats.stallTeal, mats.wood][(i + row) % 4],
      [x, row * 2.3 + height / 2, z], [width, height, 3.8], [0, 0, (i % 2 ? -.025 : .025)]);
    box(group, mats.rust, [x, row * 2.3 + height + .08, z], [width + .3, .16, 4.05]);
    if ((i + row) % 2 === 0) {
      const vines = new THREE.Mesh(new THREE.ConeGeometry(.4, 1.8, 7), mats.leaf);
      vines.position.set(x + side * 1.1, row * 2.3 + .7, z + 1.2); vines.rotation.z = side * .4; group.add(vines);
    }
  }
  // Root bridges, hanging lines, and giant wet leaves sell the swallowed skyline.
  for (let i = 0; i < 11; i++) {
    const z = 18 - i * 4.3;
    root(group, mats.woodDark, [[-17, 9 + (i % 3), z], [-8, 11 + (i % 2), z - .8], [0, 10, z - 1.5], [9, 12, z - 1], [17, 9, z]], .14);
    for (let j = 0; j < 9; j++) {
      const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(.8 + (j % 3) * .15, 9, 7), j % 2 ? mats.leaf : mats.leafLight);
      leafMesh.position.set(-16 + j * 4, 9.7 + (j % 3) * .3, z - .7); leafMesh.scale.set(1.5, .26, .72); group.add(leafMesh);
    }
  }
  for (let side of [-1, 1]) for (let i = 0; i < 9; i++) tree(group, mats, side * (17 + (i % 3)), 18 - i * 5.1, 1.2 + (i % 3) * .14, i % 3 === 0);

  // The feira's sellers pursue along the rooftops; they trail the player through the escape.
  const pursuers = [addPursuer(group, mats, -1.5, 23.5, 1), addPursuer(group, mats, 1.6, 26, 2), addPursuer(group, mats, 0, 28.5, 3)];
  const ambient = new THREE.HemisphereLight(0xb6c997, 0x293227, 1.5); group.add(ambient);
  const sun = new THREE.DirectionalLight(0xf4dba3, 2.1); sun.position.set(-8, 19, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); group.add(sun);
  for (const [x, z] of [[-4, 12], [4, -5], [-2, -19]]) {
    const glow = new THREE.PointLight(0xffa64a, 3.8, 8); glow.position.set(x, 3.3, z); group.add(glow);
  }
  const platforms = route.map(({ x, y, z, width, depth }) => ({ x, y: y + 2.3, z, width: width + .5, depth: depth + .45 }));
  return {
    group,
    platforms,
    spawn: [0, platforms[0].y, 19],
    camera: { position: [0, 6, 24], target: [0, 2, 8], minDistance: 7, maxDistance: 35 },
    update: (time, dt, playerPosition) => {
      pursuers.forEach((pursuer, i) => {
        const desiredZ = playerPosition.z + 3.2 + i * 1.1;
        const desiredX = playerPosition.x * .35 + (i - 1) * 1.1;
        pursuer.position.z += (desiredZ - pursuer.position.z) * Math.min(1, dt * (.38 + i * .04));
        pursuer.position.x += (desiredX - pursuer.position.x) * Math.min(1, dt * .32);
        const roof = platforms.reduce((closest, platform) =>
          Math.hypot(platform.x - pursuer.position.x, platform.z - pursuer.position.z) <
          Math.hypot(closest.x - pursuer.position.x, closest.z - pursuer.position.z) ? platform : closest
        , platforms[0]);
        pursuer.position.y = roof.y + .04 * Math.sin(time * 6 + i);
        pursuer.rotation.y = Math.atan2(playerPosition.x - pursuer.position.x, playerPosition.z - pursuer.position.z);
      });
    }
  };
}
