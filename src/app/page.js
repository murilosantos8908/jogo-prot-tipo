"use client";

import { useState } from "react";
import SceneViewer from "../components/SceneViewer";

const scenes = [
  { id: "ruins", number: "01", title: "Escombros", note: "Os Baixios · rua alagada" },
  { id: "home", number: "02", title: "A casa de Kael", note: "Interior · entrada e cozinha" },
  { id: "dinner", number: "03", title: "A mesa de jantar", note: "A mesma casa · mesa em foco" },
  { id: "collapse", number: "04", title: "O colapso", note: "A mesma casa · pia e descanso" },
  { id: "road", number: "05", title: "A estrada e o fragmento", note: "Floresta pantanosa · noite" },
  { id: "metamorphosis", number: "06", title: "A metamorfose", note: "A mesma clareira · estado ambiental" }
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
      <div><p className="eyebrow">BREJO-MUNDO / CADERNO DE CENÁRIOS</p><h1>Um mundo que <em>respira</em> sob a névoa.</h1>
        <p className="lede">Seis recortes do prólogo. Um planeta vivo, construído sobre água escura, madeira reaproveitada e raízes antigas.</p></div>
      <div className="world-stamp"><span>LOCALIZAÇÃO</span><b>OS BAIXIOS</b><small>PLANETA BREJO-MUNDO</small></div>
    </section>

    <nav className="scene-nav" aria-label="Selecionar cenário">
      {scenes.map((item) => <button key={item.id} className={active === item.id ? "scene-tab selected" : "scene-tab"} onClick={() => setActive(item.id)} aria-pressed={active === item.id}>
        <span className="tab-number">{item.number}</span><span className="tab-copy"><b>{item.title}</b><small>{item.note}</small></span><span className="tab-arrow">↗</span>
      </button>)}
    </nav>

    <section className="stage-wrap">
      <div className="stage-heading"><div><span className="eyebrow">CENA {scene.number} / 06</span><h2>{scene.title}</h2></div>
        {active === "metamorphosis" ? <button className="state-toggle" onClick={() => setAwakened((value) => !value)}><span className={awakened ? "toggle-light on" : "toggle-light"}/>{awakened ? "MANIFESTAÇÃO" : "ANTES DO FRAGMENTO"}</button> : <span className="inspect-label">↔ ARRASTE PARA INSPECIONAR</span>}
      </div>
      <SceneViewer sceneId={active} awakened={awakened}/>
      <div className="stage-caption"><span><i className="caption-dot"/> {active === "metamorphosis" && awakened ? "LUZ AMBIENTAL · RUBRO" : "AMBIENTE · INSPEÇÃO LIVRE"}</span><span>WEBGL / THREE.JS <i>·</i> 3D</span></div>
    </section>
    <footer className="footer"><span>O CORAÇÃO DE SANGUE <i>—</i> DESENVOLVIMENTO DE AMBIENTES</span><span>BREJO-MUNDO <b>●</b> 06 CENÁRIOS</span></footer>
  </main>;
}
