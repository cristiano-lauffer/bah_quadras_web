// =========================================================
// Serviço de AVALIAÇÕES NO PAINEL DA EMPRESA (e respostas da empresa)
//
// API (só empresa logada):
//   GET    /empresa/avaliacoes                avaliações das quadras dela
//   PUT    /empresa/avaliacoes/:id/resposta   { texto }
//   DELETE /empresa/avaliacoes/:id/resposta
// =========================================================
import { api } from "./api.js";
import { daApi } from "./avaliacoesService.js";
import { aoTrocarConta } from "./sessaoService.js";

// Últimas avaliações lidas (para as leituras imediatas do menu e do dashboard).
let ultimas = [];
aoTrocarConta(() => {
  ultimas = [];
});

/** Avaliações das quadras desta empresa, já com a resposta (se houver), mais recentes primeiro. */
export async function listarAvaliacoesDaEmpresa() {
  const lista = await api("/empresa/avaliacoes");
  ultimas = lista.map(daApi).sort((a, b) => b.data.localeCompare(a.data));
  return ultimas;
}

/** Quantas avaliações ainda não têm resposta (leitura imediata, usada no menu). */
export const contarSemResposta = () => ultimas.filter((a) => !a.resposta).length;

export async function responderAvaliacao(id, texto) {
  const { avaliacao } = await api(`/empresa/avaliacoes/${id}/resposta`, { metodo: "PUT", corpo: { texto: texto.trim() } });
  const atualizada = daApi(avaliacao);
  ultimas = ultimas.map((a) => (a.id === id ? atualizada : a));
  return atualizada.resposta;
}

export async function apagarResposta(id) {
  await api(`/empresa/avaliacoes/${id}/resposta`, { metodo: "DELETE" });
  ultimas = ultimas.map((a) => (a.id === id ? { ...a, resposta: null } : a));
  return true;
}

/**
 * Nota média e total de avaliações das quadras da empresa (leitura imediata,
 * depois de listarAvaliacoesDaEmpresa).
 */
export function resumoAvaliacoesDaEmpresa() {
  const total = ultimas.length;
  const media = total ? ultimas.reduce((soma, a) => soma + a.nota, 0) / total : null;
  return { media, total, recentes: ultimas };
}
