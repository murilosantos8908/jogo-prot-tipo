"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildRuins } from "../scenes/scene1/RuinsEnvironment";
import { buildHome } from "../scenes/scene2/HomeEnvironment";
import { buildDinner } from "../scenes/scene3/DinnerEnvironment";
import { buildCollapse } from "../scenes/scene4/CollapseEnvironment";
import { buildRoad } from "../scenes/scene5/RoadEnvironment";
import { makeMaterials } from "../three/materials";
import { box, leaf, root, tree } from "../three/forms";
import { addClothLine, addCrateStack, addForestBoundary, addForestFloorPatch, addMushroomCluster, addWaterEdgePlants, buildForestMarketStall } from "../three/forestKit";

const lines = {
  ruins: ["O pano ocre está seco. O nó foi feito duas vezes.", "Um jarro de tampa remendada. A tábua cede com o ombro.", "A copa do Bulbo da Vida mal aparece acima do beco."],
  market: ["Tia Orsa: “Te conheço dos furtos pequenos. Prove que posso confiar.”", "Seu Tobias: “Minha rotina é consertar os lampiões antes do escuro.”", "Vesga: “Três pães e um pote. Está tudo aqui no meu caderno.”", "Dona Cipó: “Raízes frescas. O pano? Parece coisa de família.”", "Pirlim: “Ajude com os caixotes e mostro um atalho até a Travessa.”", "Rufino: “O deck fecha quando termino minha ronda.”", "No quadro, números de casas. Caixotes levam selos do distrito alto."],
  home: ["O lampião ainda arde. A panela está morna; a comida, fria.", "Há quatro lugares à mesa e silêncio em todos eles.", "As marcas no batente estão cobertas de musgo. Limpe para ler."],
  dinner: ["Uma lembrança: um jantar simples, vozes próximas, quatro pratos."],
  collapse: ["A lembrança volta: a mãe desabou junto à pia. Estava cansada."],
  road: ["A chuva escorre pelos números de piche. As janelas se apagam.", "Mirta corre do beco e segura seu braço.", "“Estão contando as casas. Tua mãe passou por mim cedo, foi pela estrada. Leva isso. Se perguntarem, não me viu.”", "O xale ocre tem o mesmo nó duplo. A clareira fica adiante."]
};

