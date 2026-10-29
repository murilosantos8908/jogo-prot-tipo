import * as THREE from "three";
import { box, leaf, root } from "./forms";

/** Build enclosing, damp masonry walls that share the beco's visual language. */
export function addMossyAlleyWalls(group, mats, options = {}) {
  const {
    width = 24,
    depth = 48,
    height = 8,
    thickness = 1.1,
    sectionLength = 4,
    ends = true,
    vines = true,
    seed = 1
  } = options;
  const halfWidth = width / 2, halfDepth = depth / 2;
  const sideCount = Math.ceil(depth / sectionLength);
  const rows = Math.ceil(height / .82);
  const stone = mats.alleyStone || mats.stone;
  const darkStone = mats.alleyStoneDark || mats.woodDark;
  const moss = mats.mossDeep || mats.moss;
  const endCount = ends ? Math.ceil(width / sectionLength) : 0;
  const reliefCapacity = 2 * sideCount * rows * (Math.ceil(sectionLength / 1.42) + 2) +
    2 * endCount * rows * (Math.ceil(sectionLength / 1.42) + 2);
  const reliefMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: stone.map || null, roughness: .96 });
  const relief = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), reliefMaterial, reliefCapacity);
  const dummy = new THREE.Object3D(), tint = new THREE.Color();
  const reliefTints = [0x93836c, 0x817662, 0x756e5e, 0xa08e73, 0x887b67];
  let reliefIndex = 0;
  const addReliefStone = (position, scale, rotation, colorIndex) => {
    dummy.position.set(...position); dummy.scale.set(...scale); dummy.rotation.set(0, 0, rotation);
    dummy.updateMatrix(); relief.setMatrixAt(reliefIndex, dummy.matrix);
    tint.setHex(reliefTints[colorIndex % reliefTints.length]); relief.setColorAt(reliefIndex, tint);
    reliefIndex++;
  };

  for (const side of [-1, 1]) {
    const wallX = side * halfWidth;
    for (let section = 0; section < sideCount; section++) {
      const z = -halfDepth + section * sectionLength + sectionLength / 2;
      const run = Math.min(sectionLength + .08, depth - section * sectionLength + .08);
      const heightJitter = ((section + seed) % 4) * .22;
      box(group, stone, [wallX, (height + heightJitter) / 2, z],
        [thickness, height + heightJitter, run], [0, 0, (section % 2 ? 1 : -1) * .012]);

      // Staggered relief stones break the flat wall into hand-laid courses.
      for (let row = 0; row < rows; row++) {
        const y = .4 + row * .78;
        const stonesPerCourse = Math.ceil(run / 1.42);
        for (let stoneIndex = 0; stoneIndex < stonesPerCourse; stoneIndex++) {
          const stagger = row % 2 ? .68 : 0;
          const localZ = -run / 2 + .71 + stoneIndex * 1.42 + stagger;
          if (Math.abs(localZ) > run / 2 + .45) continue;
          const widthJitter = .96 + ((section * 7 + row * 3 + stoneIndex + seed) % 4) * .045;
          addReliefStone([wallX - side * (thickness / 2 + .025), y, z + localZ],
            [.09, .66, 1.3 * widthJitter], ((row + stoneIndex) % 2 ? 1 : -1) * .018,
            section + row + stoneIndex + ((section + row + stoneIndex) % 5 === 0 ? 1 : 0));
        }
      }

      // Irregular moss fans and dark water trails gather in mortar seams.
      for (let patch = 0; patch < 5; patch++) {
        const pz = z - run * .38 + ((section * 13 + patch * 17 + seed) % 71) / 70 * run * .76;
        const py = .2 + ((section * 11 + patch * 19 + seed) % 57) / 57 * Math.max(1, height - 1.2);
        const lichen = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), patch % 3 ? moss : mats.moss);
        lichen.position.set(wallX - side * (thickness / 2 + .09), py, pz);
        lichen.scale.set(.075, .2 + (patch % 3) * .1, .3 + (patch % 4) * .13);
        lichen.rotation.y = section * .7 + patch; lichen.castShadow = true; group.add(lichen);
        if (patch % 2 === 0) {
          const stain = new THREE.Mesh(new THREE.BoxGeometry(.025, .58 + patch * .07, .035), darkStone);
          stain.position.set(wallX - side * (thickness / 2 + .065), py - .36, pz + .19); group.add(stain);
        }
      }
      // Stone coping varies in height and catches light above the wet wall face.
      box(group, darkStone, [wallX, height + .13, z], [thickness + .28, .26, run + .12], [0, 0, .018]);

      if (vines && (section + seed) % 2 === 0) {
        const faceX = wallX - side * (thickness / 2 + .12), vineZ = z + (section % 3 - 1) * .65;
        root(group, mats.woodDark, [[faceX, height - .25, vineZ], [faceX - side * .07, height * .66, vineZ + .22],
          [faceX - side * .02, height * .34, vineZ - .18], [faceX, .45, vineZ + .12]], .026);
        for (let leafIndex = 0; leafIndex < 5; leafIndex++) {
          leaf(group, leafIndex % 2 ? mats.leaf : mats.moss,
            faceX - side * .04, height - .8 - leafIndex * (height - 1.4) / 5, vineZ + (leafIndex % 2 ? .2 : -.18), .24, seed + section + leafIndex);
        }
      }
    }
  }

  if (ends) for (const end of [-1, 1]) {
    const wallZ = end * halfDepth;
    for (let section = 0; section < Math.ceil(width / sectionLength); section++) {
      const x = -halfWidth + section * sectionLength + sectionLength / 2;
      const run = Math.min(sectionLength + .08, width - section * sectionLength + .08);
      box(group, stone, [x, height / 2, wallZ], [run, height, thickness]);
      for (let row = 0; row < rows; row++) {
        const count = Math.ceil(run / 1.42);
        for (let stoneIndex = 0; stoneIndex < count; stoneIndex++) {
          const localX = -run / 2 + .7 + stoneIndex * 1.42 + (row % 2) * .45;
          if (Math.abs(localX) > run / 2 + .35) continue;
          addReliefStone([x + localX, .4 + row * .78, wallZ - end * (thickness / 2 + .025)],
            [1.3, .66, .09], ((row + stoneIndex) % 2 ? 1 : -1) * .015,
            section + row + stoneIndex + ((section + row + stoneIndex) % 5 === 0 ? 1 : 0));
        }
      }
      box(group, darkStone, [x, height + .13, wallZ], [run + .12, .26, thickness + .28]);
    }
  }
  relief.count = reliefIndex;
  relief.instanceMatrix.needsUpdate = true;
  if (relief.instanceColor) relief.instanceColor.needsUpdate = true;
  relief.castShadow = true; relief.receiveShadow = true; group.add(relief);
  return { width, depth, height, halfWidth, halfDepth };
}
