// =========================================================
// Serviço de NOTIFICAÇÕES DA EMPRESA
//
// Os avisos são montados a partir dos dados reais da API: reservas novas,
// cancelamentos e pagamentos pendentes (GET /empresa/reservas) e avaliações
// novas (GET /empresa/avaliacoes). O que foi lido fica salvo na conta.
// =========================================================
import { listarReservasEmpresa, reservasEmpresaAtuais } from "./reservasEmpresaService.js";
import { listarAvaliacoesDaEmpresa, resumoAvaliacoesDaEmpresa } from "./respostasService.js";
import { quadrasDaEmpresaAtual } from "./quadrasService.js";
import { carregarLidas, lidasAtuais, marcarLidas } from "./notificacoesLidas.js";
import { formatarData } from "../utils/formatadores.js";

const DIA = 24 * 3_600_000;
const JANELA = 14 * DIA; // avisos das últimas 2 semanas

const nomeQuadra = (id) => quadrasDaEmpresaAtual().find((q) => q.id === id)?.nome ?? "uma quadra";
const quando = (r) => `${formatarData(r.data, { weekday: "short", day: "2-digit", month: "2-digit" })} às ${r.hora}`;

function gerar() {
  const agora = Date.now();
  const recente = (iso) => iso && agora - new Date(iso) <= JANELA;
  const lista = [];

  for (const r of reservasEmpresaAtuais()) {
    if (r.origem === "app" && recente(r.criadaEm)) {
      lista.push({
        id: `reserva-${r.id}`,
        tipo: "reserva",
        titulo: "Nova reserva",
        texto: `${r.cliente} reservou ${nomeQuadra(r.quadraId)} para ${quando(r)}.`,
        quando: new Date(r.criadaEm).toISOString(),
        link: "/empresa/reservas",
      });
    }
    if (r.status === "cancelada" && recente(r.canceladaEm)) {
      lista.push({
        id: `cancelada-${r.id}`,
        tipo: "cancelamento",
        titulo: "Reserva cancelada",
        texto: `A reserva de ${r.cliente} em ${nomeQuadra(r.quadraId)} (${quando(r)}) foi cancelada. O horário voltou a ficar livre.`,
        quando: new Date(r.canceladaEm).toISOString(),
        link: "/empresa/reservas",
      });
    }
    // Jogo de hoje ou que já passou e ainda não foi pago
    const inicio = new Date(`${r.data}T${r.hora}:00`);
    if (r.status !== "cancelada" && !r.pago && inicio <= new Date(agora + 3 * 3_600_000) && agora - inicio <= 3 * DIA) {
      lista.push({
        id: `pagamento-${r.id}`,
        tipo: "pagamento",
        titulo: "Pagamento pendente",
        texto: `A reserva de ${r.cliente} (${quando(r)}) ainda não foi paga.`,
        quando: inicio.toISOString(),
        link: "/empresa/reservas",
      });
    }
  }

  for (const a of resumoAvaliacoesDaEmpresa().recentes) {
    if (!recente(a.data)) continue;
    lista.push({
      id: `avaliacao-${a.id}`,
      tipo: "avaliacao",
      titulo: "Nova avaliação",
      texto: `${a.nome} deu ${a.nota} ${a.nota === 1 ? "estrela" : "estrelas"}: “${a.texto.slice(0, 70)}${a.texto.length > 70 ? "…" : ""}”`,
      quando: a.data,
      link: "/empresa/avaliacoes",
    });
  }

  for (const q of quadrasDaEmpresaAtual().filter((x) => x.status === "manutencao")) {
    lista.push({
      id: `manutencao-${q.id}`,
      tipo: "sistema",
      titulo: `${q.nome} em manutenção`,
      texto: "Lembre-se de reativar a quadra quando a manutenção terminar.",
      quando: new Date(agora - DIA).toISOString(),
      link: "/empresa/quadras",
    });
  }

  return lista.sort((a, b) => b.quando.localeCompare(a.quando));
}

/** Busca os dados na API (reservas, avaliações e o que já foi lido). */
export async function carregarNotificacoes() {
  await Promise.all([listarReservasEmpresa(), listarAvaliacoesDaEmpresa(), carregarLidas()]);
  return gerar();
}

export async function listarNotificacoes() {
  const lista = await carregarNotificacoes();
  const lidas = lidasAtuais();
  return lista.map((n) => ({ ...n, lida: lidas.has(n.id) }));
}

/** Quantidade de não lidas (leitura imediata, usada no menu). */
export function contarNaoLidas() {
  const lidas = lidasAtuais();
  return gerar().filter((n) => !lidas.has(n.id)).length;
}

export async function marcarComoLida(id) {
  await marcarLidas([id]);
  return { id, lida: true };
}

export async function marcarTodasComoLidas() {
  await marcarLidas(gerar().map((n) => n.id));
  return true;
}