function buildMarket() {
  const group = new THREE.Group(), mats = makeMaterials();
  group.fog = new THREE.FogExp2(0x31443a, .018);
  addForestBoundary(group, mats, { width: 42, depth: 52, sideSpacing: 3.2, endSpacing: 3.1, inset: 1.2, seed: 711, vines: true });
  // The canal market sits in a forest clearing, with the tree line enclosing the skyline.
  for (let side of [-1, 1]) for (let i = 0; i < 11; i++) {
    const z = -22 + i * 4.2, x = side * (16 + (i % 3) * 1.8);
    tree(group, mats, x, z, 1.7 + (i % 4) * .16, i % 4 === 0);
    if (i % 3 === 0) tree(group, mats, x + side * 3.1, z + 1.5, 1.2 + (i % 3) * .14, false);
    if (i % 2 === 0) {
      root(group, mats.woodDark, [[x, 5.6, z], [side * 12, 6.1, z - 1], [side * 7.5, 5.7, z - 2]], .15);
      for (let j = 0; j < 4; j++) leaf(group, j % 2 ? mats.leaf : mats.leafLight, side * (7.5 + j * 1.1), 5.2 + (j % 2) * .35, z - 1.6, .55, j * 1.5);
    }
  }
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(30, 32), mats.wood); deck.rotation.x = -Math.PI / 2; deck.position.y = -.08; group.add(deck);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mats.water); water.rotation.x = -Math.PI / 2; water.position.set(0, -.62, 0); group.add(water);
  for (let i = -14; i <= 14; i += .95) box(group, i % 3 ? mats.wood : mats.woodEdge, [i, -.02, 0], [.9, .12, 31]);
  for (let z of [-14, -7, 0, 7, 14]) {
    box(group, mats.woodDark, [0, -.005, z], [30, .15, .22]);
    for (let x of [-13, -7, 7, 13]) box(group, mats.woodDark, [x, -.32, z], [.18, .72, .18]);
  }
  for (let side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const z = -12 + i * 6, x = side * (8.25 + (i % 2) * .35);
    buildForestMarketStall(group, mats, { x, z, width: 4.2, depth: 3.7, deckY: -.08, style: (i + (side > 0 ? 1 : 0)) % 3, seed: 40 + i * 13 + side, produce: true });
    // The bridge rests on beams that continue below the planks into the canal.
    for (let dx of [-1.8, 1.8]) for (let dz of [-1.45, 1.45]) box(group, mats.woodDark, [x + dx, -.32, z + dz], [.16, .72, .16]);
  }
  for (let z of [-8, 8]) { for (let x of [-4.8, 4.8]) box(group, mats.woodDark, [x, .04, z], [.18, .24, 6]); box(group, mats.woodEdge, [0, .08, z], [10, .2, 1.5]); }
  for (let x of [-13, -6, 1, 8, 14]) {
    const light = new THREE.PointLight(0xffa52e, 5.5, 8); light.position.set(x, 3.75, -2); group.add(light);
    box(group, mats.woodDark, [x, 2.05, -2], [.075, 3.8, .075]);
  }
  for (let side of [-1, 1]) {
    addClothLine(group, mats, [side * 13.5, 5.2, -11], [side * 13.5, 4.4, 11], 7, side + 22);
    addWaterEdgePlants(group, mats, side * 14.2, 0, 20, 4.2, side + 58);
    for (let i = 0; i < 5; i++) {
      addForestFloorPatch(group, mats, side * (15 + (i % 2) * 2), -12 + i * 6, 1.8, i + side * 19);
      if (i % 2 === 0) addMushroomCluster(group, mats, side * 14.8, -10 + i * 6, 7, .55, i + 70);
    }
  }
  // Deckside planters, reeds, vines and roots add growth while keeping the central route open.
  for (let side of [-1, 1]) for (let i = 0; i < 8; i++) {
    const x = side * (13.3 + (i % 2) * .45), z = -13 + i * 3.7;
    box(group, mats.woodDark, [x, .19, z], [1.1, .55, 1.05]);
    const plants = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .055, .55 + (j % 2) * .25, 5), mats.moss);
      stem.position.set(Math.cos(j * 1.57) * .28, .48, Math.sin(j * 1.57) * .28); stem.rotation.z = Math.cos(j * 1.57) * -.2; plants.add(stem);
      const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(.3, 7, 5), j % 2 ? mats.leaf : mats.leafLight); leafMesh.scale.set(.45, 1.2, .35); leafMesh.position.set(stem.position.x * 1.5, .82 + (j % 2) * .15, stem.position.z * 1.5); plants.add(leafMesh);
    }
    plants.position.set(x, -.07, z); group.add(plants);
  }
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    addCrateStack(group, mats, side * 5.2, -12 + i * 4.2, 2 + (i % 3), -.08, i + 3);
  }
  const amb = new THREE.HemisphereLight(0xc0d4aa, 0x3e3d2c, 1.8); group.add(amb);
  const sun = new THREE.DirectionalLight(0xffe3b0, 2.0); sun.position.set(-8, 16, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); group.add(sun);
  const rain = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({color:0xa5bcb2,size:.035,transparent:true,opacity:.3})); group.add(rain);
  return {group, camera:{position:[0,2,7],target:[0,1,0]}, spawn:[0,0,12]};
}
const builders = { ruins: buildRuins, market: buildMarket, home: buildHome, dinner: buildDinner, collapse: buildCollapse, road: () => buildRoad(false), metamorphosis: (awakened) => buildRoad(awakened) };
const targets = {
  ruins: [[-1,0,14,"Pano ocre","O pano seco tem um nó duplo. Parece ter sido amarrado com cuidado."],[1,0,12,"Jarro","A tampa foi remendada mais de uma vez."],[0,0,-9,"Passagem","A tábua bloqueia a saída. Empurre com E."],[0,0,-16,"Bulbo da Vida","A copa aparece por entre as estruturas do beco."]],
  market: [[-8,0,11,"Tia Orsa","Te reconheço dos pequenos furtos. Se ajudar a organizar a banca, confio em você."],[8,0,6,"Seu Tobias","Conserto lampiões ao entardecer. Ouvi que a mãe de alguém andava cansada."],[0,0,2,"Vesga","Tenho uma dívida anotada: três pães e um pote. O pano ocre? Uma família daqui o procura."],[9,0,-5,"Dona Cipó","Raízes para o caldo. Esse pano pertence a uma família dos Baixios."],[-9,0,-5,"Pirlim","Me ajude a mover esses caixotes e te mostro a passagem até a Travessa dos Panos."],[0,0,-10,"Rufino","Minha ronda cobre as duas pontes. Há números no quadro e selos do distrito alto nos caixotes."],[0,0,-2,"Quadro de avisos","Números de casas riscados em sequência. Os caixotes têm selos do distrito alto."]],
  home: [[-5,0,2.6,"Batente","Limpe o musgo para revelar as marcas de altura."]], dinner: [[0,0,0,"Lembrança","Um jantar simples em família. Quatro pessoas à mesa."]], collapse: [[-2,0,-1,"Lembrança","Sua mãe caiu junto à pia. Estava cansada há muito tempo."]], road: [[0,0,12,"Marca de piche","Um número recém-pintado escorre sob a chuva."],[1,0,5,"Mirta","Estão contando as casas. Tua mãe passou por mim cedo, foi pela estrada. Leva isso. Se perguntarem, não me viu."],[0,0,-8,"Caminho","As marcas conduzem à clareira, ao Bulbo e às torres."]]
};

