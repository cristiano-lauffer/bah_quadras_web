// =========================================================
// Serviço de AVALIAÇÕES DAS QUADRAS (lado do jogador e páginas públicas)
//
// API:
//   GET    /publico/quadras/:id/avaliacoes   lista pública, com a resposta da empresa
//   GET    /avaliacoes/minhas                as do jogador logado + as que ele marcou como úteis
//   POST   /avaliacoes                       publica
//   DELETE /avaliacoes/:id                   apaga a própria
//   PUT/DELETE /avaliacoes/:id/util          marca/desmarca como útil
// A nota média de cada quadra vem pronta no catálogo (catalogoService).
// =========================================================
import { api } from "./api.js";
import { aoTrocarConta, sessaoAtual } from "./sessaoService.js";

const ehJogador = () => sessaoAtual()?.tipo === "usuario";
const dataIso = (valor) => (valor ? new Date(valor).toISOString() : null);

/** Avaliação da API -> formato das telas. */
export function daApi(a) {
  return {
    id: a.id,
    quadraId: String(a.quadra_id),
    nome: a.autor_nome,
    nota: a.nota,
    aspectos: a.aspectos ?? [],
    texto: a.texto,
    util: a.util ?? 0,
    data: dataIso(a.created_at),
    propria: Boolean(a.usuario_id) && a.usuario_id === sessaoAtual()?.id,
    resposta: a.resposta ? { texto: a.resposta, data: dataIso(a.resposta_em) } : null,
  };
}

// Avaliações do jogador logado (para "já avaliou?", leitura imediata).
let minhas = null; // null = ainda não carregou
let uteis = new Set();
aoTrocarConta(() => {
  minhas = null;
  uteis = new Set();
});

/** Carrega as avaliações do jogador logado (e as que ele marcou como úteis). */
export async function carregarMinhasAvaliacoes() {
  if (!ehJogador()) {
    minhas = [];
    uteis = new Set();
    return minhas;
  }
  const resposta = await api("/avaliacoes/minhas");
  minhas = resposta.avaliacoes.map(daApi);
  uteis = new Set(resposta.uteis);
  return minhas;
}

/** As avaliações 5 estrelas mais úteis (depoimentos da Home). */
export async function listarDepoimentos() {
  return (await api("/publico/depoimentos", { publico: true })).map(daApi);
}

/** Avaliações de uma quadra. */
export async function listarAvaliacoesDaQuadra(quadraId) {
  const [lista] = await Promise.all([
    api(`/publico/quadras/${quadraId}/avaliacoes`, { publico: true }),
    minhas === null ? carregarMinhasAvaliacoes().catch(() => []) : null,
  ]);
  return lista.map(daApi);
}

/** O jogador já avaliou esta quadra? (leitura imediata, depois de carregarMinhasAvaliacoes) */
export const jaAvaliou = (quadraId) => (minhas ?? []).some((a) => a.quadraId === String(quadraId));

/** O jogador marcou esta avaliação como útil? (leitura imediata) */
export const marcouUtil = (id) => uteis.has(id);

/** Publica a avaliação do jogador. dados: { quadraId, nota, nome, aspectos, texto } */
export async function publicarAvaliacao({ quadraId, nota, nome, aspectos, texto }) {
  const { avaliacao } = await api("/avaliacoes", {
    metodo: "POST",
    corpo: { quadra_id: Number(quadraId), nota, autor_nome: nome, aspectos, texto },
  });
  const nova = daApi(avaliacao);
  minhas = [nova, ...(minhas ?? [])];
  return nova;
}

/** Apaga uma avaliação publicada pelo jogador. */
export async function apagarAvaliacao(id) {
  await api(`/avaliacoes/${id}`, { metodo: "DELETE" });
  minhas = (minhas ?? []).filter((a) => a.id !== id);
  return true;
}

/** Marca ou desmarca como útil. Devolve { util, marcada }. */
export async function alternarUtil(id) {
  const marcar = !uteis.has(id);
  const { avaliacao } = await api(`/avaliacoes/${id}/util`, { metodo: marcar ? "PUT" : "DELETE" });
  if (marcar) uteis.add(id);
  else uteis.delete(id);
  return { util: avaliacao.util, marcada: marcar };
}
