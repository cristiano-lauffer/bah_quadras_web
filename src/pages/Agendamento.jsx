import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  Info,
  LoaderCircle,
  MapPin,
  Star,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useDados } from "../hooks/useDados.js";
import { buscarQuadraPorId, quadras } from "../data/quadras.js";
import { empresaDemo } from "../data/empresa.js";
import { buscarVinculoPublico, gradePadrao } from "../services/quadrasService.js";
import { criarReserva, horariosOcupados } from "../services/reservasService.js";
import { formatarData, formatarNota, formatarPreco, isoComDias, paraData, semAvaliacoes } from "../utils/formatadores.js";
import "../css/Agendamento.css";

const DIAS_VISIVEIS = 14;
const DURACAO_MAXIMA = 3;
const formasPagamento = ["Pix", "Cartão", "Dinheiro"];

const somarHoras = (hora, n) => `${String(Number(hora.slice(0, 2)) + n).padStart(2, "0")}:00`;

export default function Agendamento() {
  const { id } = useParams();
  const [params] = useSearchParams();

  if (!id) return <EscolherQuadra />;

  const quadra = buscarQuadraPorId(id);
  if (!quadra) return <QuadraNaoEncontrada />;

  return <Reserva key={id} quadra={quadra} dataInicial={params.get("data")} horaInicial={params.get("hora")} />;
}

function Pagina({ children }) {
  return (
    <div className="public-page ag">
      <Header />
      <main className="ag-container">{children}</main>
      <Footer />
    </div>
  );
}