export default function SceneViewer({ sceneId, awakened, onTravel }) {
  const hostRef=useRef(null), hintRef=useRef(null), [message,setMessage]=useState(""), [choices,setChoices]=useState(null), [hint,setHint]=useState("WASD ANDAR · MOUSE OLHAR · E INTERAGIR");
  useEffect(()=>{
    const host=hostRef.current; if(!host)return;
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"}); renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.18; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; host.appendChild(renderer.domElement);
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x26352d); const camera=new THREE.PerspectiveCamera(56,1,.1,150);
    const current=builders[sceneId](awakened); scene.add(current.group); scene.fog=current.group.fog||null;
    const player=new THREE.Group(); const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32, .55, 8, 16),new THREE.MeshStandardMaterial({color:0x343c34,roughness:1})); body.position.y=.6; body.castShadow=true; player.add(body); player.position.set(...(current.spawn||[0,0,0])); scene.add(player);
    let exitOpen=false; const exitBarrier=current.group.getObjectByName("alley_exit_barrier");
    const solids=sceneId==="home"||sceneId==="dinner"||sceneId==="collapse"?[[0,.25,0,1.8,1.25],[ -2.5,-1.8,1.55,.55],[-4.65,-1.8,.6,.5],[4.85,.4,.9,.75]]:sceneId==="market"?[-12,-6,0,6,12].flatMap((z,i)=>[[-(8+(i%2)*1.1),z,2.1,1.9],[8+(i%2)*1.1,z,2.1,1.9]]):[];
    let yaw=sceneId==="home"?0:0,pitch=.12,drag=false,lastX=0,lastY=0; const keys={};
    const down=e=>{keys[e.code]=true;if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();if(e.code==="KeyE")interact();}; const up=e=>keys[e.code]=false;
    function interact(){const list=targets[sceneId]||[];let near=null,dist=3.3; for(const t of list){const d=Math.hypot(player.position.x-t[0],player.position.z-t[2]);if(d<dist){dist=d;near=t;}} if(near){if(sceneId==="road"&&near[3]==="Mirta"&&time<20){setMessage("A chuva engrossa. As luzes das janelas começam a se apagar.");return;}setMessage(`${near[3]} — ${near[4]}`);if(sceneId==="market"&&near[3]==="Tia Orsa")setChoices({who:"orsa",options:["Ajudar a organizar a banca","Dizer que está com pressa"]});if(sceneId==="market"&&near[3]==="Pirlim")setChoices({who:"pirlim",options:["Ajudar com os caixotes","Perguntar pelo atalho"]});if(sceneId==="market"&&near[3]==="Vesga")setChoices({who:"vesga",options:["Perguntar sobre a dívida","Perguntar sobre o pano"]});if(sceneId==="home"&&near[3]==="Batente")setMessage("As marcas de altura dizem: KAEL.");if(sceneId==="ruins"&&near[3]==="Passagem"){exitOpen=true;if(exitBarrier){exitBarrier.position.z=-10.8;exitBarrier.rotation.z=-.5;}setMessage("Você empurra a tábua para o lado. A passagem estreita até a feira está aberta.");}if(sceneId==="road"&&near[3]==="Mirta")setMessage("Mirta: “Estão contando as casas. Tua mãe passou por mim cedo, foi pela estrada. Leva isso. Se perguntarem, não me viu.” O xale ocre tem o mesmo nó duplo.");}else setMessage("Nada ao alcance. Explore o caminho.");}
    const pd=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}; const pm=e=>{if(!drag)return;yaw-=(e.clientX-lastX)*.004;pitch=Math.max(-.05,Math.min(.42,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY;}; const pu=()=>drag=false;
    window.addEventListener("keydown",down);window.addEventListener("keyup",up);renderer.domElement.addEventListener("pointerdown",pd);renderer.domElement.addEventListener("pointermove",pm);renderer.domElement.addEventListener("pointerup",pu);
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(host);resize();let prev=performance.now(),time=0;
    const animate=now=>{const dt=Math.min((now-prev)/1000,.05);prev=now;time+=dt;let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);const len=Math.hypot(f,s)||1; f/=len;s/=len;const speed=1.1;
      const bound=sceneId==="home"?5.55:sceneId==="market"?14:sceneId==="road"?7:sceneId==="ruins"?2.15:9;let nx=THREE.MathUtils.clamp(player.position.x+(Math.sin(yaw)*f+Math.cos(yaw)*s)*speed*dt,-bound,bound),nz=THREE.MathUtils.clamp(player.position.z+(-Math.cos(yaw)*f+Math.sin(yaw)*s)*speed*dt,-22,sceneId==="home"?4.15:22);if(!solids.some(([x,z,rx,rz])=>Math.abs(nx-x)<rx+.32&&Math.abs(player.position.z-z)<rz+.32))player.position.x=nx;const blockedByBoard=sceneId==="ruins"&&!exitOpen&&Math.abs(nz+9)<.55&&Math.abs(nx)<2.25;if(!blockedByBoard&&!solids.some(([x,z,rx,rz])=>Math.abs(player.position.x-x)<rx+.32&&Math.abs(nz-z)<rz+.32))player.position.z=nz;
      current.update?.(time,dt);player.rotation.y=yaw;const target=new THREE.Vector3(player.position.x,player.position.y+1.15,player.position.z);const desired=target.clone().add(new THREE.Vector3(Math.sin(yaw)*4.3,2.1+pitch*2,Math.cos(yaw)*4.3));camera.position.lerp(desired,1-Math.exp(-dt*5));camera.lookAt(target);
      const near=(targets[sceneId]||[]).some(t=>Math.hypot(player.position.x-t[0],player.position.z-t[2])<3.3);const nextHint=near?"E INTERAGIR · WASD ANDAR · ARRASTE PARA OLHAR":"WASD ANDAR · MOUSE OLHAR · E INTERAGIR";if(hintRef.current!==nextHint){hintRef.current=nextHint;setHint(nextHint);}renderer.render(scene,camera);frame=requestAnimationFrame(animate);};let frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);renderer.domElement.removeEventListener("pointerdown",pd);renderer.domElement.removeEventListener("pointermove",pm);renderer.domElement.removeEventListener("pointerup",pu);scene.remove(current.group);const materials=new Set(),textures=new Set();current.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))materials.add(m);});for(const material of materials){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose();}for(const texture of textures)texture.dispose();body.geometry.dispose();body.material.dispose();renderer.dispose();renderer.domElement.remove();};
  },[sceneId,awakened]);
  function choose(option){if(choices?.who==="orsa"&&option.startsWith("Ajudar")){sessionStorage.setItem("orsaTrust","1");setMessage("Tia Orsa: “Está bem. A passagem fica aberta. A Travessa dos Panos é por ali.”");}else if(choices?.who==="pirlim"&&option.startsWith("Ajudar")){sessionStorage.setItem("pirlimRoute","1");setMessage("Pirlim abre o caminho entre os caixotes: “A Travessa fica logo depois.”");}else if(choices?.who==="vesga"){setMessage(option.includes("dívida")?"Vesga abre o caderno: três pães e um pote. O pano pertence a uma família dos Baixios.":"Vesga confirma: o pano ocre pertence a uma família dos Baixios.");}else setMessage("A confiança de Orsa não mudou.");setChoices(null);}
  return <div className="viewer" ref={hostRef} aria-label={`Jogo 3D: ${sceneId}`}><span className="viewer-hint">{hint}</span>{message&&<div className="game-dialog" role="status"><button onClick={()=>setMessage("")} aria-label="Fechar diálogo">×</button>{message}{choices&&<div className="dialog-options">{choices.options.map(option=><button key={option} onClick={()=>choose(option)}>{option}</button>)}</div>}{sceneId==="ruins"&&message.includes("feira")&&<button className="travel-option" onClick={()=>onTravel?.("market")}>Seguir para a Passarela →</button>}{sceneId==="market"&&message.includes("Travessa")&&<button className="travel-option" onClick={()=>onTravel?.("home")}>Seguir para a Travessa →</button>}{sceneId==="home"&&message.includes("KAEL")&&<button className="travel-option" onClick={()=>onTravel?.("road")}>Sair para a rua →</button>}</div>}</div>;
}
