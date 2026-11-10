import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Heart,
  LayoutGrid,
  MapPin,
  MessageSquareQuote,
  Search,
  SearchX,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { horariosLivresHoje, modalidades, quadras } from "../data/quadras.js";
import { avaliacoes } from "../data/avaliacoes.js";
import { corDoNome, formatarNota, formatarPreco, iniciais, normalizar, semAvaliacoes } from "../utils/formatadores.js";
import "../css/Home.css";

const ordenacoes = {
  relevancia: { texto: "Relevância", fn: (a, b) => Number(!!b.destaque) - Number(!!a.destaque) },
  avaliacao: { texto: "Melhor avaliadas", fn: (a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0) },
  menorPreco: { texto: "Menor preço", fn: (a, b) => a.preco - b.preco },
};

const passos = [
  { icone: Search, titulo: "Encontre", texto: "Busque por esporte, nome ou bairro e compare preços e avaliações." },
  { icone: CalendarCheck, titulo: "Reserve", texto: "Escolha a data e um horário livre. A confirmação chega na hora." },
  { icone: Trophy, titulo: "Jogue", texto: "Chame a galera e aproveite. A quadra já está garantida." },
];

// Dados derivados (calculados uma vez só)
const avaliadas = quadras.filter((q) => !semAvaliacoes(q));
const totalAvaliacoes = avaliadas.reduce((soma, q) => soma + q.quantidadeAvaliacoes, 0);
const mediaGeral = avaliadas.reduce((soma, q) => soma + q.avaliacao, 0) / avaliadas.length;
const capaPorModalidade = Object.fromEntries(
  modalidades.map((m) => {
    const lista = quadras.filter((q) => q.modalidade === m);
    return [m, { imagem: lista[0].imagens[0], total: lista.length }];
  })
);
const depoimentos = avaliacoes
  .filter((a) => a.nota === 5)
  .sort((a, b) => b.util - a.util)
  .slice(0, 3)
  .map((a) => ({ ...a, quadra: quadras.find((q) => q.id === a.quadraId) }));

function irParaQuadras() {
  document.getElementById("quadras")?.scrollIntoView({ behavior: "smooth" });
}

