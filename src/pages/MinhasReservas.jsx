import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  CalendarDays,
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  MessageCircle,
  Plus,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import Toast from "../components/Toast.jsx";
import { baixarIcs, eventoDaReserva, linkWhatsAppEmpresa, mensagemParaEmpresa } from "../utils/agenda.js";
import { useDados } from "../hooks/useDados.js";
import { carregarMinhasAvaliacoes, jaAvaliou } from "../services/avaliacoesService.js";
import {
  HORAS_PRAZO_CANCELAMENTO,
  cancelarReserva,
  fimDaReserva,
  inicioDaReserva,
  listarReservas,
  podeAlterarSozinho,
  separarReservas,
} from "../services/reservasService.js";
import { descreverDuracao, formatarData, formatarPreco, paraData, tempoRelativo, foto } from "../utils/formatadores.js";
import "../css/MinhasReservas.css";
import Esqueleto from "../components/Esqueleto.jsx";

const statusReserva = {
  confirmada: { texto: "Confirmada", classe: "ok", icone: CircleCheck },
  aguardando: { texto: "Aguardando pagamento", classe: "alerta", icone: Clock },
  concluida: { texto: "Concluída", classe: "info", icone: Trophy },
  cancelada: { texto: "Cancelada", classe: "erro", icone: CircleX },
};


/** Dentro do prazo da política: o jogador combina com a empresa pelo WhatsApp. */
function FalarComEmpresa({ reserva, horasAte }) {
  const link = linkWhatsAppEmpresa(reserva.contatoEmpresa, mensagemParaEmpresa(reserva, "cancelar ou remarcar esta reserva"));
  const titulo = `Faltam menos de ${HORAS_PRAZO_CANCELAMENTO}h para o jogo: para cancelar ou remarcar, fale com a empresa.`;
  if (horasAte <= 0) return null;
  return link ? (
    <a className="pn-botao pn-botao-contorno" href={link} target="_blank" rel="noopener noreferrer" title={titulo}>
      <MessageCircle size={15} aria-hidden="true" /> Falar com a empresa
    </a>
  ) : (
    <span className="mr-prazo" title={titulo}>Para cancelar, fale com {reserva.empresa}</span>
  );
}