function EscolherQuadra() {
  return (
    <Pagina>
      <header className="ag-cabecalho-simples">
        <h1>Qual quadra você quer reservar?</h1>
        <p>Escolha uma quadra para ver os horários livres.</p>
      </header>
      <ul className="ag-escolher">
        {quadras.map((q) => (
          <li key={q.id}>
            <Link to={`/agendamento/${q.id}`} className="ag-escolher-card">
              <img src={q.imagens[0]} alt="" loading="lazy" />
              <span>
                <small>{q.modalidade}</small>
                <strong>{q.nome}</strong>
                <span>{formatarPreco(q.preco)}/h · {q.bairro}</span>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}

function QuadraNaoEncontrada() {
  return (
    <Pagina>
      <div className="ag-aviso-grande">
        <CircleAlert size={40} aria-hidden="true" />
        <h1>Quadra não encontrada</h1>
        <p>O link pode estar incorreto ou a quadra não está mais disponível.</p>
        <Link to="/agendamento" className="ag-botao">Ver todas as quadras</Link>
      </div>
    </Pagina>
  );
}

/* ================================================================
   RESERVA
   ================================================================ */

function Reserva({ quadra, dataInicial, horaInicial }) {
  const dias = Array.from({ length: DIAS_VISIVEIS }, (_, i) => isoComDias(i));
  const hoje = dias[0];

  // Dados que a empresa controla (preço, situação e grade de horários).
  const { dados: vinculo, carregando: carregandoVinculo } = useDados(() => buscarVinculoPublico(quadra.id), [quadra.id]);
  const preco = vinculo?.preco ?? quadra.preco;
  const situacao = vinculo?.status ?? "ativa";
  const grade = vinculo?.horarios ?? gradePadrao();

  const [data, setData] = useState(dias.includes(dataInicial) ? dataInicial : hoje);
  const [hora, setHora] = useState(horaInicial ?? "");
  const [duracao, setDuracao] = useState(1);
  const [etapa, setEtapa] = useState("escolher");
  const [pagamento, setPagamento] = useState("Pix");
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [reserva, setReserva] = useState(null);

  const { dados: ocupados, carregando: carregandoHorarios } = useDados(
    () => horariosOcupados(quadra.id, data),
    [quadra.id, data]
  );

  const diaSemana = (iso) => paraData(iso).getDay();
  const agora = new Date();
  const horarios = (grade[diaSemana(data)] ?? []).map((h) => {
    let estado = "livre";
    if (data === hoje && Number(h.slice(0, 2)) <= agora.getHours()) estado = "passado";
    else if (ocupados?.includes(h)) estado = "ocupado";
    return { hora: h, estado };
  });
  const livre = (h) => horarios.find((x) => x.hora === h)?.estado === "livre";

  // Quantas horas seguidas estão livres a partir do horário escolhido.
  let duracaoPossivel = 0;
  if (hora && livre(hora)) {
    while (duracaoPossivel < DURACAO_MAXIMA && livre(somarHoras(hora, duracaoPossivel))) duracaoPossivel++;
  }
  const horaValida = duracaoPossivel > 0;
  const duracaoFinal = Math.min(duracao, Math.max(duracaoPossivel, 1));
  const total = preco * duracaoFinal;
  const livresNoDia = horarios.filter((h) => h.estado === "livre").length;

  function escolherData(novaData) {
    setData(novaData);
    setHora("");
    setDuracao(1);
  }

  async function confirmar() {
    setEnviando(true);
    const nova = await criarReserva({
      quadraId: quadra.id,
      quadra: quadra.nome,
      modalidade: quadra.modalidade,
      endereco: `${quadra.bairro}, ${quadra.cidade}`,
      data,
      hora,
      duracao: duracaoFinal,
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
      <Pagina>
        <section className="ag-sucesso">
          <span className="ag-sucesso-icone" aria-hidden="true">
            <CircleCheck size={44} />
          </span>
          <h1>Reserva confirmada!</h1>
          <p>Te esperamos na quadra. Você encontra esta reserva em Minhas reservas.</p>

          <dl className="ag-recibo">
            <div><dt>Quadra</dt><dd>{quadra.nome}</dd></div>
            <div><dt>Data</dt><dd>{formatarData(reserva.data, { weekday: "long", day: "numeric", month: "long" })}</dd></div>
            <div><dt>Horário</dt><dd>{reserva.hora} às {somarHoras(reserva.hora, reserva.duracao)}</dd></div>
            <div><dt>Pagamento</dt><dd>{reserva.pagamento} no local</dd></div>
            <div className="ag-recibo-total"><dt>Total</dt><dd>{formatarPreco(reserva.valor, 2)}</dd></div>
          </dl>

          <p className="ag-nota">
            <Info size={15} aria-hidden="true" /> Demonstração: a reserva fica salva apenas neste navegador.
          </p>

          <div className="ag-sucesso-acoes">
            <Link to="/usuario/reservas" className="ag-botao">
              <CalendarCheck size={18} aria-hidden="true" /> Ver minhas reservas
            </Link>
            <Link to="/" className="ag-botao ag-botao-contorno">
              Voltar ao início
            </Link>
          </div>
        </section>
      </Pagina>
    );
  }

  const indisponivel = situacao !== "ativa";

  return (
    <Pagina>
      <Link to={`/quadra/${quadra.id}`} className="ag-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para a quadra
      </Link>

      <header className="ag-quadra">
        <img src={quadra.imagens[0]} alt="" />
        <div>
          <span className="ag-tag">{quadra.modalidade}</span>
          <h1>Reservar {quadra.nome}</h1>
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
            <p className="ag-carregando" role="status">
              <LoaderCircle size={18} className="ag-girando" aria-hidden="true" /> Carregando disponibilidade...
            </p>
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
                  <p className="ag-carregando" role="status">
                    <LoaderCircle size={18} className="ag-girando" aria-hidden="true" /> Buscando horários...
                  </p>
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
                          setDuracao(1);
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
                  <h2 id="ag-duracao-titulo">Por quanto tempo?</h2>
                  <div className="ag-duracoes" role="radiogroup" aria-label="Duração">
                    {Array.from({ length: DURACAO_MAXIMA }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={duracaoFinal === n}
                        disabled={n > duracaoPossivel}
                        className="ag-duracao"
                        onClick={() => setDuracao(n)}
                      >
                        <strong>{n}h</strong>
                        <small>{n > duracaoPossivel ? "Indisponível" : `até ${somarHoras(hora, n)}`}</small>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* ===== Confirmação ===== */
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
                <p>{empresaDemo.politicaCancelamento}</p>
              </div>

              <label className="ag-aceite">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                Li e concordo com a política de cancelamento.
              </label>
            </section>
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
                <dd>{horaValida ? `${hora} às ${somarHoras(hora, duracaoFinal)}` : "Escolha um horário"}</dd>
              </div>
              <div>
                <dt>Valor por hora</dt>
                <dd>{formatarPreco(preco, 2)}</dd>
              </div>
              <div className="ag-resumo-total">
                <dt>Total</dt>
                <dd>{horaValida ? formatarPreco(total, 2) : "—"}</dd>
              </div>
            </dl>

            {etapa === "escolher" ? (
              <button
                type="button"
                className="ag-botao"
                disabled={!horaValida}
                onClick={() => {
                  setEtapa("confirmar");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Continuar <ArrowRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <>
                <button type="button" className="ag-botao" disabled={!aceite || enviando} onClick={confirmar}>
                  {enviando ? (
                    <>
                      <LoaderCircle size={18} className="ag-girando" aria-hidden="true" /> Confirmando...
                    </>
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
    </Pagina>
  );
}
