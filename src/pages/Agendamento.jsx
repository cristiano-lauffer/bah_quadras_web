import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  LoaderCircle,
  LogIn,
  MapPin,
  Star,
} from "lucide-react";
import { useDados } from "../hooks/useDados.js";
import PaginaAgendamento from "../components/agendamento/PaginaAgendamento.jsx";
import EscolherQuadra from "../components/agendamento/EscolherQuadra.jsx";
import QuadraNaoEncontrada from "../components/agendamento/QuadraNaoEncontrada.jsx";
import ReservaConfirmada from "../components/agendamento/ReservaConfirmada.jsx";
import { buscarQuadraPublica } from "../services/catalogoService.js";
import { buscarVinculoPublico, gradePadrao } from "../services/quadrasService.js";
import {
  buscarReserva,
  criarReserva,
  horariosOcupados,
  inicioDaReserva,
  remarcarReserva,
} from "../services/reservasService.js";
import { useSessao } from "../hooks/useSessao.js";
import { empresaAtual } from "../services/empresaService.js";
import {
  cobraPorBateria,
  descreverDuracao,
  formatarData,
  formatarNota,
  formatarPreco,
  isoComDias,
  minutosBateria,
  paraData,
  semAvaliacoes,
  somarMinutos,
  unidadePreco,
  foto,
} from "../utils/formatadores.js";
import "../css/Agendamento.css";
import { useTitulo } from "../hooks/useTitulo.js";
import Esqueleto from "../components/Esqueleto.jsx";

const DIAS_VISIVEIS = 14;
const DURACAO_MAXIMA = 3; // horas
const BATERIAS_MAXIMAS = 4; // kart: baterias dentro do mesmo horário
const POLITICA_PADRAO = "Cancelamento gratuito até 24 horas antes do horário reservado.";
const formasPagamento = ["Pix", "Cartão", "Dinheiro"];

const somarHoras = (hora, n) => `${String(Number(hora.slice(0, 2)) + n).padStart(2, "0")}:00`;

export default function Agendamento() {
  const { id } = useParams();
  const [params] = useSearchParams();

  const quadra = id ? buscarQuadraPublica(id) : null;
  const remarcarId = params.get("remarcar");
  useTitulo(
    !id ? "Escolha uma quadra" : !quadra ? "Quadra não encontrada" : `${remarcarId ? "Remarcar" : "Reservar"} ${quadra.nome}`
  );

  if (!id) return <EscolherQuadra />;
  if (!quadra) return <QuadraNaoEncontrada />;

  return (
    <Reserva
      key={`${id}-${remarcarId ?? ""}`}
      quadra={quadra}
      dataInicial={params.get("data")}
      horaInicial={params.get("hora")}
      duracaoInicial={Number(params.get("duracao")) || null}
      etapaInicial={params.get("etapa")}
      remarcarId={remarcarId}
    />
  );
}

/* ================================================================
   RESERVA
   ================================================================ */

