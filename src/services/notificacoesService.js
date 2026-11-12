// =========================================================
// Serviço de NOTIFICAÇÕES DA EMPRESA
//
// Hoje: avisos de demonstração com horários relativos a agora; o que foi lido
// fica salvo no navegador.
// Com o backend: troque por chamadas à API (ou por notificações em tempo real).
// =========================================================
import { avaliacoesDaQuadra } from "./avaliacoesService.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";

const CHAVE = "bahquadras:empresa:notificacoes-lidas";

const minutosAtras = (min) => new Date(Date.now() - min * 60_000).toISOString();

function gerar() {
  const avaliacao = avaliacoesDaQuadra("arena-sport").sort((a, b) => b.data.localeCompare(a.data))[0];
  return [
    { id: "n1", tipo: "reserva", titulo: "Nova reserva", texto: "Mariana Costa reservou o Campo Society 1 para hoje, das 18:00 às 19:00.", quando: minutosAtras(12), link: "/empresa/reservas" },
    { id: "n2", tipo: "pagamento", titulo: "Pagamento pendente", texto: "A reserva de João da Silva hoje às 19:00 ainda não foi paga.", quando: minutosAtras(45), link: "/empresa/reservas" },
    { id: "n3", tipo: "cancelamento", titulo: "Reserva cancelada", texto: "Diego Santos cancelou a Quadra Coberta de amanhã às 20:00. O horário voltou a ficar livre.", quando: minutosAtras(130), link: "/empresa/reservas" },
    { id: "n4", tipo: "avaliacao", titulo: "Nova avaliação", texto: `${avaliacao.nome} deu ${avaliacao.nota} estrelas: “${avaliacao.texto.slice(0, 70)}…”`, quando: minutosAtras(60 * 5), link: "/empresa/avaliacoes" },
    { id: "n5", tipo: "reserva", titulo: "Nova reserva", texto: "Pelada de Quinta reservou o Campo Society 2 por 2 horas.", quando: minutosAtras(60 * 9), link: "/empresa/reservas" },
    { id: "n6", tipo: "sistema", titulo: "Arena de Areia em manutenção", texto: "Lembre-se de reativar a quadra quando a manutenção terminar.", quando: minutosAtras(60 * 26), link: "/empresa/quadras" },
    { id: "n7", tipo: "financeiro", titulo: "Resumo do mês anterior", texto: "Seu faturamento cresceu em relação ao mês anterior. Veja os detalhes no Financeiro.", quando: minutosAtras(60 * 24 * 3), link: "/empresa/financeiro" },
    { id: "n8", tipo: "avaliacao", titulo: "Responda às avaliações", texto: "Responder avaliações aumenta a confiança de novos jogadores.", quando: minutosAtras(60 * 24 * 6), link: "/empresa/avaliacoes" },
  ];
}

const notificacoes = gerar();
const lidas = () => lerSalvo(CHAVE) ?? ["n6", "n7", "n8"];

export function listarNotificacoes() {
  const jaLidas = lidas();
  return responder(notificacoes.map((n) => ({ ...n, lida: jaLidas.includes(n.id) })));
}

/** Quantidade de não lidas (leitura imediata, usada no menu). */
export function contarNaoLidas() {
  const jaLidas = lidas();
  return notificacoes.filter((n) => !jaLidas.includes(n.id)).length;
}

export function marcarComoLida(id) {
  salvar(CHAVE, [...new Set([...lidas(), id])]);
  return responder({ id, lida: true }, 100);
}

export function marcarTodasComoLidas() {
  salvar(CHAVE, notificacoes.map((n) => n.id));
  return responder(true, 200);
}
