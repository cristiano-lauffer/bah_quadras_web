import { Link } from "react-router-dom";
import {
  ArrowRight,
  CircleAlert,
  CircleX,
  Download,
  Receipt,
  Wallet,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import GraficoBarras from "../components/GraficoBarras.jsx";
import { useDados } from "../hooks/useDados.js";
import { historicoMensal } from "../data/empresa.js";
import { listarQuadras } from "../services/quadrasService.js";
import {
  fimReserva,
  formasPagamento,
  inicioReserva,
  listarReservasEmpresa,
} from "../services/reservasEmpresaService.js";
import { formatarData, formatarPreco, isoComDias } from "../utils/formatadores.js";
import "../css/FinanceiroEmpresa.css";
import Esqueleto from "../components/Esqueleto.jsx";

const formatarEixo = (v) => (v >= 1000 ? `${v / 1000} mil` : String(v));
const porcentagem = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

/** Gera e baixa um arquivo CSV (abre no Excel/Google Sheets). */
function baixarCsv(nomeArquivo, linhas) {
  const csv = linhas
    .map((linha) => linha.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }); // BOM: acentos certos no Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FinanceiroEmpresa() {
  const { dados: reservas, carregando } = useDados(listarReservasEmpresa);
  const { dados: quadras } = useDados(listarQuadras);

  const hoje = isoComDias(0);
  const inicioMes = `${hoje.slice(0, 8)}01`;
  const nomeMes = formatarData(hoje, { month: "long" });
  const agora = new Date();
  const nomeQuadra = (id) => quadras?.find((q) => q.id === id)?.nome ?? "Quadra";

  const doMes = (reservas ?? []).filter((r) => r.data >= inicioMes && r.data.slice(0, 7) === hoje.slice(0, 7));
  const validas = doMes.filter((r) => r.status !== "cancelada");
  const canceladas = doMes.filter((r) => r.status === "cancelada");
  const recebidas = validas.filter((r) => r.pago);
  const aReceber = validas.filter((r) => !r.pago);

  const soma = (lista) => lista.reduce((s, r) => s + r.valor, 0);
  const totalRecebido = soma(recebidas);
  const totalAReceber = soma(aReceber);
  const ticketMedio = validas.length ? soma(validas) / validas.length : 0;

  const porQuadra = (quadras ?? [])
    .map((q) => ({ id: q.id, nome: q.nome, valor: soma(validas.filter((r) => r.quadraId === q.id)) }))
    .filter((q) => q.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const totalQuadras = soma(validas);

  const porForma = formasPagamento.map((f) => ({ forma: f, valor: soma(recebidas.filter((r) => r.pagamento === f)) }));

  const ultimas = (reservas ?? [])
    .filter((r) => r.pago && r.status !== "cancelada" && inicioReserva(r) <= agora)
    .sort((a, b) => inicioReserva(b) - inicioReserva(a))
    .slice(0, 8);

  function exportar() {
    baixarCsv(`financeiro-${hoje.slice(0, 7)}.csv`, [
      ["Data", "Horário", "Cliente", "Quadra", "Valor", "Pagamento", "Situação"],
      ...doMes
        .sort((a, b) => inicioReserva(a) - inicioReserva(b))
        .map((r) => [
          formatarData(r.data, { day: "2-digit", month: "2-digit", year: "numeric" }),
          `${r.hora} às ${fimReserva(r)}`,
          r.cliente,
          nomeQuadra(r.quadraId),
          r.valor.toFixed(2).replace(".", ","),
          r.pagamento,
          r.status === "cancelada" ? "Cancelada" : r.pago ? "Pago" : "Pendente",
        ]),
    ]);
  }

  return (
    <EmpresaLayout
      titulo="Financeiro"
      subtitulo={`Resumo de ${nomeMes} até hoje e histórico dos últimos meses`}
      acoes={
        <button type="button" className="pn-botao pn-botao-contorno" onClick={exportar} disabled={!reservas}>
          <Download size={17} aria-hidden="true" /> Exportar {nomeMes} (CSV)
        </button>
      }
    >
      {carregando && !reservas ? (
        <div className="pn-pilha">
          <Esqueleto tipo="kpis" quantidade={4} rotulo="Carregando dados financeiros..." />
          <Esqueleto tipo="lista" quantidade={4} rotulo="" />
        </div>
      ) : (
        <div className="pn-pilha">
          {/* ===== Indicadores do mês ===== */}
          <section className="pn-kpis" aria-label={`Indicadores de ${nomeMes}`}>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">
                Recebido em {nomeMes}
                <span className="pn-kpi-icone" aria-hidden="true"><Wallet size={18} /></span>
              </div>
              <strong>{formatarPreco(totalRecebido)}</strong>
              <small>{recebidas.length} reservas pagas</small>
            </article>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">
                A receber
                <span className="pn-kpi-icone fi-icone-alerta" aria-hidden="true"><CircleAlert size={18} /></span>
              </div>
              <strong>{formatarPreco(totalAReceber)}</strong>
              <small>{aReceber.length} reservas com pagamento pendente</small>
            </article>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">
                Ticket médio
                <span className="pn-kpi-icone" aria-hidden="true"><Receipt size={18} /></span>
              </div>
              <strong>{formatarPreco(ticketMedio)}</strong>
              <small>por reserva</small>
            </article>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">
                Cancelamentos
                <span className="pn-kpi-icone fi-icone-erro" aria-hidden="true"><CircleX size={18} /></span>
              </div>
              <strong>{canceladas.length}</strong>
              <small>{formatarPreco(soma(canceladas))} que deixaram de entrar</small>
            </article>
          </section>

          <div className="pn-grade">
            {/* ===== Histórico ===== */}
            <section className="pn-card" aria-labelledby="fi-historico">
              <div className="pn-card-topo">
                <div>
                  <h2 id="fi-historico">Faturamento por mês</h2>
                  <p>Últimos 6 meses completos</p>
                </div>
              </div>
              <GraficoBarras
                dados={historicoMensal.map((d) => ({
                  rotulo: d.mes,
                  rotuloLongo: d.mesLongo,
                  valor: d.faturamento,
                  detalhe: `${d.reservas} reservas`,
                }))}
                formatar={(v) => formatarPreco(v)}
                formatarEixo={formatarEixo}
              />
            </section>

            {/* ===== Formas de pagamento ===== */}
            <section className="pn-card" aria-labelledby="fi-formas">
              <div className="pn-card-topo">
                <div>
                  <h2 id="fi-formas">Formas de pagamento</h2>
                  <p>Valores recebidos em {nomeMes}</p>
                </div>
              </div>
              <ul className="fi-barras">
                {porForma.map(({ forma, valor }) => (
                  <li key={forma}>
                    <div className="fi-barras-linha">
                      <span>{forma}</span>
                      <strong>{formatarPreco(valor)}</strong>
                      <small>{porcentagem(valor, totalRecebido)}%</small>
                    </div>
                    <div className="pn-progresso" aria-hidden="true">
                      <span style={{ width: `${porcentagem(valor, totalRecebido)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="pn-grade fi-grade-inferior">
            {/* ===== Por quadra ===== */}
            <section className="pn-card" aria-labelledby="fi-quadras">
              <div className="pn-card-topo">
                <div>
                  <h2 id="fi-quadras">Faturamento por quadra</h2>
                  <p>Reservas válidas de {nomeMes} (pagas e a receber)</p>
                </div>
              </div>
              {porQuadra.length ? (
                <ul className="fi-barras">
                  {porQuadra.map((q) => (
                    <li key={q.id}>
                      <div className="fi-barras-linha">
                        <span>{q.nome}</span>
                        <strong>{formatarPreco(q.valor)}</strong>
                        <small>{porcentagem(q.valor, totalQuadras)}%</small>
                      </div>
                      <div className="pn-progresso" aria-hidden="true">
                        <span style={{ width: `${porcentagem(q.valor, totalQuadras)}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pn-texto-suave">Nenhuma reserva neste mês ainda.</p>
              )}
            </section>

            {/* ===== Últimos recebimentos ===== */}
            <section className="pn-card" aria-labelledby="fi-ultimos">
              <div className="pn-card-topo">
                <div>
                  <h2 id="fi-ultimos">Últimos recebimentos</h2>
                  <p>Reservas pagas mais recentes</p>
                </div>
                <Link to="/empresa/reservas" className="pn-link">
                  Ver reservas <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
              <div className="fi-tabela-wrap">
                <table className="fi-tabela">
                  <thead>
                    <tr>
                      <th scope="col">Data</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Forma</th>
                      <th scope="col">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimas.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {formatarData(r.data, { day: "2-digit", month: "short" })}
                          <small>{r.hora}</small>
                        </td>
                        <td>
                          {r.cliente}
                          <small>{nomeQuadra(r.quadraId)}</small>
                        </td>
                        <td>{r.pagamento}</td>
                        <td>{formatarPreco(r.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="fi-nota">
            Valores de demonstração. Os números do histórico são os mesmos do Dashboard; os do mês atual vêm das reservas.
          </p>
        </div>
      )}
    </EmpresaLayout>
  );
}