export default function Home() {
  const [busca, setBusca] = useState("");
  const [modalidade, setModalidade] = useState("todas");
  const [ordem, setOrdem] = useState("relevancia");
  const [favoritos, setFavoritos] = useState(() => new Set());
  const { hash } = useLocation();

  // Faz os links "/#quadras" e "/#sobre" do Header rolarem até a seção.
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  const resultado = useMemo(() => {
    const termo = normalizar(busca);
    return quadras
      .filter((q) => modalidade === "todas" || q.modalidade === modalidade)
      .filter((q) =>
        [q.nome, q.modalidade, q.bairro, q.cidade].some((campo) => normalizar(campo).includes(termo))
      )
      .sort(ordenacoes[ordem].fn);
  }, [busca, modalidade, ordem]);

  function escolherModalidade(m) {
    setModalidade(m);
    irParaQuadras();
  }

  function alternarFavorito(id) {
    setFavoritos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function limparFiltros() {
    setBusca("");
    setModalidade("todas");
    setOrdem("relevancia");
  }

  return (
    <div className="home">
      <Header />

      <main>
        {/* ===== HERO ===== */}
        <section className="home-hero">
          <div className="home-container home-hero-grid">
            <div className="home-hero-texto">
              <span className="home-pill">
                <span className="home-pill-ponto" aria-hidden="true" />
                Horários livres para hoje à noite
              </span>

              <h1>
                Sua próxima partida <em>começa aqui.</em>
              </h1>
              <p>
                Encontre quadras perto de você, compare preços e avaliações e reserve seu horário em
                poucos cliques, sem precisar ligar para ninguém.
              </p>

              <form
                className="home-busca"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  irParaQuadras();
                }}
              >
                <label className="home-busca-campo">
                  <Search size={20} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Quadra ou bairro"
                    aria-label="Buscar por nome da quadra ou bairro"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </label>
                <label className="home-busca-campo home-busca-select">
                  <Trophy size={20} aria-hidden="true" />
                  <select
                    aria-label="Modalidade"
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                  >
                    <option value="todas">Todos os esportes</option>
                    {modalidades.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit">
                  Buscar <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>

              <div className="home-prova">
                <div className="home-prova-avatares" aria-hidden="true">
                  {depoimentos.map((d) => (
                    <span key={d.id} style={{ background: corDoNome(d.nome) }}>
                      {iniciais(d.nome)}
                    </span>
                  ))}
                </div>
                <p>
                  <strong>
                    <Star size={15} aria-hidden="true" /> {formatarNota(mediaGeral)}
                  </strong>{" "}
                  de média em {totalAvaliacoes} avaliações de jogadores
                </p>
              </div>
            </div>

            <div className="home-hero-visual" aria-hidden="true">
              <img className="home-hero-foto-principal" src={quadras[0].imagens[0]} alt="" />
              <img className="home-hero-foto-secundaria" src={quadras[4].imagens[0]} alt="" />

              <div className="home-flutuante home-flutuante-reserva">
                <span className="home-flutuante-icone">
                  <CalendarCheck size={20} />
                </span>
                <div>
                  <strong>Reserva confirmada</strong>
                  <span>Hoje · 19:00 às 20:00</span>
                </div>
              </div>

              <div className="home-flutuante home-flutuante-nota">
                <div className="home-estrelas">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} />
                  ))}
                </div>
                <span>“Melhor society da região!”</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAIXA DE NÚMEROS ===== */}
        <div className="home-container">
          <dl className="home-stats">
            <div>
              <span className="home-stats-icone" aria-hidden="true"><LayoutGrid size={20} /></span>
              <dt>Quadras parceiras</dt>
              <dd>{quadras.length}</dd>
            </div>
            <div>
              <span className="home-stats-icone" aria-hidden="true"><Trophy size={20} /></span>
              <dt>Modalidades</dt>
              <dd>{modalidades.length}</dd>
            </div>
            <div>
              <span className="home-stats-icone" aria-hidden="true"><Star size={20} /></span>
              <dt>Avaliação média</dt>
              <dd>{formatarNota(mediaGeral)}</dd>
            </div>
            <div>
              <span className="home-stats-icone" aria-hidden="true"><Users size={20} /></span>
              <dt>Avaliações</dt>
              <dd>{totalAvaliacoes}</dd>
            </div>
          </dl>
        </div>

        {/* ===== EXPLORE POR ESPORTE ===== */}
        <section className="home-secao home-secao-compacta">
          <div className="home-container">
            <header className="home-secao-topo">
              <div>
                <span className="home-eyebrow">Explore</span>
                <h2>Qual é o seu esporte?</h2>
              </div>
            </header>

            <div className="home-esportes">
              {modalidades.map((m) => (
                <button
                  key={m}
                  type="button"
                  className="home-esporte"
                  aria-pressed={modalidade === m}
                  onClick={() => escolherModalidade(m)}
                >
                  <img src={capaPorModalidade[m].imagem} alt="" loading="lazy" />
                  <span className="home-esporte-texto">
                    <strong>{m}</strong>
                    <small>
                      {capaPorModalidade[m].total}{" "}
                      {capaPorModalidade[m].total === 1 ? "quadra" : "quadras"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== LISTA DE QUADRAS ===== */}
        <section className="home-secao" id="quadras">
          <div className="home-container">
            <header className="home-secao-topo">
              <div>
                <span className="home-eyebrow">Reserve agora</span>
                <h2>Quadras disponíveis</h2>
                <p>
                  {resultado.length}{" "}
                  {resultado.length === 1 ? "quadra encontrada" : "quadras encontradas"}
                  {modalidade !== "todas" && ` em ${modalidade}`}
                </p>
              </div>

              <label className="home-ordenar">
                Ordenar por
                <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                  {Object.entries(ordenacoes).map(([valor, { texto }]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ))}
                </select>
              </label>
            </header>

            <div className="home-chips" role="group" aria-label="Filtrar por modalidade">
              {["todas", ...modalidades].map((m) => (
                <button
                  key={m}
                  type="button"
                  className="home-chip"
                  aria-pressed={modalidade === m}
                  onClick={() => setModalidade(m)}
                >
                  {m === "todas" ? "Todas" : m}
                </button>
              ))}
            </div>

            {resultado.length > 0 ? (
              <ul className="home-grid">
                {resultado.map((q) => {
                  const favorito = favoritos.has(q.id);
                  return (
                    <li key={q.id}>
                      <article className="home-card">
                        <div className="home-card-foto">
                          <img src={q.imagens[0]} alt={`${q.nome} - ${q.modalidade}`} loading="lazy" />
                          <span className="home-card-tag">{q.modalidade}</span>
                          {q.destaque && <span className="home-card-destaque">★ Destaque</span>}
                          <button
                            type="button"
                            className={`home-card-favorito ${favorito ? "ativo" : ""}`}
                            aria-pressed={favorito}
                            aria-label={favorito ? `Remover ${q.nome} dos favoritos` : `Favoritar ${q.nome}`}
                            onClick={() => alternarFavorito(q.id)}
                          >
                            <Heart size={18} />
                          </button>
                        </div>

                        <div className="home-card-corpo">
                          <div className="home-card-linha">
                            <h3>
                              {/* O link cobre o card inteiro (ver .home-card-link::after no CSS) */}
                              <Link to={`/quadra/${q.id}`} className="home-card-link">
                                {q.nome}
                              </Link>
                            </h3>
                            {semAvaliacoes(q) ? (
                              <span className="home-card-nova">Nova</span>
                            ) : (
                              <span className="home-card-nota" aria-label={`Nota ${formatarNota(q.avaliacao)} de 5`}>
                                <Star size={14} aria-hidden="true" />
                                {formatarNota(q.avaliacao)}
                                <small>({q.quantidadeAvaliacoes})</small>
                              </span>
                            )}
                          </div>

                          <p className="home-card-local">
                            <MapPin size={14} aria-hidden="true" />
                            {q.bairro}, {q.cidade}
                          </p>

                          <div className="home-card-horarios">
                            <span>
                              <Clock size={13} aria-hidden="true" /> Livre hoje:
                            </span>
                            {horariosLivresHoje(q).map((h) => (
                              <span key={h} className="home-card-horario">
                                {h}
                              </span>
                            ))}
                          </div>

                          <div className="home-card-rodape">
                            <p className="home-card-preco">
                              <strong>{formatarPreco(q.preco)}</strong>
                              <span>/hora</span>
                            </p>
                            <span className="home-card-cta">
                              Reservar <ArrowRight size={16} aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="home-vazio">
                <SearchX size={40} aria-hidden="true" />
                <h3>Nenhuma quadra encontrada</h3>
                <p>Tente outro termo de busca ou outra modalidade.</p>
                <button type="button" className="home-botao" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ===== COMO FUNCIONA ===== */}
        <section className="home-secao home-secao-clara" id="sobre">
          <div className="home-container">
            <header className="home-secao-topo home-secao-topo-centro">
              <div>
                <span className="home-eyebrow">Como funciona</span>
                <h2>Do sofá para a quadra em 3 passos</h2>
                <p>Sem ligação, sem planilha, sem grupo de WhatsApp perdido.</p>
              </div>
            </header>

            <ol className="home-passos">
              {passos.map(({ icone: Icone, titulo, texto }, i) => (
                <li key={titulo} className="home-passo">
                  <span className="home-passo-icone" aria-hidden="true">
                    <Icone size={26} />
                    <span className="home-passo-numero">{i + 1}</span>
                  </span>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== DEPOIMENTOS ===== */}
        <section className="home-secao">
          <div className="home-container">
            <header className="home-secao-topo">
              <div>
                <span className="home-eyebrow">Quem joga, recomenda</span>
                <h2>O que dizem os jogadores</h2>
              </div>
              <Link to="/avaliacoes" className="home-link">
                Ver todas as avaliações <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>

            <ul className="home-depoimentos">
              {depoimentos.map((d) => (
                <li key={d.id} className="home-depoimento">
                  <MessageSquareQuote className="home-depoimento-aspas" size={32} aria-hidden="true" />
                  <div className="home-estrelas" aria-label={`${d.nota} de 5 estrelas`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={15} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>{d.texto}</blockquote>
                  <footer>
                    <span className="home-depoimento-avatar" style={{ background: corDoNome(d.nome) }} aria-hidden="true">
                      {iniciais(d.nome)}
                    </span>
                    <span>
                      <strong>{d.nome}</strong>
                      <Link to={`/avaliacoes/${d.quadraId}`}>jogou na {d.quadra.nome}</Link>
                    </span>
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== CTA EMPRESAS ===== */}
        <section className="home-secao home-secao-sem-topo">
          <div className="home-container">
            <div className="home-cta">
              <div className="home-cta-texto">
                <span className="home-eyebrow">Para donos de quadra</span>
                <h2>Sua quadra cheia, sua agenda organizada.</h2>
                <p>
                  Divulgue seu espaço para jogadores da região, receba reservas online e acompanhe
                  tudo em um só painel.
                </p>
                <Link to="/cadastro/empresa" className="home-botao home-botao-claro">
                  Falar com a equipe <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <img src={quadras[3].imagens[0]} alt="" className="home-cta-imagem" loading="lazy" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
