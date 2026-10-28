import * as THREE from "three";
import { makeMaterials, addGround } from "../../three/materials";
import { box, lamp, leaf, puddle, reedClump, root, tree } from "../../three/forms";
import { addFog, bulboTree, fungusPatch } from "../../three/world";

export function buildRuins() {
  const group = new THREE.Group(), mats = makeMaterials(); addGround(group, mats, 21, 34); addFog(group, 0x263934, .035);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 33), mats.water); water.rotation.x = -Math.PI / 2; water.position.set(-.1, .015, -1); group.add(water);
  for (let side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const x = side * (4.8 + (i % 2) * .35), z = 10 - i * 5.7, width = 4 + (i % 3) * .5, height = 3 + (i % 2) * .7;
    // stilt frame, patched walls and mismatched roof slabs
    for (let leg = -1; leg <= 1; leg += 2) box(group, mats.woodDark, [x + leg * width * .34, .5, z], [.14, 1, .14], [0, 0, leg * .04]);
    box(group, i % 2 ? mats.wood : mats.woodDark, [x, height * .42, z], [width, height * .72, .22], [0, (i % 2) * .08, -.025]);
    box(group, mats.rust, [x + side * .6, height * .45, z + .14], [1.3, height * .58, .12], [0, -.12, .05]);
    box(group, mats.woodEdge, [x, height, z], [width + .45, .16, 2.2], [0, .03 * side, -.08]);
    box(group, mats.rust, [x - side * .5, height + .16, z - .25], [1.8, .08, 1.2], [0, .12, .18]);
    box(group, mats.wood, [x + side * 1.1, 1.3, z - 1.1], [1.6, .12, .28], [0, -.1, .12]);
    for (let p = 0; p < 3; p++) box(group, mats.woodEdge, [x + side * (1.1 + p * .38), .45, z + .9], [.34, .09, 1.1], [0, .07 * p, .02]);
    if (i % 2 === 0) { box(group, mats.clothOchre, [x - side * .5, 2.6, z + 1.18], [1.1, 1.45, .035], [0, 0, .08]); box(group, mats.woodDark, [x - side * .5, 3.34, z + 1.2], [1.25, .08, .08]); }
    root(group, mats.wood, [[x - side * 2, .1, z + 2], [x - side * .8, .55, z + 1.1], [x + side * .8, .06, z - 1]], .22);
  }
  for (let i = 0; i < 15; i++) { const x = Math.sin(i * 8.7) * 5.2, z = 13 - i * 1.8; if (i % 3 === 0) puddle(group, mats.waterLight, x, z, .7 + i % 2 * .4, .35); if (i % 4 === 0) box(group, mats.wood, [x, .18, z], [1.1, .25, .18], [0, i, .2]); }
  // Awakening site: collapsed roof, bent plate and broken beams.
  box(group, mats.woodDark, [-1.55, .18, 9.2], [2.1, .16, 1.2], [0, -.35, .23]); box(group, mats.rust, [-.15, .24, 9.5], [1.7, .12, .95], [.08, .25, -.25]); box(group, mats.woodEdge, [-.65, .23, 8.55], [2, .15, .16], [.1, -.2, .1]);
  for (let i = 0; i < 7; i++) reedClump(group, mats, -8 + i * 2.5, -12 - (i % 3) * 1.4, .7 + (i % 2) * .3);
  for (let i = 0; i < 4; i++) tree(group, mats, -9 + i * 6, -19, 1.6, true);
  bulboTree(group, mats, -13, -31);
  fungusPatch(group, mats, -6, -8, 28, 3); fungusPatch(group, mats, 7, -15, 22, 2.5);
  lamp(group, mats, -3.2, 3, 3.5, 0xffbd71, 10); lamp(group, mats, 5.5, -7, 3.2, 0xffb85e, 8);
  const light = new THREE.HemisphereLight(0x80979a, 0x1a211e, 1.35); group.add(light);
  const moon = new THREE.DirectionalLight(0x9bb5bd, 1.5); moon.position.set(-8, 12, 8); group.add(moon);
  return { group, camera: { position: [8, 8, 19], target: [0, 1, 0], minDistance: 8, maxDistance: 29 } };
}
