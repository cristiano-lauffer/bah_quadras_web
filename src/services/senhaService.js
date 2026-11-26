// =========================================================
// Serviço de RECUPERAÇÃO DE SENHA
//
// API: POST /auth/esqueci-senha { email } e POST /auth/redefinir-senha { token, senha }.
// Ainda não há envio de e-mail: a API escreve o link no console dela e, em
// desenvolvimento, devolve o link (link_dev) para a tela mostrar o botão.
// =========================================================
import { api } from "./api.js";

/**
 * Pede o link de recuperação. A resposta é a mesma exista ou não uma conta
 * com esse e-mail (não revela quem é cadastrado).
 * Devolve { email, link } — link só vem em desenvolvimento e quando a conta existe.
 */
export async function solicitarRecuperacao(email) {
  const resposta = await api("/auth/esqueci-senha", { metodo: "POST", corpo: { email }, publico: true });
  let link = null;
  if (resposta.link_dev) {
    // O link aponta para o front configurado na API; aqui só interessa o caminho.
    const url = new URL(resposta.link_dev);
    link = `${url.pathname}${url.search}`;
  }
  return { email, link, validade: resposta.validade_minutos };
}

export async function redefinirSenha(token, senha) {
  await api("/auth/redefinir-senha", { metodo: "POST", corpo: { token, senha }, publico: true });
  return { ok: true };
}
