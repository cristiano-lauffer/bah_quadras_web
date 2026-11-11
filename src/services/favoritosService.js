// =========================================================
// Serviço de QUADRAS FAVORITAS DO JOGADOR
//
// Hoje: lista de ids salva no navegador (começa com os favoritos do usuário de demonstração).
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const alternarFavorito = (id) => api.post(`/usuario/favoritos/${id}`);
// =========================================================
import { usuarioDemo } from "../data/usuario.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";

const CHAVE = "bahquadras:usuario:favoritos";
const ler = () => lerSalvo(CHAVE) ?? usuarioDemo.favoritos;

/** Ids das quadras favoritas. */
export function listarFavoritos() {
  return responder(ler(), 100);
}

/** Adiciona se não estiver na lista, remove se estiver. Devolve a lista atualizada. */
export function alternarFavorito(id) {
  const atual = ler();
  const nova = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id];
  salvar(CHAVE, nova);
  return responder(nova, 100);
}

export function removerFavorito(id) {
  const nova = ler().filter((x) => x !== id);
  salvar(CHAVE, nova);
  return responder(nova, 100);
}
