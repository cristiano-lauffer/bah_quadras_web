// =========================================================
// Serviço de QUADRAS FAVORITAS DO JOGADOR
//
// API: GET /favoritos, PUT e DELETE /favoritos/:quadraId (só jogador logado).
// Sem conta de jogador, a lista é vazia e favoritar pede para entrar.
// =========================================================
import { api } from "./api.js";
import { sessaoAtual } from "./sessaoService.js";

export const podeFavoritar = () => sessaoAtual()?.tipo === "usuario";

const comoTexto = (lista) => lista.map(String);

/** Ids das quadras favoritas (como texto, igual ao id da página pública). */
export async function listarFavoritos() {
  if (!podeFavoritar()) return [];
  return comoTexto(await api("/favoritos"));
}

/** Adiciona se não estiver na lista, remove se estiver. Devolve a lista atualizada. */
export async function alternarFavorito(id, jaFavorita) {
  const favorita = jaFavorita ?? (await listarFavoritos()).includes(String(id));
  return comoTexto(await api(`/favoritos/${id}`, { metodo: favorita ? "DELETE" : "PUT" }));
}

export async function removerFavorito(id) {
  return comoTexto(await api(`/favoritos/${id}`, { metodo: "DELETE" }));
}