export default function MinhasReservas() {
  const { dados, carregando, recarregar } = useDados(listarReservas);
  // Para mostrar "Avaliar quadra" só onde o jogador ainda não avaliou.
  useDados(carregarMinhasAvaliacoes);
  const [aba, setAba] = useState("proximas");
  const [confirmando, setConfirmando] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Aviso vindo de outra página (ex.: "Reserva remarcada para...").
  const [toast, setToast] = useState(location.state?.aviso ?? "");

  function fecharToast() {
    setToast("");
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }

  const { proximas, historico } = separarReservas(dados ?? []);
  const abas = [
    { id: "proximas", texto: "Próximas", lista: proximas },
    { id: "historico", texto: "Histórico", lista: historico },
  ];
  const lista = abas.find((a) => a.id === aba).lista;

  async function cancelar(reserva) {
    setConfirmando(null);
    setCancelando(reserva.id);
    try {
      const { mensagem } = await cancelarReserva(reserva.id);
      setToast(mensagem ?? `Reserva na ${reserva.quadra} cancelada.`);
    } catch (erro) {
      setToast(erro.message);
    } finally {
      setCancelando(null);
      recarregar();
    }
  }

  return (
    <UsuarioLayout
      titulo="Minhas reservas"
      subtitulo="Acompanhe seus jogos marcados e o histórico"
      proximasReservas={proximas.length}
      acoes={
        <Link to="/#quadras" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Nova reserva
        </Link>
      }
    >
      <div className="pn-pilha">
        <div className="mr-abas" role="tablist" aria-label="Tipo de reserva">
          {abas.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              id={`mr-aba-${a.id}`}
              aria-selected={aba === a.id}
              aria-controls="mr-painel"
              className="mr-aba"
              onClick={() => setAba(a.id)}
            >
              {a.texto}
              <span>{a.lista.length}</span>
            </button>
          ))}
        </div>

        <section id="mr-painel" role="tabpanel" aria-labelledby={`mr-aba-${aba}`}>
          {carregando && !dados ? (
            <Esqueleto tipo="cards" quantidade={2} rotulo="Carregando reservas..." />
          ) : lista.length === 0 ? (
            <div className="pn-vazio">
              <CalendarDays size={40} aria-hidden="true" />
              <h3>{aba === "proximas" ? "Nenhum jogo marcado" : "Seu histórico está vazio"}</h3>
              <p>
                {aba === "proximas"
                  ? "Encontre uma quadra e garanta o próximo jogo com a galera."
                  : "Aqui aparecem os jogos que você já fez e as reservas canceladas."}
              </p>
              {aba === "proximas" && (
                <Link to="/#quadras" className="pn-botao">Encontrar quadras</Link>
              )}
            </div>
          ) : (
            <ul className="mr-lista">
              {lista.map((r) => {
                // Reservada mas ainda não paga: "Aguardando pagamento" até a empresa registrar o pagamento
                const status = statusReserva[r.status === "confirmada" && !r.pago ? "aguardando" : r.status];
                const horasAte = (inicioDaReserva(r) - new Date()) / 3_600_000;
                const data = paraData(r.data);

                return (
                  <li key={r.id} className={`mr-card ${r.status}`}>
                    <div className="mr-foto">
                      {r.imagem && <img {...foto(r.imagem, 300)} alt="" loading="lazy" />}
                      <div className="mr-data" aria-hidden="true">
                        <strong>{data.getDate()}</strong>
                        <span>{data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                      </div>
                    </div>

                    <div className="mr-corpo">
                      <div className="mr-topo">
                        <div>
                          <span className="mr-modalidade">{r.modalidade}</span>
                          <h2>{r.quadra}</h2>
                        </div>
                        <span className={`pn-status ${status.classe}`}>
                          <status.icone size={13} aria-hidden="true" />
                          {status.texto}
                        </span>
                      </div>

                      <ul className="mr-info">
                        <li>
                          <CalendarDays size={15} aria-hidden="true" />
                          {formatarData(r.data, { weekday: "long", day: "numeric", month: "long" })}
                          {r.status === "confirmada" && <em> · {tempoRelativo(r.data)}</em>}
                        </li>
                        {r.anterior && r.status === "confirmada" && (
                          <li className="mr-remarcada">
                            <CalendarClock size={15} aria-hidden="true" />
                            Remarcada (antes: {formatarData(r.anterior.data, { day: "2-digit", month: "2-digit" })} às {r.anterior.hora})
                          </li>
                        )}
                        <li>
                          <Clock size={15} aria-hidden="true" /> {r.hora} às {fimDaReserva(r)} ({descreverDuracao(r)})
                        </li>
                        <li>
                          <MapPin size={15} aria-hidden="true" /> {r.endereco}
                        </li>
                        {r.status === "cancelada" && r.reembolso && (
                          <li className={`mr-reembolso ${r.reembolso}`}>
                            {r.reembolso === "pendente"
                              ? "Reembolso pendente: a empresa vai devolver o valor pago."
                              : `Reembolso feito pela empresa: ${formatarPreco(r.valorReembolsado ?? r.valor, 2)}.`}
                          </li>
                        )}
                      </ul>

                      <div className="mr-rodape">
                        <p className="mr-valor">
                          <span>Total</span>
                          <strong>{formatarPreco(r.valor, 2)}</strong>
                        </p>

                        {confirmando === r.id ? (
                          <div className="mr-confirmar" role="alert">
                            <p>
                              {r.pago
                                ? "Cancelar esta reserva? Como ela já está paga, a empresa devolve o valor integral (combine pelo WhatsApp)."
                                : "Cancelar esta reserva? O cancelamento é gratuito."}
                            </p>
                            <div>
                              <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setConfirmando(null)}>
                                Manter
                              </button>
                              <button type="button" className="pn-botao pn-botao-perigo" onClick={() => cancelar(r)}>
                                Cancelar reserva
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mr-acoes">
                            {r.status === "confirmada" && (
                              <>
                                <Link to={`/quadra/${r.quadraId}`} className="pn-botao pn-botao-contorno">
                                  Ver quadra
                                </Link>
                                <button
                                  type="button"
                                  className="pn-botao pn-botao-contorno"
                                  onClick={() => baixarIcs(eventoDaReserva(r), `reserva-${r.quadraId}-${r.data}.ics`)}
                                  title="Baixar evento para o calendário (.ics)"
                                >
                                  <CalendarPlus size={15} aria-hidden="true" /> Agenda
                                </button>
                                {podeAlterarSozinho(r) ? (
                                  <>
                                    <Link
                                      to={`/agendamento/${r.quadraId}?remarcar=${r.id}`}
                                      className="pn-botao pn-botao-contorno"
                                      title="Trocar o dia ou o horário desta reserva"
                                    >
                                      <CalendarClock size={15} aria-hidden="true" /> Remarcar
                                    </Link>
                                    <button
                                      type="button"
                                      className="mr-cancelar"
                                      disabled={cancelando === r.id}
                                      onClick={() => setConfirmando(r.id)}
                                    >
                                      {cancelando === r.id ? "Cancelando..." : "Cancelar"}
                                    </button>
                                  </>
                                ) : (
                                  // Menos de 24h para o jogo: cancelar ou remarcar só falando com a empresa
                                  <FalarComEmpresa reserva={r} horasAte={horasAte} />
                                )}
                              </>
                            )}
                            {r.status === "concluida" &&
                              (jaAvaliou(r.quadraId) ? (
                                <Link to={`/avaliacoes/${r.quadraId}`} className="pn-botao pn-botao-contorno mr-avaliada">
                                  <Check size={15} aria-hidden="true" /> Avaliada
                                </Link>
                              ) : (
                                <Link to={`/avaliacoes/${r.quadraId}?escrever=1`} className="pn-botao pn-botao-contorno">
                                  <Star size={15} aria-hidden="true" /> Avaliar
                                </Link>
                              ))}
                            {r.status !== "confirmada" && (
                              <Link to={`/agendamento/${r.quadraId}`} className="pn-botao">
                                <RotateCcw size={15} aria-hidden="true" /> Reservar de novo
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Toast mensagem={toast} onFechar={fecharToast} />
    </UsuarioLayout>
  );
}
