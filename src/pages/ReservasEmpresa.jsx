import { useState } from "react";
import {
  Ban,
  CalendarDays,
  Plus,
  Undo2,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock,
  LoaderCircle,
  Search,
  Smartphone,
  Store,
  Trophy,
  Wallet,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import Toast from "../components/Toast.jsx";
import NovoHorario from "../components/NovoHorario.jsx";
import { useDados } from "../hooks/useDados.js";
import { listarQuadras } from "../services/quadrasService.js";
import {
  cancelarReservaEmpresa,
  fimReserva,
  inicioReserva,
  listarBloqueios,
  listarReservasEmpresa,
  marcarComoPaga,
  marcarComoReembolsada,
  removerBloqueio,
  situacaoReserva,
} from "../services/reservasEmpresaService.js";
import { formatarData, formatarPreco, isoComDias, normalizar } from "../utils/formatadores.js";
import "../css/ReservasEmpresa.css";
import Esqueleto from "../components/Esqueleto.jsx";

const POR_PAGINA = 40;

const periodos = [
  { id: "hoje", texto: "Hoje", de: 0, ate: 0 },
  { id: "semana", texto: "Próximos 7 dias", de: 0, ate: 7 },
  { id: "passados", texto: "Últimos 30 dias", de: -30, ate: -1 },
  { id: "todas", texto: "Todas", de: -999, ate: 999 },
];

const filtrosSituacao = {
  todas: "Todas as situações",
  confirmada: "Confirmadas",
  pendente: "Pagamento pendente",
  reembolso: "Reembolso pendente",
  concluida: "Concluídas",
  cancelada: "Canceladas",
};

const visual = {
  confirmada: { texto: "Confirmada", classe: "ok", icone: CircleCheck },
  aguardando: { texto: "Aguardando pagamento", classe: "alerta", icone: CircleAlert },
  andamento: { texto: "Em andamento", classe: "info", icone: CircleDot },
  concluida: { texto: "Concluída", classe: "neutro", icone: Trophy },
  cancelada: { texto: "Cancelada", classe: "erro", icone: CircleX },
};

export default function ReservasEmpresa() {
  const { dados: reservas, carregando, recarregar } = useDados(listarReservasEmpresa);
  const { dados: quadras } = useDados(listarQuadras);

  const [periodo, setPeriodo] = useState("hoje");
  const [quadra, setQuadra] = useState("todas");
  const [situacao, setSituacao] = useState("todas");
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [confirmando, setConfirmando] = useState(null);
  const [processando, setProcessando] = useState(null);
  const [toast, setToast] = useState("");
  const [novoAberto, setNovoAberto] = useState(false);
  // Confirmação do reembolso: { id, valor } da reserva em que a empresa clicou
  const [reembolsando, setReembolsando] = useState(null);
  const { dados: bloqueios, recarregar: recarregarBloqueios } = useDados(listarBloqueios);

  const nomeQuadra = (id) => quadras?.find((q) => q.id === id)?.nome ?? "Quadra";
  const { de, ate } = periodos.find((p) => p.id === periodo);
  const dataDe = isoComDias(de);
  const dataAte = isoComDias(ate);
  const termo = normalizar(busca);
  const agora = new Date();

  const filtradas = (reservas ?? [])
    .map((r) => ({ ...r, situacao: situacaoReserva(r, agora) }))
    .filter((r) => periodo === "todas" || (r.data >= dataDe && r.data <= dataAte))
    .filter((r) => quadra === "todas" || r.quadraId === quadra)
    .filter((r) => {
      if (situacao === "todas") return true;
      if (situacao === "pendente") return !r.pago && r.situacao !== "cancelada";
      if (situacao === "reembolso") return r.reembolso === "pendente";
      if (situacao === "confirmada") return r.situacao === "confirmada" || r.situacao === "andamento";
      return r.situacao === situacao;
    })
    .filter((r) => !termo || normalizar(r.cliente).includes(termo))
    .sort((a, b) =>
      periodo === "passados" ? inicioReserva(b) - inicioReserva(a) : inicioReserva(a) - inicioReserva(b)
    );

  const ativas = filtradas.filter((r) => r.situacao !== "cancelada");
  const totalValor = ativas.reduce((s, r) => s + r.valor, 0);
  const pendentes = ativas.filter((r) => !r.pago);

  // Agrupa por dia para exibir com cabeçalho de data.
  const grupos = [];
  for (const r of filtradas.slice(0, visiveis)) {
    const ultimo = grupos.at(-1);
    if (ultimo?.data === r.data) ultimo.itens.push(r);
    else grupos.push({ data: r.data, itens: [r] });
  }

  function mudarFiltro(funcao) {
    return (valor) => {
      funcao(valor);
      setVisiveis(POR_PAGINA);
    };
  }

  // Roda uma ação na reserva mostrando o "salvando" e o resultado (ou o erro da API).
  async function executar(r, acao, mensagem) {
    setProcessando(r.id);
    try {
      const atualizada = await acao();
      setToast(typeof mensagem === "function" ? mensagem(atualizada) : mensagem);
    } catch (erro) {
      setToast(erro.message);
    } finally {
      setProcessando(null);
      recarregar();
    }
  }

  const pagar = (r) => executar(r, () => marcarComoPaga(r.id), `Pagamento de ${r.cliente} registrado. A reserva ficou confirmada para o jogador.`);
  function reembolsar(r) {
    const valor = Number(String(reembolsando.valor).replace(",", "."));
    if (!Number.isFinite(valor) || valor < 0 || valor > r.valor) {
      setToast(`Informe um valor de R$ 0 até ${formatarPreco(r.valor, 2)}.`);
      return;
    }
    setReembolsando(null);
    executar(r, () => marcarComoReembolsada(r.id, valor), `Reembolso de ${formatarPreco(valor, 2)} para ${r.cliente} registrado.`);
  }

  function cancelar(r) {
    setConfirmando(null);
    executar(r, () => cancelarReservaEmpresa(r), (c) =>
      c.reembolso === "pendente"
        ? `Reserva de ${r.cliente} cancelada. Ela estava paga: devolva o valor e marque o reembolso.`
        : `Reserva de ${r.cliente} cancelada. O horário voltou a ficar livre.`
    );
  }

  async function desbloquear(b) {
    try {
      await removerBloqueio(b.id);
      setToast("Bloqueio removido. O horário voltou para o site.");
    } catch (erro) {
      setToast(erro.message);
    }
    recarregarBloqueios();
  }

  return (
    <EmpresaLayout
      titulo="Reservas"
      subtitulo="Acompanhe quem reservou suas quadras"
      acoes={
        <button type="button" className="pn-botao" onClick={() => setNovoAberto(true)}>
          <Plus size={18} aria-hidden="true" /> Novo horário
        </button>
      }
    >
      <div className="pn-pilha">
        {/* ===== Horários bloqueados ===== */}
        {bloqueios?.length > 0 && (
          <section className="pn-card re-bloqueios" aria-labelledby="re-bloqueios-titulo">
            <h2 id="re-bloqueios-titulo">
              <Ban size={17} aria-hidden="true" /> Horários bloqueados
            </h2>
            <ul>
              {bloqueios.map((b) => (
                <li key={b.id}>
                  <span>
                    <strong>{formatarData(b.data, { weekday: "short", day: "2-digit", month: "2-digit" })}</strong> · {b.hora_inicio} às{" "}
                    {b.hora_fim} · {nomeQuadra(String(b.quadra_id))}
                  </span>
                  <span className="re-bloqueio-motivo">{b.motivo}</span>
                  <button type="button" className="re-acao" onClick={() => desbloquear(b)}>
                    Desbloquear
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== Filtros ===== */}
        <section className="pn-card re-filtros" aria-label="Filtros">
          <div className="pn-chips" role="group" aria-label="Período">
            {periodos.map((p) => (
              <button
                key={p.id}
                type="button"
                className="pn-chip"
                aria-pressed={periodo === p.id}
                onClick={() => mudarFiltro(setPeriodo)(p.id)}
              >
                {p.texto}
              </button>
            ))}
          </div>

          <div className="re-campos">
            <label className="re-busca">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar cliente"
                aria-label="Buscar por nome do cliente"
                value={busca}
                onChange={(e) => mudarFiltro(setBusca)(e.target.value)}
              />
            </label>
            <select aria-label="Quadra" value={quadra} onChange={(e) => mudarFiltro(setQuadra)(e.target.value)}>
              <option value="todas">Todas as quadras</option>
              {(quadras ?? []).map((q) => (
                <option key={q.id} value={q.id}>{q.nome}</option>
              ))}
            </select>
            <select aria-label="Situação" value={situacao} onChange={(e) => mudarFiltro(setSituacao)(e.target.value)}>
              {Object.entries(filtrosSituacao).map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ===== Resumo do filtro ===== */}
        <section className="re-resumo" aria-label="Resumo">
          <div>
            <CalendarDays size={18} aria-hidden="true" />
            <span><strong>{ativas.length}</strong> reservas</span>
          </div>
          <div>
            <Wallet size={18} aria-hidden="true" />
            <span><strong>{formatarPreco(totalValor)}</strong> no período</span>
          </div>
          <div className={pendentes.length ? "alerta" : ""}>
            <CircleAlert size={18} aria-hidden="true" />
            <span><strong>{pendentes.length}</strong> com pagamento pendente</span>
          </div>
        </section>

        {/* ===== Lista ===== */}
        {carregando && !reservas ? (
          <Esqueleto tipo="lista" quantidade={6} rotulo="Carregando reservas..." />
        ) : filtradas.length === 0 ? (
          <div className="pn-vazio">
            <CalendarDays size={40} aria-hidden="true" />
            <h3>Nenhuma reserva encontrada</h3>
            <p>Tente outro período ou limpe os filtros.</p>
          </div>
        ) : (
          <div className="re-grupos">
            {grupos.map((g) => (
              <section key={g.data} className="pn-card re-grupo" aria-label={formatarData(g.data, { weekday: "long", day: "numeric", month: "long" })}>
                <h2 className="re-dia">
                  {g.data === isoComDias(0) ? "Hoje" : formatarData(g.data, { weekday: "long" })}
                  <span>{formatarData(g.data, { day: "numeric", month: "long" })}</span>
                  <small>{g.itens.length} {g.itens.length === 1 ? "reserva" : "reservas"}</small>
                </h2>

                <ul className="re-lista">
                  {g.itens.map((r) => {
                    const v = visual[r.situacao === "confirmada" && !r.pago ? "aguardando" : r.situacao];
                    const podeCancelar = r.situacao === "confirmada";
                    const podePagar = !r.pago && r.situacao !== "cancelada";
                    return (
                      <li key={r.id} className={`re-item ${r.situacao}`}>
                        <time className="re-hora">
                          <strong>{r.hora}</strong>
                          <span>{fimReserva(r)}</span>
                        </time>

                        <div className="re-cliente">
                          <strong>{r.cliente}</strong>
                          <span>
                            {nomeQuadra(r.quadraId)} · {r.duracao}h
                            <span className="re-origem" title={r.origem === "app" ? "Reservado pelo app" : "Reservado no balcão"}>
                              {r.origem === "app" ? <Smartphone size={12} aria-hidden="true" /> : <Store size={12} aria-hidden="true" />}
                              {r.origem === "app" ? "App" : "Balcão"}
                            </span>
                          </span>
                        </div>

                        <div className="re-valor">
                          <strong>{formatarPreco(r.valor)}</strong>
                          <span className={r.reembolso === "pendente" ? "pendente" : r.pago && r.situacao !== "cancelada" ? "pago" : r.situacao === "cancelada" ? "" : "pendente"}>
                            {r.reembolso === "pendente"
                              ? "Reembolso pendente"
                              : r.reembolso === "feito"
                                ? `Reembolsado ${formatarPreco(r.valorReembolsado ?? r.valor)}`
                                : r.situacao === "cancelada"
                                  ? r.pagamento
                                  : r.pago
                                    ? `Pago · ${r.pagamento}`
                                    : "Pagamento pendente"}
                          </span>
                        </div>

                        <span className={`pn-status ${v.classe}`}>
                          <v.icone size={13} aria-hidden="true" />
                          {v.texto}
                        </span>

                        <div className="re-acoes">
                          {reembolsando?.id === r.id ? (
                            <form
                              className="re-confirmar re-reembolso"
                              role="alert"
                              onSubmit={(e) => {
                                e.preventDefault();
                                reembolsar(r);
                              }}
                            >
                              <label>
                                <span>Já devolveu ao cliente? Valor devolvido (R$)</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={r.valor}
                                  step="0.01"
                                  value={reembolsando.valor}
                                  onChange={(e) => setReembolsando({ id: r.id, valor: e.target.value })}
                                  autoFocus
                                />
                              </label>
                              <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setReembolsando(null)}>
                                Ainda não
                              </button>
                              <button type="submit" className="pn-botao">Sim, devolvi</button>
                            </form>
                          ) : confirmando === r.id ? (
                            <div className="re-confirmar" role="alert">
                              <span>Cancelar reserva?</span>
                              <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setConfirmando(null)}>
                                Não
                              </button>
                              <button type="button" className="pn-botao pn-botao-perigo" onClick={() => cancelar(r)}>
                                Sim
                              </button>
                            </div>
                          ) : processando === r.id ? (
                            <LoaderCircle size={18} className="re-girando" aria-label="Salvando" />
                          ) : (
                            <>
                              {podePagar && (
                                <button type="button" className="re-acao" onClick={() => pagar(r)}>
                                  <Wallet size={15} aria-hidden="true" /> Marcar pago
                                </button>
                              )}
                              {r.reembolso === "pendente" && (
                                <button type="button" className="re-acao" onClick={() => setReembolsando({ id: r.id, valor: String(r.valor) })}>
                                  <Undo2 size={15} aria-hidden="true" /> Marcar reembolsado
                                </button>
                              )}
                              {podeCancelar && (
                                <button type="button" className="re-acao perigo" onClick={() => setConfirmando(r.id)}>
                                  Cancelar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {visiveis < filtradas.length && (
              <button type="button" className="pn-botao pn-botao-contorno re-mais" onClick={() => setVisiveis((v) => v + POR_PAGINA)}>
                <Clock size={16} aria-hidden="true" /> Mostrar mais ({filtradas.length - visiveis} restantes)
              </button>
            )}
          </div>
        )}
      </div>

      <NovoHorario
        aberto={novoAberto}
        quadras={quadras}
        onFechar={() => setNovoAberto(false)}
        onConcluir={(mensagem) => {
          setNovoAberto(false);
          setToast(mensagem);
          recarregar();
          recarregarBloqueios();
        }}
      />
      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </EmpresaLayout>
  );
}
