import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  CircleDot,
  ExternalLink,
  Gauge,
  Plus,
  Star,
  Table2,
  Wallet,
  Wrench,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import { agendaHoje, empresaDemo, historicoMensal, quadrasEmpresa } from "../data/empresa.js";
import { buscarQuadraPorId } from "../data/quadras.js";
import { useDados } from "../hooks/useDados.js";
import { listarQuadras } from "../services/quadrasService.js";
import { avaliacoesDaQuadra } from "../data/avaliacoes.js";
import { corDoNome, formatarNota, formatarPreco, iniciais, tempoRelativo } from "../utils/formatadores.js";
import "../css/DashboardEmpresa.css";

const metricas = {
  faturamento: { texto: "Faturamento", formatar: (v) => formatarPreco(v), eixo: (v) => (v >= 1000 ? `${v / 1000} mil` : String(v)) },
  reservas: { texto: "Reservas", formatar: (v) => `${v} reservas`, eixo: (v) => String(v) },
};

const quadraPublica = buscarQuadraPorId("arena-sport");
const avaliacoesRecentes = avaliacoesDaQuadra("arena-sport")
  .sort((a, b) => b.data.localeCompare(a.data))
  .slice(0, 3);


const atual = historicoMensal.at(-1);
const anterior = historicoMensal.at(-2);
const variacao = (a, b) => ((a - b) / b) * 100;

const paraMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const horaFim = (r) => `${String(Number(r.hora.slice(0, 2)) + r.duracao).padStart(2, "0")}:00`;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// Escolhe um topo "redondo" para o eixo Y (ex.: 12.740 -> 15.000).
function eixoBonito(maximo, divisoes = 4) {
  const bruto = maximo / divisoes;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto);
  const topo = Math.ceil(maximo / passo) * passo;
  return { topo, marcas: Array.from({ length: topo / passo + 1 }, (_, i) => i * passo) };
}

function situacaoReserva(r, agoraMin) {
  const inicio = paraMinutos(r.hora);
  const fim = inicio + r.duracao * 60;
  if (fim <= agoraMin) return { classe: "neutro", texto: "Concluída", icone: CircleCheck };
  if (inicio <= agoraMin) return { classe: "info", texto: "Em andamento", icone: CircleDot };
  if (!r.pago) return { classe: "alerta", texto: "Pagamento pendente", icone: CircleAlert };
  return { classe: "ok", texto: "Confirmada", icone: CircleCheck };
}

function Variacao({ valor, sufixo = "%" }) {
  const sobe = valor >= 0;
  const Icone = sobe ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`pn-variacao ${sobe ? "sobe" : "desce"}`}>
      <Icone size={14} aria-hidden="true" />
      {sobe ? "+" : "−"}
      {Math.abs(valor).toFixed(1).replace(".", ",")}
      {sufixo}
    </span>
  );
}

