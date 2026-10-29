import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function box(group, mat, pos, size, rot = [0, 0, 0], bevel = 0) {
  let geometry;
  if (bevel > 0) {
    const radius = Math.min(bevel, Math.min(...size) * .45);
    geometry = new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius);
  }
  else geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}

export function root(group, mat, points, radius = 0.32) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(18, points.length * 9), radius, 9, false), mat); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
}

export function leaf(group, mat, x, y, z, scale = 1, angle = 0) {
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.quadraticCurveTo(0.8, 0.15, 0.2, 1.65); shape.quadraticCurveTo(-0.55, 0.55, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 8); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: mat.color, side: THREE.DoubleSide, roughness: 0.8 }));
  mesh.position.set(x, y, z); mesh.rotation.set(-0.5, angle, 0.18); mesh.scale.setScalar(scale); mesh.castShadow = true; group.add(mesh); return mesh;
}

export function puddle(group, mat, x, z, sx, sz) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 28), mat); mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, 0.035, z); mesh.scale.set(sx, sz, 1); mesh.receiveShadow = true; group.add(mesh); return mesh;
}

export function reedClump(group, mats, x, z, scale = 1) {
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + x * 3; const h = (0.9 + (i % 3) * 0.25) * scale;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0, z), new THREE.Vector3(x + Math.cos(angle) * .22 * scale, h * .62, z + Math.sin(angle) * .22 * scale), new THREE.Vector3(x + Math.cos(angle) * .42 * scale, h, z + Math.sin(angle) * .42 * scale)]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 7, .035 * scale, 5, false), i % 2 ? mats.leaf : mats.moss));
  }
}

export function tree(group, mats, x, z, scale = 1, alien = false) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.2 * scale, .54 * scale, 4.15 * scale, 12, 6), mats.woodDark);
  trunk.position.set(x, 2.04 * scale, z); trunk.rotation.z = (x % 2 ? .08 : -.12); trunk.castShadow = true; trunk.receiveShadow = true; group.add(trunk);
  for (let j = 0; j < 4; j++) {
    const a = j * Math.PI * 2 / 3 + x;
    root(group, mats.wood, [[x, .12, z], [x + Math.cos(a) * .5 * scale, .32 * scale, z + Math.sin(a) * .5 * scale], [x + Math.cos(a) * 1.55 * scale, .06, z + Math.sin(a) * 1.55 * scale]], .14 * scale);
  }
  const crown = new THREE.Group(); crown.position.set(x, 3.65 * scale, z); group.add(crown);
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, length = (alien ? 2.5 : 2) * scale;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(.025 * scale, .13 * scale, length, 9), mats.wood); branch.position.set(Math.cos(a) * length * .42, .45 * scale + (k % 2) * .3 * scale, Math.sin(a) * length * .42); branch.rotation.z = -Math.cos(a) * .72; branch.rotation.x = Math.sin(a) * .72; branch.castShadow = true; crown.add(branch);
    const leafmesh = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), k % 2 ? mats.leaf : mats.leafLight); leafmesh.scale.set(1.35 * scale, .48 * scale, .9 * scale); leafmesh.position.set(Math.cos(a) * length * .78, .78 * scale + (k % 3) * .1, Math.sin(a) * length * .78); leafmesh.rotation.y = a; leafmesh.castShadow = true; crown.add(leafmesh);
    if (k % 2 === 0) { const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), k % 4 ? mats.leafLight : mats.leaf); leafCluster.scale.set(.9 * scale, .55 * scale, .7 * scale); leafCluster.position.set(Math.cos(a) * length * .58, 1.12 * scale, Math.sin(a) * length * .58); crown.add(leafCluster); }
  }
  if (alien) { const bulb = new THREE.Mesh(new THREE.SphereGeometry(.42 * scale, 16, 12), mats.fungus); bulb.position.set(x, 4.15 * scale, z); group.add(bulb); }
}

export function lamp(group, mats, x, z, height = 3, color = 0xffbd69, intensity = 12) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.045, .08, height, 6), mats.rust); pole.position.set(x, height / 2, z); pole.castShadow = true; group.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), mats.glass); bulb.position.set(x, height - .1, z); group.add(bulb);
  const light = new THREE.PointLight(color, intensity, 8, 2); light.position.set(x, height - .2, z); group.add(light); return light;
}
