import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  Plus,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import Toast from "../components/Toast.jsx";
import { baixarIcs, eventoDaReserva } from "../utils/agenda.js";
import { useDados } from "../hooks/useDados.js";
import { buscarQuadraPublica } from "../services/catalogoService.js";
import { cancelarReserva, fimDaReserva, inicioDaReserva, listarReservas, separarReservas } from "../services/reservasService.js";
import { descreverDuracao, formatarData, formatarPreco, paraData, tempoRelativo, foto } from "../utils/formatadores.js";
import "../css/MinhasReservas.css";
import Esqueleto from "../components/Esqueleto.jsx";

const statusReserva = {
  confirmada: { texto: "Confirmada", classe: "ok", icone: CircleCheck },
  concluida: { texto: "Concluída", classe: "info", icone: Trophy },
  cancelada: { texto: "Cancelada", classe: "erro", icone: CircleX },
};

const HORAS_CANCELAMENTO_GRATIS = 24;

export default function MinhasReservas() {
  const { dados, carregando, recarregar } = useDados(listarReservas);
  const [aba, setAba] = useState("proximas");
  const [confirmando, setConfirmando] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [toast, setToast] = useState("");

  const { proximas, historico } = separarReservas(dados ?? []);
  const abas = [
    { id: "proximas", texto: "Próximas", lista: proximas },
    { id: "historico", texto: "Histórico", lista: historico },
  ];
  const lista = abas.find((a) => a.id === aba).lista;

  async function cancelar(reserva) {
    setConfirmando(null);
    setCancelando(reserva.id);
    await cancelarReserva(reserva.id);
    setCancelando(null);
    recarregar();
    setToast(`Reserva na ${reserva.quadra} cancelada.`);
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
                const quadra = buscarQuadraPublica(r.quadraId);
                const status = statusReserva[r.status];
                const horasAte = (inicioDaReserva(r) - new Date()) / 3_600_000;
                const data = paraData(r.data);

                return (
                  <li key={r.id} className={`mr-card ${r.status}`}>
                    <div className="mr-foto">
                      {quadra && <img {...foto(quadra.imagens[0], 300)} alt="" loading="lazy" />}
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
                        <li>
                          <Clock size={15} aria-hidden="true" /> {r.hora} às {fimDaReserva(r)} ({descreverDuracao(r)})
                        </li>
                        <li>
                          <MapPin size={15} aria-hidden="true" /> {r.endereco}
                        </li>
                      </ul>

                      <div className="mr-rodape">
                        <p className="mr-valor">
                          <span>Total</span>
                          <strong>{formatarPreco(r.valor, 2)}</strong>
                        </p>

                        {confirmando === r.id ? (
                          <div className="mr-confirmar" role="alert">
                            <p>
                              {horasAte >= HORAS_CANCELAMENTO_GRATIS
                                ? "Cancelar esta reserva? O cancelamento é gratuito."
                                : "Faltam menos de 24h: pode haver cobrança de 50% do valor. Cancelar mesmo assim?"}
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
                                <button
                                  type="button"
                                  className="mr-cancelar"
                                  disabled={cancelando === r.id}
                                  onClick={() => setConfirmando(r.id)}
                                >
                                  {cancelando === r.id ? "Cancelando..." : "Cancelar"}
                                </button>
                              </>
                            )}
                            {r.status === "concluida" && (
                              <Link to={`/avaliacoes/${r.quadraId}?escrever=1`} className="pn-botao pn-botao-contorno">
                                <Star size={15} aria-hidden="true" /> Avaliar
                              </Link>
                            )}
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

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </UsuarioLayout>
  );
}
