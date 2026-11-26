// =========================================================
// Serviço de RESERVAS RECEBIDAS PELA EMPRESA
//
// API (só empresa logada):
//   GET  /empresa/reservas                 últimos 90 dias e próximos 60
//   POST /empresa/reservas                 reserva de balcão { quadra_id, cliente_nome, data, hora_inicio, duracao }
//   POST /empresa/reservas/:id/pagar       pagamento recebido (combinado pelo WhatsApp)
//   POST /empresa/reservas/:id/cancelar    (também some da lista do jogador)
// =========================================================
import { api } from "./api.js";
import { aoTrocarConta } from "./sessaoService.js";

export const formasPagamento = ["Pix", "Cartão", "Dinheiro"];

/** Reserva da API -> formato das telas da empresa. */
function daApi(r) {
  return {
    id: r.id,
    data: r.data,
    hora: r.hora_inicio,
    duracao: r.duracao_horas,
    ...(r.baterias && { baterias: r.baterias, minutosBateria: r.minutos_bateria }),
    quadraId: String(r.quadra.id),
    cliente: r.cliente,
    telefone: r.cliente_telefone,
    valor: r.valor_total ?? 0,
    pagamento: r.forma_pagamento ?? "Pix",
    pago: r.pago,
    status: r.status === "CANCELADA" ? "cancelada" : "confirmada",
    canceladaPor: r.cancelada_por,
    reembolso: r.reembolso, // null | "pendente" | "feito"
    valorReembolsado: r.valor_reembolsado,
    origem: r.origem,
    criadaEm: r.criada_em,
    canceladaEm: r.cancelada_em,
  };
}

// Últimas reservas lidas (notificações e dashboard).
let ultimas = [];
aoTrocarConta(() => {
  ultimas = [];
});

/* ---------------- Funções públicas ---------------- */

export async function listarReservasEmpresa() {
  ultimas = (await api("/empresa/reservas")).map(daApi);
  return ultimas;
}

/** Leitura imediata das últimas reservas carregadas. */
export const reservasEmpresaAtuais = () => ultimas;

export async function marcarComoPaga(id) {
  const { reserva } = await api(`/empresa/reservas/${id}/pagar`, { metodo: "POST" });
  return daApi(reserva);
}

export async function cancelarReservaEmpresa(reserva) {
  const resposta = await api(`/empresa/reservas/${reserva.id}/cancelar`, { metodo: "POST" });
  return daApi(resposta.reserva);
}

/** Registra que a empresa já devolveu o dinheiro. valor: quanto devolveu (o resto ela reteve). */
export async function marcarComoReembolsada(id, valor) {
  const { reserva } = await api(`/empresa/reservas/${id}/reembolso`, { metodo: "POST", corpo: { valor } });
  return daApi(reserva);
}

/** Valor que a empresa ficou de uma reserva paga e cancelada (0 se devolveu tudo ou ainda não resolveu). */
export const valorRetido = (r) =>
  r.status === "cancelada" && r.reembolso === "feito" ? Math.max(0, r.valor - (r.valorReembolsado ?? r.valor)) : 0;

/* ---------------- Bloqueios de horário ---------------- */

export const listarBloqueios = () => api("/empresa/bloqueios");

/** dados: { quadraId, data, horaInicio, horaFim, motivo } */
export async function criarBloqueio({ quadraId, data, horaInicio, horaFim, motivo }) {
  const { bloqueio } = await api("/empresa/bloqueios", {
    metodo: "POST",
    corpo: { quadra_id: Number(quadraId), data, hora_inicio: horaInicio, hora_fim: horaFim, motivo },
  });
  return bloqueio;
}

export const removerBloqueio = (id) => api(`/empresa/bloqueios/${id}`, { metodo: "DELETE" });

/** Reserva feita no balcão (presencial ou por telefone). dados: { quadraId, cliente, data, hora, duracao, pagamento } */
export async function criarReservaBalcao({ quadraId, cliente, data, hora, duracao, pagamento }) {
  const { reserva } = await api("/empresa/reservas", {
    metodo: "POST",
    corpo: { quadra_id: Number(quadraId), cliente_nome: cliente, data, hora_inicio: hora, duracao, forma_pagamento: pagamento },
  });
  return daApi(reserva);
}

/* ---------------- Ajudantes ---------------- */

export const inicioReserva = (r) => new Date(`${r.data}T${r.hora}:00`);
export const fimReserva = (r) => `${String(Number(r.hora.slice(0, 2)) + r.duracao).padStart(2, "0")}:00`;

/** Situação para exibir: confirmada, em andamento, concluída, cancelada. */
export function situacaoReserva(r, agora = new Date()) {
  if (r.status === "cancelada") return "cancelada";
  const inicio = inicioReserva(r);
  const fim = new Date(inicio.getTime() + r.duracao * 3_600_000);
  if (fim <= agora) return "concluida";
  if (inicio <= agora) return "andamento";
  return "confirmada";
}

/**
 * Números por mês a partir das reservas (faturamento = reservas não canceladas).
 * Devolve os "meses" mais recentes, do mais antigo para o atual.
 */
export function historicoMensal(lista, meses = 6) {
  const hoje = new Date();
  return Array.from({ length: meses }, (_, i) => {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1 - i), 1);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    const doMes = lista.filter((r) => r.status !== "cancelada" && r.data.startsWith(chave));
    return {
      chave,
      mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      mesLongo: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
      mesNome: data.toLocaleDateString("pt-BR", { month: "long" }),
      // Faturamento = reservas não canceladas + o que a empresa reteve de reservas pagas e canceladas
      faturamento:
        doMes.reduce((s, r) => s + r.valor, 0) +
        lista.filter((r) => r.data.startsWith(chave)).reduce((s, r) => s + valorRetido(r), 0),
      reservas: doMes.length,
    };
  });
}
