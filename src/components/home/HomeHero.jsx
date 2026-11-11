import { ArrowRight, CalendarCheck, Search, Star, Trophy } from "lucide-react";
import { quadras as quadrasFixas } from "../../data/quadras.js";
import { corDoNome, formatarNota, foto, iniciais } from "../../utils/formatadores.js";

/** Topo da Home: título, busca (texto + esporte) e prova social. */
export default function HomeHero({ busca, onBusca, modalidade, onModalidade, modalidades, onBuscar, depoimentos, mediaGeral, totalAvaliacoes }) {
  return (
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
              onBuscar();
            }}
          >
            <label className="home-busca-campo">
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                placeholder="Quadra ou bairro"
                aria-label="Buscar por nome da quadra ou bairro"
                value={busca}
                onChange={(e) => onBusca(e.target.value)}
              />
            </label>
            <label className="home-busca-campo home-busca-select">
              <Trophy size={20} aria-hidden="true" />
              <select aria-label="Modalidade" value={modalidade} onChange={(e) => onModalidade(e.target.value)}>
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
          <img className="home-hero-foto-principal" {...foto(quadrasFixas[0].imagens[0], 600)} alt="" />
          <img className="home-hero-foto-secundaria" {...foto(quadrasFixas[4].imagens[0], 320)} alt="" />

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
  );
}
