import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PaginaAgendamento from "./PaginaAgendamento.jsx";
import { disponiveisParaReserva, quadrasPublicas } from "../../services/catalogoService.js";
import { formatarPreco, foto, unidadePreco } from "../../utils/formatadores.js";

/** /agendamento sem quadra: lista as quadras para escolher. */
export default function EscolherQuadra() {
  return (
    <PaginaAgendamento>
      <header className="ag-cabecalho-simples">
        <h1>Qual quadra você quer reservar?</h1>
        <p>Escolha uma quadra para ver os horários livres.</p>
      </header>
      <ul className="ag-escolher">
        {disponiveisParaReserva(quadrasPublicas()).map((q) => (
          <li key={q.id}>
            <Link to={`/agendamento/${q.id}`} className="ag-escolher-card">
              <img {...foto(q.imagens[0], 150)} alt="" loading="lazy" />
              <span>
                <small>{q.modalidade}</small>
                <strong>{q.nome}</strong>
                <span>{formatarPreco(q.preco)}/{unidadePreco(q)} · {q.bairro}</span>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </PaginaAgendamento>
  );
}
