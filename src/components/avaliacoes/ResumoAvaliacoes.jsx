import { MessageSquarePlus, Star } from "lucide-react";
import Estrelas from "./Estrelas.jsx";
import { formatarNota } from "../../utils/formatadores.js";

/**
 * Painel lateral da página de Avaliações: nota média, barras por nota (filtram a lista),
 * aspectos mais elogiados (também filtram) e chamada para avaliar.
 */
export default function ResumoAvaliacoes({ total, media, porNota, aspectosContagem, filtroNota, filtroAspecto, onFiltroNota, onFiltroAspecto, onAvaliar }) {
  return (
    <aside className="av-resumo">
      <div className="av-resumo-nota">
        <strong>{total ? formatarNota(media) : "–"}</strong>
        <div>
          <Estrelas valor={media} tamanho={20} />
          <span>
            {total} {total === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
      </div>
    
      <div className="av-barras" role="group" aria-label="Filtrar por nota">
        {porNota.map(({ nota, qtd }) => (
          <button
            key={nota}
            type="button"
            className="av-barra"
            aria-pressed={filtroNota === nota}
            disabled={!qtd}
            onClick={() => onFiltroNota(nota)}
          >
            <span className="av-barra-rotulo">
              {nota} <Star size={12} aria-hidden="true" />
            </span>
            <span className="av-barra-trilho">
              <span style={{ width: `${total ? (qtd / total) * 100 : 0}%` }} />
            </span>
            <span className="av-barra-qtd">{qtd}</span>
          </button>
        ))}
      </div>
    
      {aspectosContagem.length > 0 && (
        <div className="av-aspectos">
          <h2>Mais elogiado</h2>
          <div className="av-aspectos-lista">
            {aspectosContagem.map(({ asp, qtd }) => (
              <button
                key={asp}
                type="button"
                className="av-aspecto"
                aria-pressed={filtroAspecto === asp}
                onClick={() => onFiltroAspecto(asp)}
              >
                {asp} <small>{qtd}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    
      <div className="av-resumo-cta">
        <MessageSquarePlus size={22} aria-hidden="true" />
        <div>
          <strong>Jogou aqui?</strong>
          <p>Sua opinião ajuda outros jogadores a escolher.</p>
        </div>
        <button type="button" className="av-botao av-botao-contorno" onClick={onAvaliar}>
          Avaliar
        </button>
      </div>
    </aside>
  );
}
