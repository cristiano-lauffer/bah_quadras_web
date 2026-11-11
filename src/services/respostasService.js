// =========================================================
// Serviço de RESPOSTAS DA EMPRESA ÀS AVALIAÇÕES
//
// Hoje: respostas salvas no navegador (com duas de exemplo).
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const responderAvaliacao = (id, texto) => api.put(`/empresa/avaliacoes/${id}/resposta`, { texto });
// =========================================================
import { avaliacoes } from "../data/avaliacoes.js";
import { isoComDias } from "../utils/formatadores.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { idsPublicosDaEmpresa } from "./quadrasService.js";

const CHAVE = "bahquadras:empresa:respostas";

// Respostas de exemplo (por id da avaliação).
const exemplos = {
  1: {
    texto: "Obrigado, Mariana! Ficamos muito felizes que a galera curtiu. Esperamos vocês no próximo jogo!",
    data: isoComDias(-2),
  },
  3: {
    texto: "Valeu pelo retorno, Rafael! Estamos ampliando o estacionamento e a obra termina no mês que vem.",
    data: isoComDias(-14),
  },
};

const ler = () => lerSalvo(CHAVE) ?? exemplos;

/** Respostas de todas as avaliações: { [idAvaliacao]: { texto, data } } */
export function listarRespostas() {
  return responder(ler(), 150);
}

/** Avaliações das quadras desta empresa, já com a resposta (se houver). */
export function listarAvaliacoesDaEmpresa() {
  const ids = idsPublicosDaEmpresa();
  const respostas = ler();
  const lista = avaliacoes
    .filter((a) => ids.includes(a.quadraId))
    .map((a) => ({ ...a, resposta: respostas[a.id] ?? null }))
    .sort((a, b) => b.data.localeCompare(a.data));
  return responder(lista);
}

/** Quantas avaliações da empresa ainda não têm resposta (leitura imediata, usada no menu). */
export function contarSemResposta() {
  const ids = idsPublicosDaEmpresa();
  const respostas = ler();
  return avaliacoes.filter((a) => ids.includes(a.quadraId) && !respostas[a.id]).length;
}

export function responderAvaliacao(id, texto) {
  const resposta = { texto: texto.trim(), data: isoComDias(0) };
  salvar(CHAVE, { ...ler(), [id]: resposta });
  return responder(resposta, 400);
}

export function apagarResposta(id) {
  const { [id]: _removida, ...resto } = ler();
  salvar(CHAVE, resto);
  return responder(true, 300);
}
