import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareQuote, Star } from "lucide-react";
import { corDoNome, iniciais } from "../../utils/formatadores.js";

/** Depoimentos (avaliações nota 5 mais úteis). Cada item: avaliação + quadra. */
export default function HomeDepoimentos({ depoimentos }) {
  return (
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
                  {d.quadra && <Link to={`/avaliacoes/${d.quadraId}`}>jogou na {d.quadra.nome}</Link>}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
