// =========================================================
// Serviço de AVALIAÇÕES DAS QUADRAS
//
// Hoje: as avaliações de exemplo (data/avaliacoes.js) + as que o jogador
// publica, guardadas no navegador. A nota de cada quadra é calculada daqui,
// então uma avaliação nova já muda a nota na Home, nos Detalhes e no painel
// da empresa.
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const publicarAvaliacao = (dados) => api.post(`/quadras/${dados.quadraId}/avaliacoes`, dados);
// =========================================================
import { avaliacoes as exemplos } from "../data/avaliacoes.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { isoComDias } from "../utils/formatadores.js";

const CHAVE = "bahquadras:usuario:avaliacoes";

const publicadas = () => lerSalvo(CHAVE) ?? [];

/** Todas as avaliações (leitura imediata): as publicadas pelo jogador vêm primeiro. */
export const todasAvaliacoes = () => [...publicadas(), ...exemplos];

export const avaliacoesDaQuadra = (quadraId) => todasAvaliacoes().filter((a) => a.quadraId === quadraId);

/** O jogador já avaliou esta quadra? */
export const jaAvaliou = (quadraId) => publicadas().some((a) => a.quadraId === quadraId);

/**
 * Nota média e quantidade de avaliações de uma quadra.
 * Sem avaliações: { avaliacao: null, quantidadeAvaliacoes: 0 } (a quadra aparece como "Nova").
 */
export function notaDaQuadra(quadraId) {
  const lista = avaliacoesDaQuadra(quadraId);
  if (!lista.length) return { avaliacao: null, quantidadeAvaliacoes: 0 };
  return {
    avaliacao: lista.reduce((soma, a) => soma + a.nota, 0) / lista.length,
    quantidadeAvaliacoes: lista.length,
  };
}

/** Publica a avaliação do jogador. dados: { quadraId, nota, nome, aspectos, texto } */
export function publicarAvaliacao(dados) {
  const nova = { ...dados, id: Date.now(), data: isoComDias(0), util: 0, propria: true };
  salvar(CHAVE, [nova, ...publicadas()]);
  return responder(nova, 500);
}

/** Apaga uma avaliação publicada pelo jogador. */
export function apagarAvaliacao(id) {
  salvar(CHAVE, publicadas().filter((a) => a.id !== id));
  return responder(true, 300);
}
