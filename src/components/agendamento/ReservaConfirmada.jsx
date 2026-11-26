import { Link } from "react-router-dom";
import { CalendarCheck, CalendarPlus, CircleCheck, Download, Info, MessageCircle } from "lucide-react";
import { HORAS_PRAZO_CANCELAMENTO, fimDaReserva } from "../../services/reservasService.js";
import { descreverDuracao, formatarData, formatarPreco } from "../../utils/formatadores.js";
import { baixarIcs, eventoDaReserva, linkGoogleAgenda, linkWhatsAppEmpresa, mensagemParaEmpresa } from "../../utils/agenda.js";

/** Tela de reserva confirmada: recibo, adicionar à agenda e falar com a empresa no WhatsApp. */
export default function ReservaConfirmada({ quadra, reserva }) {
  // WhatsApp da empresa (perfil) para combinar o pagamento, com a reserva já escrita na mensagem.
  const linkEmpresa = linkWhatsAppEmpresa(
    reserva.contatoEmpresa ?? quadra.empresa?.whatsapp ?? quadra.empresa?.telefone,
    mensagemParaEmpresa({ ...reserva, quadra: quadra.nome })
  );
  return (
    <section className="ag-sucesso">
      <span className="ag-sucesso-icone" aria-hidden="true">
        <CircleCheck size={44} />
      </span>
      <h1>Horário reservado!</h1>
      <p>
        O horário está guardado para você. Agora combine o pagamento com a empresa pelo WhatsApp: quando ela confirmar,
        a reserva aparece como "Confirmada" em Minhas reservas.
      </p>

      <dl className="ag-recibo">
        <div><dt>Quadra</dt><dd>{quadra.nome}</dd></div>
        <div><dt>Data</dt><dd>{formatarData(reserva.data, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
        <div><dt>Horário</dt><dd>{reserva.hora} às {fimDaReserva(reserva)}{reserva.baterias ? ` · ${descreverDuracao(reserva)}` : ""}</dd></div>
        <div><dt>Pagamento</dt><dd>{reserva.pagamento} · combinar pelo WhatsApp</dd></div>
        <div><dt>Situação</dt><dd>Aguardando pagamento</dd></div>
        <div className="ag-recibo-total"><dt>Total</dt><dd>{formatarPreco(reserva.valor, 2)}</dd></div>
      </dl>

      <p className="ag-nota">
        <Info size={15} aria-hidden="true" /> Cancelamento e remarcação
        pelo site até {HORAS_PRAZO_CANCELAMENTO}h antes, em Minhas reservas.
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
        {linkEmpresa ? (
          <a className="ag-botao ag-botao-whatsapp" href={linkEmpresa} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" /> Falar com a empresa no WhatsApp
          </a>
        ) : (
          <p className="ag-nota">A empresa ainda não informou um WhatsApp. Procure o contato dela na página da quadra.</p>
        )}
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
