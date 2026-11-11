import { useState } from "react";
import {
  CalendarDays,
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
import { useDados } from "../hooks/useDados.js";
import { listarQuadras } from "../services/quadrasService.js";
import {
  cancelarReservaEmpresa,
  fimReserva,
  inicioReserva,
  listarReservasEmpresa,
  marcarComoPaga,
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
  concluida: "Concluídas",
  cancelada: "Canceladas",
};

const visual = {
  confirmada: { texto: "Confirmada", classe: "ok", icone: CircleCheck },
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

  async function pagar(r) {
    setProcessando(r.id);
    await marcarComoPaga(r.id);
    setProcessando(null);
    recarregar();
    setToast(`Pagamento de ${r.cliente} registrado.`);
  }

  async function cancelar(r) {
    setConfirmando(null);
    setProcessando(r.id);
    await cancelarReservaEmpresa(r);
    setProcessando(null);
    recarregar();
    setToast(`Reserva de ${r.cliente} cancelada. O horário voltou a ficar livre.`);
  }

  return (
    <EmpresaLayout titulo="Reservas" subtitulo="Acompanhe quem reservou suas quadras">
      <div className="pn-pilha">
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
                    const v = visual[r.situacao];
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
                          <span className={r.pago ? "pago" : r.situacao === "cancelada" ? "" : "pendente"}>
                            {r.situacao === "cancelada" ? r.pagamento : r.pago ? `Pago · ${r.pagamento}` : "Pagamento pendente"}
                          </span>
                        </div>

                        <span className={`pn-status ${v.classe}`}>
                          <v.icone size={13} aria-hidden="true" />
                          {v.texto}
                        </span>

                        <div className="re-acoes">
                          {confirmando === r.id ? (
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

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </EmpresaLayout>
  );
}