function Reserva({ quadra, dataInicial, horaInicial, duracaoInicial, etapaInicial, remarcarId }) {
  const dias = Array.from({ length: DIAS_VISIVEIS }, (_, i) => isoComDias(i));
  const hoje = dias[0];
  const navigate = useNavigate();

  // Só jogadores logados reservam. Sem login, o "Continuar" leva ao Login e volta para cá.
  const sessao = useSessao();
  const logadoComoJogador = sessao?.tipo === "usuario";

  // Remarcação: /agendamento/:id?remarcar=<id da reserva>
  const original = remarcarId ? buscarReserva(remarcarId) : null;
  const remarcando = Boolean(
    original && original.quadraId === quadra.id && original.status === "confirmada" && inicioDaReserva(original) > new Date()
  );
  const remarcacaoInvalida = Boolean(remarcarId) && !remarcando;
  const duracaoOriginal = remarcando ? original.baterias ?? original.duracao : 1;

  // Dados que a empresa controla (preço, situação e grade de horários).
  const { dados: vinculo, carregando: carregandoVinculo } = useDados(() => buscarVinculoPublico(quadra.id), [quadra.id]);
  const preco = vinculo?.preco ?? quadra.preco;
  const situacao = vinculo?.status ?? "ativa";
  const grade = vinculo?.horarios ?? gradePadrao();

  const [data, setData] = useState(
    dias.includes(dataInicial) ? dataInicial : remarcando && dias.includes(original.data) ? original.data : hoje
  );
  const [hora, setHora] = useState(horaInicial ?? "");
  const [duracao, setDuracao] = useState(duracaoInicial ?? duracaoOriginal);
  // Voltando do Login, já abre direto na confirmação.
  const [etapa, setEtapa] = useState(etapaInicial === "confirmar" && horaInicial && logadoComoJogador ? "confirmar" : "escolher");
  const [pagamento, setPagamento] = useState("Pix");
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);

  const { dados: ocupados, carregando: carregandoHorarios } = useDados(
    () => horariosOcupados(quadra.id, data, remarcando ? original.id : null),
    [quadra.id, data, remarcando]
  );

  // Ao remarcar, as horas da própria reserva contam como livres.
  const horasProprias =
    remarcando && data === original.data
      ? Array.from({ length: original.duracao }, (_, i) => somarHoras(original.hora, i))
      : [];

  const diaSemana = (iso) => paraData(iso).getDay();
  const agora = new Date();
  const horarios = (grade[diaSemana(data)] ?? []).map((h) => {
    let estado = "livre";
    if (data === hoje && Number(h.slice(0, 2)) <= agora.getHours()) estado = "passado";
    else if (ocupados?.includes(h) && !horasProprias.includes(h)) estado = "ocupado";
    return { hora: h, estado };
  });
  const livre = (h) => horarios.find((x) => x.hora === h)?.estado === "livre";

  // Kart é cobrado por bateria: as baterias cabem dentro de um horário de 1 hora.
  const kart = cobraPorBateria(quadra);
  const minBateria = minutosBateria(quadra);
  // Só as baterias que cabem na hora reservada (15 min: até 4; 20 min: até 3; 10 min: até 4).
  const bateriasNaHora = Math.max(1, Math.min(BATERIAS_MAXIMAS, Math.floor(60 / minBateria)));
  const maximoOpcoes = kart ? bateriasNaHora : DURACAO_MAXIMA;

  // Quantas opções (horas seguidas ou baterias) estão disponíveis no horário escolhido.
  let duracaoPossivel = 0;
  if (hora && livre(hora)) {
    if (kart) duracaoPossivel = bateriasNaHora;
    else while (duracaoPossivel < DURACAO_MAXIMA && livre(somarHoras(hora, duracaoPossivel))) duracaoPossivel++;
  }
  const horaValida = duracaoPossivel > 0;
  const duracaoFinal = Math.min(duracao, Math.max(duracaoPossivel, 1));
  const total = preco * duracaoFinal;
  const fimEscolhido = (n) => (kart ? somarMinutos(hora, n * minBateria) : somarHoras(hora, n));
  const politica = vinculo ? empresaAtual().politicaCancelamento : POLITICA_PADRAO;
  const livresNoDia = horarios.filter((h) => h.estado === "livre").length;
  const mesmoHorario =
    remarcando && data === original.data && hora === original.hora && duracaoFinal === duracaoOriginal;
  const diferenca = remarcando ? total - original.valor : 0;

  function escolherData(novaData) {
    setData(novaData);
    setHora("");
    setDuracao(duracaoOriginal);
  }

  function irParaLogin() {
    const volta = new URLSearchParams({ data, hora, duracao: String(duracaoFinal), etapa: "confirmar" });
    if (remarcando) volta.set("remarcar", String(original.id));
    navigate("/login", {
      state: { de: `/agendamento/${quadra.id}?${volta}`, motivo: remarcando ? "remarcar" : "reservar", quadra: quadra.nome },
    });
  }

  function continuar() {
    if (!logadoComoJogador) return irParaLogin();
    setEtapa("confirmar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confirmar() {
    if (!logadoComoJogador) return irParaLogin();
    setEnviando(true);

    if (remarcando) {
      await remarcarReserva(original.id, {
        data,
        hora,
        duracao: kart ? 1 : duracaoFinal,
        ...(kart && { baterias: duracaoFinal, minutosBateria: minBateria }),
        valor: total,
      });
      const quando = formatarData(data, { weekday: "short", day: "2-digit", month: "2-digit" });
      navigate("/usuario/reservas", { state: { aviso: `Reserva na ${quadra.nome} remarcada para ${quando} às ${hora}.` } });
      return;
    }

    const nova = await criarReserva({
      quadraId: quadra.id,
      quadra: quadra.nome,
      modalidade: quadra.modalidade,
      endereco: `${quadra.bairro}, ${quadra.cidade}`,
      data,
      hora,
      duracao: kart ? 1 : duracaoFinal, // horas que o horário fica ocupado
      ...(kart && { baterias: duracaoFinal, minutosBateria: minBateria }),
      valor: total,
      pagamento,
    });
    setReserva(nova);
    setEnviando(false);
    setEtapa("concluido");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Reserva concluída ---------- */
  if (etapa === "concluido" && reserva) {
    return (
      <PaginaAgendamento>
        <ReservaConfirmada quadra={quadra} reserva={reserva} />
      </PaginaAgendamento>
    );
  }

  const indisponivel = situacao !== "ativa";

  return (
    <PaginaAgendamento>
      <Link to={`/quadra/${quadra.id}`} className="ag-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para a quadra
      </Link>

      <header className="ag-quadra">
        <img {...foto(quadra.imagens[0], 200)} alt="" />
        <div>
          <span className="ag-tag">{quadra.modalidade}</span>
          <h1>{remarcando ? "Remarcar" : "Reservar"} {quadra.nome}</h1>
          <p>
            <span><MapPin size={14} aria-hidden="true" /> {quadra.bairro}, {quadra.cidade}</span>
            {semAvaliacoes(quadra) ? (
              <span>Nova no Bah Quadras</span>
            ) : (
              <span><Star size={14} aria-hidden="true" className="ag-estrela" /> {formatarNota(quadra.avaliacao)}</span>
            )}
          </p>
        </div>
      </header>

      {remarcando && (
        <div className="ag-remarcar" role="status">
          <CalendarClock size={20} aria-hidden="true" />
          <p>
            <strong>Horário atual:</strong>{" "}
            {formatarData(original.data, { weekday: "long", day: "numeric", month: "long" })} às {original.hora} (
            {descreverDuracao(original)}). Escolha o novo dia e horário.
          </p>
        </div>
      )}
      {remarcacaoInvalida && (
        <div className="ag-remarcar ag-remarcar-erro" role="alert">
          <CircleAlert size={20} aria-hidden="true" />
          <p>Essa reserva não pode mais ser remarcada (já passou ou foi cancelada). Você pode fazer uma reserva nova abaixo.</p>
        </div>
      )}

      <ol className="ag-passos" aria-label="Etapas">
        <li className={etapa === "escolher" ? "atual" : "feito"}>
          <span>{etapa === "escolher" ? 1 : <CircleCheck size={16} />}</span> Data e horário
        </li>
        <li className={etapa === "confirmar" ? "atual" : ""}>
          <span>2</span> Confirmação
        </li>
      </ol>

      <div className="ag-layout">
        <div className="ag-principal">
          {carregandoVinculo ? (
            <Esqueleto tipo="lista" quantidade={3} rotulo="Carregando disponibilidade..." />
          ) : indisponivel ? (
            <div className="ag-aviso-grande">
              <CircleAlert size={40} aria-hidden="true" />
              <h2>{situacao === "manutencao" ? "Quadra em manutenção" : "Quadra indisponível"}</h2>
              <p>No momento esta quadra não está recebendo reservas. Que tal escolher outra?</p>
              <Link to="/#quadras" className="ag-botao">Ver outras quadras</Link>
            </div>
          ) : etapa === "escolher" ? (
            <>
              {/* ===== Dia ===== */}
              <section className="ag-card" aria-labelledby="ag-dia-titulo">
                <h2 id="ag-dia-titulo">Escolha o dia</h2>
                <div className="ag-dias" role="radiogroup" aria-label="Dia da reserva">
                  {dias.map((d) => {
                    const fechado = !(grade[diaSemana(d)] ?? []).length;
                    const dt = paraData(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        role="radio"
                        aria-checked={data === d}
                        disabled={fechado}
                        className="ag-dia"
                        onClick={() => escolherData(d)}
                        aria-label={`${formatarData(d, { weekday: "long", day: "numeric", month: "long" })}${fechado ? " (fechado)" : ""}`}
                      >
                        <small>{d === hoje ? "Hoje" : dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</small>
                        <strong>{dt.getDate()}</strong>
                        <small>{fechado ? "Fechado" : dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ===== Horário ===== */}
              <section className="ag-card" aria-labelledby="ag-hora-titulo">
                <div className="ag-card-topo">
                  <div>
                    <h2 id="ag-hora-titulo">Escolha o horário</h2>
                    <p>
                      {formatarData(data, { weekday: "long", day: "numeric", month: "long" })}
                      {!carregandoHorarios && ` · ${livresNoDia} ${livresNoDia === 1 ? "horário livre" : "horários livres"}`}
                    </p>
                  </div>
                  <div className="ag-legenda" aria-hidden="true">
                    <span><i className="livre" /> Livre</span>
                    <span><i className="ocupado" /> Ocupado</span>
                  </div>
                </div>

                {carregandoHorarios ? (
                  <Esqueleto tipo="botoes" quantidade={10} rotulo="Buscando horários..." />
                ) : horarios.length === 0 ? (
                  <p className="ag-vazio">A quadra não abre neste dia.</p>
                ) : livresNoDia === 0 ? (
                  <p className="ag-vazio">Todos os horários deste dia já foram reservados. Tente outro dia.</p>
                ) : null}

                {!carregandoHorarios && horarios.length > 0 && (
                  <div className="ag-horarios" role="radiogroup" aria-label="Horário de início">
                    {horarios.map((h) => (
                      <button
                        key={h.hora}
                        type="button"
                        role="radio"
                        aria-checked={hora === h.hora}
                        disabled={h.estado !== "livre"}
                        className={`ag-horario ${h.estado}`}
                        onClick={() => {
                          setHora(h.hora);
                          setDuracao(duracaoOriginal); // ao remarcar, mantém a duração da reserva
                        }}
                      >
                        {h.hora}
                        {h.estado === "ocupado" && <span className="ag-sr"> (ocupado)</span>}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* ===== Duração ===== */}
              {horaValida && (
                <section className="ag-card" aria-labelledby="ag-duracao-titulo">
                  <h2 id="ag-duracao-titulo">{kart ? "Quantas baterias?" : "Por quanto tempo?"}</h2>
                  {kart && <p className="ag-texto">Cada bateria tem {minBateria} minutos.</p>}
                  <div className="ag-duracoes" role="radiogroup" aria-label="Duração">
                    {Array.from({ length: maximoOpcoes }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={duracaoFinal === n}
                        disabled={n > duracaoPossivel}
                        className="ag-duracao"
                        onClick={() => setDuracao(n)}
                      >
                        <strong>{kart ? `${n} ${n === 1 ? "bateria" : "baterias"}` : `${n}h`}</strong>
                        <small>{n > duracaoPossivel ? "Indisponível" : `até ${fimEscolhido(n)}`}</small>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* ===== Confirmação ===== */
            !carregandoHorarios && !horaValida ? (
              <div className="ag-aviso-grande">
                <CircleAlert size={40} aria-hidden="true" />
                <h2>Esse horário não está mais livre</h2>
                <p>Alguém reservou enquanto você entrava na conta. Escolha outro horário.</p>
                <button type="button" className="ag-botao" onClick={() => setEtapa("escolher")}>
                  Escolher outro horário
                </button>
              </div>
            ) : remarcando ? (
            <section className="ag-card" aria-labelledby="ag-confirmar-titulo">
              <h2 id="ag-confirmar-titulo">Confirme a remarcação</h2>
              <div className="ag-de-para">
                <div>
                  <small>De</small>
                  <strong>{formatarData(original.data, { weekday: "short", day: "2-digit", month: "short" })}</strong>
                  <span>{original.hora} · {descreverDuracao(original)}</span>
                </div>
                <ArrowRight size={20} aria-hidden="true" />
                <div className="novo">
                  <small>Para</small>
                  <strong>{formatarData(data, { weekday: "short", day: "2-digit", month: "short" })}</strong>
                  <span>
                    {hora} · {kart ? descreverDuracao({ baterias: duracaoFinal, minutosBateria: minBateria }) : `${duracaoFinal}h`}
                  </span>
                </div>
              </div>
              <p className="ag-texto">
                O pagamento continua no local ({original.pagamento ?? "na forma escolhida"}).
                {diferenca !== 0 &&
                  (diferenca > 0
                    ? ` Com a nova duração, o valor aumenta ${formatarPreco(diferenca, 2)}.`
                    : ` Com a nova duração, o valor diminui ${formatarPreco(-diferenca, 2)}.`)}
              </p>
            </section>
            ) : (
            <section className="ag-card" aria-labelledby="ag-confirmar-titulo">
              <h2 id="ag-confirmar-titulo">Confirme sua reserva</h2>
              <p className="ag-texto">Confira os dados e escolha como prefere pagar no local.</p>

              <fieldset className="ag-pagamento">
                <legend>Forma de pagamento (no local)</legend>
                <div>
                  {formasPagamento.map((f) => (
                    <label key={f} className={pagamento === f ? "marcado" : ""}>
                      <input type="radio" name="pagamento" value={f} checked={pagamento === f} onChange={() => setPagamento(f)} />
                      <CreditCard size={16} aria-hidden="true" /> {f}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="ag-politica">
                <strong>Política de cancelamento</strong>
                <p>{politica}</p>
              </div>

              <label className="ag-aceite">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                Li e concordo com a política de cancelamento.
              </label>
              <p className="ag-termos">
                Ao confirmar, você também concorda com os{" "}
                <Link to="/termos#reservas" target="_blank">Termos de Uso</Link> do Bah Quadras.
              </p>
            </section>
            )
          )}
        </div>

        {/* ===== Resumo ===== */}
        {!indisponivel && !carregandoVinculo && (
          <aside className="ag-resumo" aria-label="Resumo da reserva">
            <h2>Resumo</h2>
            <dl>
              <div>
                <dt>Data</dt>
                <dd>{formatarData(data, { weekday: "short", day: "2-digit", month: "short" })}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{horaValida ? `${hora} às ${fimEscolhido(duracaoFinal)}` : "Escolha um horário"}</dd>
              </div>
              <div>
                <dt>Valor por {unidadePreco(quadra)}</dt>
                <dd>{formatarPreco(preco, 2)}</dd>
              </div>
              <div className="ag-resumo-total">
                <dt>Total</dt>
                <dd>{horaValida ? formatarPreco(total, 2) : "—"}</dd>
              </div>
              {remarcando && horaValida && diferenca !== 0 && (
                <div>
                  <dt>Diferença</dt>
                  <dd>{`${diferenca > 0 ? "+" : "−"} ${formatarPreco(Math.abs(diferenca), 2)}`}</dd>
                </div>
              )}
            </dl>

            {etapa === "escolher" ? (
              <>
                <button type="button" className="ag-botao" disabled={!horaValida || mesmoHorario} onClick={continuar}>
                  {logadoComoJogador ? (
                    <>
                      Continuar <ArrowRight size={18} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <LogIn size={18} aria-hidden="true" /> Entrar e continuar
                    </>
                  )}
                </button>
                {mesmoHorario && <p className="ag-nota-login">Escolha um dia ou horário diferente do atual.</p>}
                {!logadoComoJogador && !mesmoHorario && (
                  <p className="ag-nota-login">
                    {sessao?.tipo === "empresa"
                      ? "Você está na conta da empresa. Entre com uma conta de jogador para reservar."
                      : "Para reservar, entre na sua conta. Seu horário fica guardado."}
                  </p>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="ag-botao"
                  disabled={(!remarcando && !aceite) || enviando || !horaValida || mesmoHorario}
                  onClick={confirmar}
                >
                  {enviando ? (
                    <>
                      <LoaderCircle size={18} className="ag-girando" aria-hidden="true" /> Confirmando...
                    </>
                  ) : remarcando ? (
                    "Confirmar remarcação"
                  ) : (
                    "Confirmar reserva"
                  )}
                </button>
                <button type="button" className="ag-botao ag-botao-contorno" onClick={() => setEtapa("escolher")}>
                  <ArrowLeft size={18} aria-hidden="true" /> Alterar horário
                </button>
              </>
            )}

            <p className="ag-nota">
              <Clock size={14} aria-hidden="true" /> Cancelamento grátis até 24h antes.
            </p>
          </aside>
        )}
      </div>
    </PaginaAgendamento>
  );
}
