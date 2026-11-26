// Avisos já lidos, guardados na conta (GET/POST /me/notificacoes-lidas).
// Compartilhado pelas notificações do jogador e da empresa.
import { api } from "./api.js";
import { aoTrocarConta } from "./sessaoService.js";

let lidas = null; // null = ainda não carregou
aoTrocarConta(() => {
  lidas = null;
});

export async function carregarLidas() {
  lidas = new Set(await api("/me/notificacoes-lidas"));
  return lidas;
}

/** Leitura imediata (vazia antes de carregar). */
export const lidasAtuais = () => lidas ?? new Set();

export async function marcarLidas(ids) {
  if (!ids.length) return lidasAtuais();
  lidas = new Set(await api("/me/notificacoes-lidas", { metodo: "POST", corpo: { ids } }));
  return lidas;
}
