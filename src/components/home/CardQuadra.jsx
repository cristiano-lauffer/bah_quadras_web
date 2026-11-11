import { Link } from "react-router-dom";
import { ArrowRight, Clock, Heart, MapPin, Star } from "lucide-react";
import { horariosLivresHoje } from "../../data/quadras.js";
import { formatarNota, formatarPreco, foto, semAvaliacoes, unidadePreco } from "../../utils/formatadores.js";

/** Card de uma quadra na lista da Home. O card inteiro é clicável (link no nome). */
export default function CardQuadra({ quadra: q, favorito, onFavoritar }) {
  return (
    <article className="home-card">
      <div className="home-card-foto">
        {q.imagens[0] && <img {...foto(q.imagens[0], 420)} alt={`${q.nome} - ${q.modalidade}`} loading="lazy" />}
        <span className="home-card-tag">{q.modalidade}</span>
        {q.destaque && <span className="home-card-destaque">★ Destaque</span>}
        <button
          type="button"
          className={`home-card-favorito ${favorito ? "ativo" : ""}`}
          aria-pressed={favorito}
          aria-label={favorito ? `Remover ${q.nome} dos favoritos` : `Favoritar ${q.nome}`}
          onClick={() => onFavoritar(q.id)}
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
            <span>/{unidadePreco(q)}</span>
          </p>
          <span className="home-card-cta">
            Reservar <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
