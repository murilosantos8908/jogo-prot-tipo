"use client";

import { useState } from "react";
import SceneViewer from "../components/SceneViewer";

const scenes = [
  { id: "ruins", number: "01", title: "O Beco", note: "Despertar · saída alagada" },
  { id: "market", number: "02", title: "A Feira dos Baixios", note: "Barracas · gente e viela �mida" },
  { id: "parkour", number: "03", title: "Fuga pelos Telhados", note: "Parkour · escape dos vendedores" },
  { id: "home", number: "04", title: "A Casa", note: "Interior · cozinha e descanso" },
  { id: "dinner", number: "05", title: "A Lembrança", note: "A mesma casa · mesa posta" },
  { id: "collapse", number: "06", title: "O Colapso", note: "A mesma casa · cozinha" },
  { id: "road", number: "07", title: "A Estrada sob a Chuva", note: "Números · caminho à clareira" },
  { id: "metamorphosis", number: "08", title: "A Clareira", note: "O Bulbo e as torres" }
];

export default function Page() {
  const [active, setActive] = useState("ruins");
  const [awakened, setAwakened] = useState(false);
  const scene = scenes.find((item) => item.id === active);

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="O Coração de Sangue, início"><span className="brand-mark">✳</span><span><b>O CORAÇÃO DE SANGUE</b><small>ATLAS DO PRÓLOGO</small></span></a>
      <div className="top-meta"><span className="live-dot"/> VISUALIZADOR DE AMBIENTES <i>·</i> BUILD 01</div>
    </header>

    <section className="intro" id="inicio">
      <div><p className="eyebrow">BREJO-MUNDO / PRÓLOGO JOGÁVEL</p><h1>Um mundo que <em>respira</em> sob a névoa.</h1>
        <p className="lede">Explore os Baixios. Observe, converse e siga as pistas. Use WASD para andar, mouse para olhar e E para interagir.</p></div>
      <div className="world-stamp"><span>LOCALIZAÇÃO</span><b>OS BAIXIOS</b><small>PLANETA BREJO-MUNDO</small></div>
    </section>

    <nav className="scene-nav" aria-label="Selecionar cenário">
      {scenes.map((item) => <button key={item.id} className={active === item.id ? "scene-tab selected" : "scene-tab"} onClick={() => setActive(item.id)} aria-pressed={active === item.id}>
        <span className="tab-number">{item.number}</span><span className="tab-copy"><b>{item.title}</b><small>{item.note}</small></span><span className="tab-arrow">↗</span>
      </button>)}
    </nav>

    <section className="stage-wrap">
      <div className="stage-heading"><div><span className="eyebrow">CENA {scene.number} / 08</span><h2>{scene.title}</h2></div>
        {active === "metamorphosis" ? <button className="state-toggle" onClick={() => setAwakened((value) => !value)}><span className={awakened ? "toggle-light on" : "toggle-light"}/>{awakened ? "MANIFESTAÇÃO" : "ANTES DO FRAGMENTO"}</button> : <span className="inspect-label">↔ ARRASTE PARA INSPECIONAR</span>}
      </div>
      <SceneViewer sceneId={active} awakened={awakened} onTravel={setActive}/>
      <div className="stage-caption"><span><i className="caption-dot"/> {active === "metamorphosis" && awakened ? "LUZ AMBIENTAL · RUBRO" : "AMBIENTE · INSPEÇÃO LIVRE"}</span><span>WEBGL / THREE.JS <i>·</i> 3D</span></div>
    </section>
    <footer className="footer"><span>O CORAÇÃO DE SANGUE <i>—</i> DESENVOLVIMENTO DE AMBIENTES</span><span>BREJO-MUNDO <b>●</b> 08 CENÁRIOS</span></footer>
  </main>;
}
