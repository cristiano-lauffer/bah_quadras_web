import { Link } from "react-router-dom";
import { CalendarCheck, CalendarPlus, CircleCheck, Download, Info, MessageCircle } from "lucide-react";
import { fimDaReserva } from "../../services/reservasService.js";
import { descreverDuracao, formatarData, formatarPreco } from "../../utils/formatadores.js";
import { baixarIcs, eventoDaReserva, linkGoogleAgenda, linkWhatsApp } from "../../utils/agenda.js";

/** Tela de reserva confirmada: recibo, adicionar à agenda e chamar a galera no WhatsApp. */
export default function ReservaConfirmada({ quadra, reserva }) {
  return (
    <section className="ag-sucesso">
      <span className="ag-sucesso-icone" aria-hidden="true">
        <CircleCheck size={44} />
      </span>
      <h1>Reserva confirmada!</h1>
      <p>Te esperamos na quadra. Você encontra esta reserva em Minhas reservas.</p>

      <dl className="ag-recibo">
        <div><dt>Quadra</dt><dd>{quadra.nome}</dd></div>
        <div><dt>Data</dt><dd>{formatarData(reserva.data, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
        <div><dt>Horário</dt><dd>{reserva.hora} às {fimDaReserva(reserva)}{reserva.baterias ? ` · ${descreverDuracao(reserva)}` : ""}</dd></div>
        <div><dt>Pagamento</dt><dd>{reserva.pagamento} no local</dd></div>
        <div className="ag-recibo-total"><dt>Total</dt><dd>{formatarPreco(reserva.valor, 2)}</dd></div>
      </dl>

      <p className="ag-nota">
        <Info size={15} aria-hidden="true" /> Demonstração: a reserva fica salva apenas neste navegador.
      </p>

      {/* ===== Agenda e compartilhar ===== */}
      <div className="ag-extras">
        <p className="ag-extras-titulo">
          <CalendarPlus size={16} aria-hidden="true" /> Adicionar à agenda
        </p>
        <div className="ag-extras-botoes">
          <a
            className="ag-botao ag-botao-contorno"
            href={linkGoogleAgenda(eventoDaReserva(reserva))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Agenda
          </a>
          <button
            type="button"
            className="ag-botao ag-botao-contorno"
            onClick={() => baixarIcs(eventoDaReserva(reserva), `reserva-${quadra.id}-${reserva.data}.ics`)}
          >
            <Download size={16} aria-hidden="true" /> Celular / Outlook (.ics)
          </button>
        </div>
        <a
          className="ag-botao ag-botao-whatsapp"
          href={linkWhatsApp(
            `Bora jogar? Reservei a ${quadra.nome} para ${formatarData(reserva.data, { weekday: "long", day: "numeric", month: "long" })}, das ${reserva.hora} às ${fimDaReserva(reserva)}. 📍 ${quadra.endereco}
${window.location.origin}/quadra/${quadra.id}`
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} aria-hidden="true" /> Chamar a galera no WhatsApp
        </a>
      </div>

      <div className="ag-sucesso-acoes">
        <Link to="/usuario/reservas" className="ag-botao">
          <CalendarCheck size={18} aria-hidden="true" /> Ver minhas reservas
        </Link>
        <Link to="/" className="ag-botao ag-botao-contorno">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
