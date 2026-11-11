import { foto } from "../../utils/formatadores.js";

/**
 * "Qual é o seu esporte?": um card com foto por modalidade.
 * - capas: { [modalidade]: { imagem, total } }
 */
export default function HomeEsportes({ modalidades, capas, modalidadeAtual, onEscolher }) {
  return (
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
              aria-pressed={modalidadeAtual === m}
              onClick={() => onEscolher(m)}
            >
              {capas[m].imagem && <img {...foto(capas[m].imagem, 260)} alt="" loading="lazy" />}
              <span className="home-esporte-texto">
                <strong>{m}</strong>
                <small>
                  {capas[m].total} {capas[m].total === 1 ? "quadra" : "quadras"}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
