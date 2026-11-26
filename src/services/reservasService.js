// =========================================================
// Serviço de RESERVAS DO JOGADOR
//
// API (só jogador logado):
//   GET  /reservas                 reservas do jogador
//   POST /reservas                 { quadra_id, data, hora_inicio, duracao | baterias, forma_pagamento }
//   PATCH /reservas/:id            remarca: { data, hora_inicio, duracao | baterias }
//   POST /reservas/:id/cancelar
// A API confere grade, conflito, bloqueio e horário passado; se alguém reservar
// o mesmo horário antes, ela responde 409 e a tela mostra a mensagem.
// =========================================================
import { api } from "./api.js";
import { nomeNaVitrine } from "./catalogoService.js";
import { modalidadeDoTipo } from "./quadrasService.js";
import { aoTrocarConta, sessaoAtual } from "./sessaoService.js";
import { somarMinutos } from "../utils/formatadores.js";

const dataIso = (valor) => (valor ? new Date(valor).toISOString() : undefined);

/** Reserva da API -> formato das telas. */
function daApi(r) {
  const empresa = r.quadra.empresa;
  const local = [empresa.bairro, empresa.cidade].filter(Boolean).join(", ");
  return {
    id: r.id,
    quadraId: String(r.quadra.id),
    quadra: nomeNaVitrine(r.quadra.nome, empresa.nome),
    imagem: r.quadra.imagem_url ?? "",
    modalidade: modalidadeDoTipo(r.quadra.tipo_quadra),
    endereco: local || empresa.endereco || "",
    data: r.data,
    hora: r.hora_inicio,
    duracao: r.duracao_horas,
    ...(r.baterias && { baterias: r.baterias, minutosBateria: r.minutos_bateria }),
    valor: r.valor_total,
    pagamento: r.forma_pagamento,
    pago: r.pago,
    status: r.status === "CANCELADA" ? "cancelada" : "confirmada",
    canceladaPor: r.cancelada_por,
    reembolso: r.reembolso, // null | "pendente" | "feito"
    valorReembolsado: r.valor_reembolsado,
    contatoEmpresa: empresa.whatsapp || empresa.telefone || null,
    empresa: empresa.nome,
    criadaEm: dataIso(r.criada_em),
    canceladaEm: dataIso(r.cancelada_em),
    remarcadaEm: dataIso(r.remarcada_em),
    anterior: r.anterior ? { data: r.anterior.data, hora: r.anterior.hora_inicio } : null,
  };
}

// Últimas reservas lidas (para as leituras imediatas: menu, notificações, remarcação).
let ultimas = [];
aoTrocarConta(() => {
  ultimas = [];
});
const guardar = (reserva) => {
  ultimas = [reserva, ...ultimas.filter((r) => r.id !== reserva.id)];
  return reserva;
};

/* ---------------- Funções públicas ---------------- */

/** Leitura imediata (sem esperar), usada por contadores do menu e notificações. */
export const reservasAtuais = () => ultimas;

export async function listarReservas() {
  if (sessaoAtual()?.tipo !== "usuario") return [];
  ultimas = (await api("/reservas")).map(daApi);
  return ultimas;
}

/** Corpo do pedido: kart manda baterias; as outras quadras, as horas. */
const pedido = ({ data, hora, duracao, baterias }) => ({
  data,
  hora_inicio: hora,
  ...(baterias ? { baterias } : { duracao }),
});

/** dados: { quadraId, data, hora, duracao, baterias?, pagamento } */
export async function criarReserva(dados) {
  const { reserva } = await api("/reservas", {
    metodo: "POST",
    corpo: { quadra_id: Number(dados.quadraId), forma_pagamento: dados.pagamento, ...pedido(dados) },
  });
  return guardar(daApi(reserva));
}

/** Uma reserva pelo id (leitura imediata, das últimas carregadas). */
export const buscarReserva = (id) => ultimas.find((r) => String(r.id) === String(id));

/** Busca a reserva na API se ela ainda não foi carregada (ex.: link de remarcação aberto direto). */
export async function carregarReserva(id) {
  if (buscarReserva(id)) return buscarReserva(id);
  await listarReservas();
  return buscarReserva(id) ?? null;
}

/** Troca o dia/horário (e a duração) de uma reserva confirmada. novos: { data, hora, duracao, baterias? } */
export async function remarcarReserva(id, novos) {
  const { reserva } = await api(`/reservas/${id}`, { metodo: "PATCH", corpo: pedido(novos) });
  return guardar(daApi(reserva));
}

/** Cancela. Devolve { reserva, mensagem } (a mensagem avisa quando há reembolso a combinar). */
export async function cancelarReserva(id) {
  const { reserva, mensagem } = await api(`/reservas/${id}/cancelar`, { metodo: "POST" });
  return { reserva: guardar(daApi(reserva)), mensagem };
}

/** Prazo da política: com menos horas que isso até o jogo, só a empresa cancela ou remarca. */
export const HORAS_PRAZO_CANCELAMENTO = 24;

/** O jogador ainda pode cancelar ou remarcar sozinho? */
export const podeAlterarSozinho = (r, agora = new Date()) =>
  r.status === "confirmada" && inicioDaReserva(r) - agora >= HORAS_PRAZO_CANCELAMENTO * 3_600_000;

/**
 * Horários da grade ocupados numa data (reservas ativas e bloqueios do banco).
 * ignorarId: ao remarcar, o horário atual da própria reserva conta como livre.
 */
export async function horariosOcupados(quadraId, data, ignorarId = null) {
  const q = await api(`/publico/quadras/${quadraId}?data=${data}`, { publico: true });
  const dia = new Date(`${data}T12:00:00`).getDay();
  const livres = new Set(q.horarios_livres.map((h) => h.hora_inicio));
  let ocupados = q.grade.filter((s) => s.dia_semana === dia && !livres.has(s.hora_inicio)).map((s) => s.hora_inicio);

  const propria = ignorarId ? buscarReserva(ignorarId) : null;
  if (propria && propria.data === data && propria.status === "confirmada") {
    const horas = Array.from({ length: propria.duracao }, (_, i) => `${String(Number(propria.hora.slice(0, 2)) + i).padStart(2, "0")}:00`);
    ocupados = ocupados.filter((h) => !horas.includes(h));
  }
  return ocupados;
}

/* ---------------- Ajudantes de exibição ---------------- */

export const inicioDaReserva = (r) => new Date(`${r.data}T${r.hora}:00`);
export const fimDaReserva = (r) =>
  r.baterias
    ? somarMinutos(r.hora, r.baterias * (r.minutosBateria ?? 15))
    : `${String(Number(r.hora.slice(0, 2)) + r.duracao).padStart(2, "0")}:00`;

/** Separa a lista em próximas, histórico e números do jogador. */
export function separarReservas(lista) {
  const agora = new Date();
  const proximas = lista
    .filter((r) => r.status === "confirmada" && inicioDaReserva(r) >= agora)
    .sort((a, b) => inicioDaReserva(a) - inicioDaReserva(b));
  const historico = lista
    .filter((r) => !proximas.includes(r))
    .map((r) => (r.status === "confirmada" ? { ...r, status: "concluida" } : r))
    .sort((a, b) => inicioDaReserva(b) - inicioDaReserva(a));
  const concluidas = historico.filter((r) => r.status === "concluida");
  const horasJogadas = concluidas.reduce((soma, r) => soma + r.duracao, 0);
  return { proximas, historico, concluidas, horasJogadas };
}