export default function DashboardEmpresa() {
  // Quadras vêm do serviço (refletem cadastros/edições); os dados iniciais evitam a tela "piscar".
  const { dados } = useDados(listarQuadras);
  const quadras = dados ?? quadrasEmpresa;
  const quadrasAtivas = quadras.filter((q) => q.status === "ativa");
  const ocupacaoMedia = quadrasAtivas.length
    ? Math.round(quadrasAtivas.reduce((s, q) => s + q.ocupacao, 0) / quadrasAtivas.length)
    : 0;
  const nomeQuadra = (id) => quadras.find((q) => q.id === id)?.nome ?? "Quadra";

  const [metrica, setMetrica] = useState("faturamento");
  const [verTabela, setVerTabela] = useState(false);

  const agora = new Date();
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  const agenda = agendaHoje
    .map((r) => ({ ...r, situacao: situacaoReserva(r, agoraMin) }))
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const proximaId = agenda.find((r) => paraMinutos(r.hora) > agoraMin)?.id;
  const pendentes = agenda.filter((r) => r.situacao.classe === "alerta");
  const emManutencao = quadras.filter((q) => q.status === "manutencao");
  const receitaHoje = agendaHoje.reduce((s, r) => s + r.valor, 0);

  const dataHoje = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <EmpresaLayout
      titulo="Dashboard"
      subtitulo={`${saudacao()}, ${empresaDemo.responsavel.split(" ")[0]} · ${dataHoje}`}
      acoes={
        <>
          <Link to={`/quadra/${quadraPublica.id}`} className="pn-botao pn-botao-contorno">
            <ExternalLink size={17} aria-hidden="true" /> Ver página pública
          </Link>
          <Link to="/empresa/quadras/nova" className="pn-botao">
            <Plus size={18} aria-hidden="true" /> Nova quadra
          </Link>
        </>
      }
    >
      <div className="pn-pilha">
        {/* ===== Avisos ===== */}
        {(pendentes.length > 0 || emManutencao.length > 0) && (
          <div className="db-avisos" role="status">
            {pendentes.length > 0 && (
              <p>
                <CircleAlert size={18} aria-hidden="true" />
                <span>
                  <strong>{pendentes.length} {pendentes.length === 1 ? "reserva" : "reservas"} de hoje</strong> ainda
                  {pendentes.length === 1 ? " está" : " estão"} com pagamento pendente.
                </span>
              </p>
            )}
            {emManutencao.map((q) => (
              <p key={q.id}>
                <Wrench size={18} aria-hidden="true" />
                <span>
                  <strong>{q.nome}</strong> está em manutenção e não aparece para reserva.
                </span>
              </p>
            ))}
          </div>
        )}

        {/* ===== Indicadores ===== */}
        <section className="pn-kpis" aria-label="Indicadores">
          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Faturamento em {atual.mes}
              <span className="pn-kpi-icone" aria-hidden="true"><Wallet size={18} /></span>
            </div>
            <strong>{formatarPreco(atual.faturamento)}</strong>
            <small>
              <Variacao valor={variacao(atual.faturamento, anterior.faturamento)} /> vs. {anterior.mes}
            </small>
          </article>

          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Reservas em {atual.mes}
              <span className="pn-kpi-icone" aria-hidden="true"><CalendarCheck size={18} /></span>
            </div>
            <strong>{atual.reservas}</strong>
            <small>
              <Variacao valor={variacao(atual.reservas, anterior.reservas)} /> vs. {anterior.mes}
            </small>
          </article>

          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Ocupação média
              <span className="pn-kpi-icone" aria-hidden="true"><Gauge size={18} /></span>
            </div>
            <strong>{ocupacaoMedia}%</strong>
            <small>dos horários das {quadrasAtivas.length} quadras ativas</small>
          </article>

          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Avaliação média
              <span className="pn-kpi-icone" aria-hidden="true"><Star size={18} /></span>
            </div>
            <strong>{formatarNota(quadraPublica.avaliacao)}</strong>
            <small>em {quadraPublica.quantidadeAvaliacoes} avaliações</small>
          </article>
        </section>

        <div className="pn-grade">
          {/* ===== Gráfico ===== */}
          <section className="pn-card" aria-labelledby="db-grafico-titulo">
            <div className="pn-card-topo">
              <div>
                <h2 id="db-grafico-titulo">{metricas[metrica].texto} por mês</h2>
                <p>Últimos 6 meses completos</p>
              </div>
              <div className="db-controles">
                <div className="db-segmentado" role="group" aria-label="Escolher métrica">
                  {Object.entries(metricas).map(([chave, { texto }]) => (
                    <button
                      key={chave}
                      type="button"
                      aria-pressed={metrica === chave}
                      onClick={() => setMetrica(chave)}
                    >
                      {texto}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="db-icone-botao"
                  aria-pressed={verTabela}
                  onClick={() => setVerTabela((v) => !v)}
                  title={verTabela ? "Ver gráfico" : "Ver como tabela"}
                  aria-label={verTabela ? "Ver gráfico" : "Ver como tabela"}
                >
                  <Table2 size={18} />
                </button>
              </div>
            </div>

            {verTabela ? (
              <TabelaMensal />
            ) : (
              <GraficoBarras dados={historicoMensal} chave={metrica} config={metricas[metrica]} />
            )}
          </section>

          {/* ===== Agenda de hoje ===== */}
          <section className="pn-card" aria-labelledby="db-agenda-titulo">
            <div className="pn-card-topo">
              <div>
                <h2 id="db-agenda-titulo">Agenda de hoje</h2>
                <p>
                  {agenda.length} reservas · {formatarPreco(receitaHoje)} previstos
                </p>
              </div>
            </div>

            <ol className="db-agenda">
              {agenda.map((r) => {
                const Icone = r.situacao.icone;
                return (
                  <li key={r.id} className={`db-agenda-item ${r.id === proximaId ? "proxima" : ""} ${r.situacao.classe === "neutro" ? "passada" : ""}`}>
                    <time className="db-agenda-hora">
                      <strong>{r.hora}</strong>
                      <span>{horaFim(r)}</span>
                    </time>
                    <div className="db-agenda-info">
                      <strong>{r.cliente}</strong>
                      <span>
                        {nomeQuadra(r.quadraId)} · {formatarPreco(r.valor)}
                      </span>
                      {r.id === proximaId && <span className="db-agenda-proxima">Próxima</span>}
                    </div>
                    <span className={`pn-status ${r.situacao.classe}`}>
                      <Icone size={13} aria-hidden="true" />
                      {r.situacao.texto}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <div className="pn-grade db-grade-inferior">
          {/* ===== Ocupação por quadra ===== */}
          <section className="pn-card" aria-labelledby="db-ocupacao-titulo">
            <div className="pn-card-topo">
              <div>
                <h2 id="db-ocupacao-titulo">Ocupação por quadra</h2>
                <p>Percentual de horários reservados nos últimos 30 dias</p>
              </div>
              <Link to="/empresa/quadras" className="pn-link">Gerenciar quadras</Link>
            </div>

            <ul className="db-ocupacao">
              {quadras.filter((q) => q.status !== "inativa").map((q) => (
                <li key={q.id}>
                  <img src={q.imagem} alt="" loading="lazy" />
                  <div className="db-ocupacao-info">
                    <div className="db-ocupacao-linha">
                      <strong>{q.nome}</strong>
                      {q.status === "ativa" ? (
                        <span className="db-ocupacao-valor">{q.ocupacao}%</span>
                      ) : (
                        <span className="pn-status alerta">
                          <Wrench size={13} aria-hidden="true" /> Em manutenção
                        </span>
                      )}
                    </div>
                    <span className="pn-texto-suave">
                      {q.modalidade} · {formatarPreco(q.preco)}/h
                    </span>
                    {q.status === "ativa" && (
                      <div
                        className="pn-progresso"
                        role="progressbar"
                        aria-valuenow={q.ocupacao}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Ocupação de ${q.nome}`}
                      >
                        <span style={{ width: `${q.ocupacao}%` }} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== Avaliações recentes ===== */}
          <section className="pn-card" aria-labelledby="db-avaliacoes-titulo">
            <div className="pn-card-topo">
              <div>
                <h2 id="db-avaliacoes-titulo">Avaliações recentes</h2>
                <p>O que os jogadores estão dizendo</p>
              </div>
              <Link to={`/avaliacoes/${quadraPublica.id}`} className="pn-link">Ver todas</Link>
            </div>

            <ul className="db-avaliacoes">
              {avaliacoesRecentes.map((a) => (
                <li key={a.id}>
                  <div className="db-avaliacao-topo">
                    <span className="pn-avatar" style={{ background: corDoNome(a.nome) }} aria-hidden="true">
                      {iniciais(a.nome)}
                    </span>
                    <div>
                      <strong>{a.nome}</strong>
                      <span className="db-estrelas" role="img" aria-label={`${a.nota} de 5 estrelas`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} className={n <= a.nota ? "on" : ""} aria-hidden="true" />
                        ))}
                      </span>
                    </div>
                    <time dateTime={a.data}>{tempoRelativo(a.data)}</time>
                  </div>
                  <p>{a.texto}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </EmpresaLayout>
  );
}

/* ================================================================
   Gráfico de barras (uma série, um eixo)
   ================================================================ */

function GraficoBarras({ dados, chave, config }) {
  const { topo, marcas } = eixoBonito(Math.max(...dados.map((d) => d[chave])));
  const ultimo = dados.length - 1;

  return (
    <div className="db-grafico">
      <div className="db-grafico-area">
        {/* Linhas de grade e valores do eixo */}
        {marcas.map((m) => (
          <div key={m} className="db-grafico-grade" style={{ bottom: `${(m / topo) * 100}%` }}>
            <span>{config.eixo(m)}</span>
          </div>
        ))}

        <div className="db-grafico-colunas">
          {dados.map((d, i) => {
            const valor = d[chave];
            const outra = chave === "faturamento" ? metricas.reservas.formatar(d.reservas) : metricas.faturamento.formatar(d.faturamento);
            return (
              <div key={d.mes} className="db-coluna">
                <button
                  type="button"
                  className="db-coluna-alvo"
                  aria-label={`${d.mesLongo}: ${config.formatar(valor)}`}
                >
                  <span className="db-barra" style={{ height: `${(valor / topo) * 100}%` }}>
                    {i === ultimo && <span className="db-barra-rotulo">{config.formatar(valor)}</span>}
                  </span>
                  <span className="db-dica" role="tooltip">
                    <strong>{d.mesLongo}</strong>
                    <span>{config.formatar(valor)}</span>
                    <small>{outra}</small>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="db-grafico-meses" aria-hidden="true">
        {dados.map((d) => (
          <span key={d.mes}>{d.mes}</span>
        ))}
      </div>
    </div>
  );
}

function TabelaMensal() {
  return (
    <div className="db-tabela-wrap">
      <table className="db-tabela">
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Faturamento</th>
            <th scope="col">Reservas</th>
            <th scope="col">Ticket médio</th>
          </tr>
        </thead>
        <tbody>
          {historicoMensal.map((d) => (
            <tr key={d.mes}>
              <th scope="row">{d.mesLongo}</th>
              <td>{formatarPreco(d.faturamento)}</td>
              <td>{d.reservas}</td>
              <td>{formatarPreco(d.faturamento / d.reservas, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
