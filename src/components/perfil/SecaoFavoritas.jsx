import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { quadrasPublicas } from "../../services/catalogoService.js";
import { formatarNota, formatarPreco, foto as fotoTamanho, semAvaliacoes, unidadePreco } from "../../utils/formatadores.js";

export function GradeFavoritas({ lista, onRemover }) {
  return (
    <ul className="pu-favoritas">
      {lista.map((q) => (
        <li key={q.id} className="pu-favorita">
          <img {...fotoTamanho(q.imagens[0], 320)} alt="" loading="lazy" />
          <button
            type="button"
            className="pu-favorita-remover"
            onClick={() => onRemover(q.id)}
            aria-label={`Remover ${q.nome} dos favoritos`}
          >
            <Heart size={17} />
          </button>
          <div className="pu-favorita-corpo">
            <span className="pu-favorita-tag">{q.modalidade}</span>
            <h3>
              <Link to={`/quadra/${q.id}`}>{q.nome}</Link>
            </h3>
            <p>
              <span>
                {semAvaliacoes(q) ? "Nova" : <><Star size={14} aria-hidden="true" /> {formatarNota(q.avaliacao)}</>}
              </span>
              <span>{q.bairro}</span>
              <strong>{formatarPreco(q.preco)}/{unidadePreco(q) === "hora" ? "h" : "bateria"}</strong>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SecaoFavoritas({ favoritos, onRemover }) {
  const lista = quadrasPublicas().filter((q) => favoritos.includes(q.id));

  if (!lista.length) {
    return (
      <div className="pn-vazio">
        <Heart size={40} aria-hidden="true" />
        <h3>Nenhuma quadra favorita</h3>
        <p>Toque no coração das quadras para guardar as suas preferidas aqui.</p>
        <Link to="/#quadras" className="pn-botao">Explorar quadras</Link>
      </div>
    );
  }

  return <GradeFavoritas lista={lista} onRemover={onRemover} />;
}
