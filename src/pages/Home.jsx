import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const quadras = [
  {
    nome: "Arena Sport",
    tipo: "Futebol society",
    preco: "R$ 80,00/h",
    nota: "4,8",
    classe: "field-one",
  },
  {
    nome: "Quadra Center",
    tipo: "Futsal",
    preco: "R$ 70,00/h",
    nota: "4,6",
    classe: "field-two",
  },
  {
    nome: "Play Sports",
    tipo: "Vôlei de areia",
    preco: "R$ 60,00/h",
    nota: "4,7",
    classe: "field-three",
  },
  {
    nome: "Arena Basketball",
    tipo: "Basquete",
    preco: "R$ 75,00/h",
    nota: "4,9",
    classe: "field-four",
  },
  {
    nome: "Beach Arena",
    tipo: "Beach Tennis",
    preco: "R$ 65,00/h",
    nota: "4,8",
    classe: "field-five",
  },
  {
    nome: "Gol de Ouro",
    tipo: "Futebol society",
    preco: "R$ 90,00/h",
    nota: "4,5",
    classe: "field-six",
  },
];

export default function Home() {
  return (
    <div className="public-page">
      <Header />
      <main>
        <section className="home-hero">
          <div className="hero-content">
            <span className="eyebrow hero-eyebrow">BEM-VINDO AO BAH QUADRAS</span>
            <h1>Encontre a quadra ideal para você!</h1>
            <p>Descubra espaços esportivos, consulte opções e organize sua próxima partida. Tudo em um só lugar.</p>
            <Link to="/login" className="btn btn-white">Ver quadras <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hero-ball" aria-hidden="true">⚽</div>
        </section>

        <section className="section-wrap" id="sobre">
          <div className="section-heading">
            <h2>O que você encontra aqui?</h2>
            <p className="muted">Tudo o que você precisa para organizar suas partidas esportivas.</p>
          </div>
          <div className="features-grid">
            <article className="feature-card"><div className="feature-icon">⚽</div><h3>Encontre quadras</h3><p>Explore quadras esportivas e encontre um espaço para jogar.</p></article>
            <article className="feature-card"><div className="feature-icon">▦</div><h3>Faça reservas</h3><p>Organize suas partidas e consulte horários disponíveis.</p></article>
            <article className="feature-card"><div className="feature-icon">▤</div><h3>Cadastre sua empresa</h3><p>Divulgue suas quadras e gerencie seu espaço esportivo.</p><Link to="/cadastro/empresa" className="inline-link">Cadastrar empresa →</Link></article>
          </div>
        </section>

        <section className="section-wrap courts-section" id="quadras">
          <div className="section-title-row">
            <div><h2>Quadras em destaque</h2><p className="muted">Exemplos de espaços esportivos.</p></div>
            <Link to="/login" className="inline-link">Ver todas →</Link>
          </div>
          <div className="court-grid">
            {quadras.map((quadra) => (
              <article className="court-card" key={quadra.nome}>
                <div className={`court-image ${quadra.classe}`}><span>Quadra esportiva</span></div>
                <div className="court-info">
                  <span className="muted tiny">{quadra.tipo}</span>
                  <h3>{quadra.nome}</h3>
                  <div className="court-meta"><span>★ {quadra.nota}</span><strong>{quadra.preco}</strong></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
