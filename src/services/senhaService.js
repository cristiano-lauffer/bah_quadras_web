// =========================================================
// Serviço de RECUPERAÇÃO DE SENHA
//
// Hoje: simula o envio do e-mail e a troca da senha (nada sai do navegador).
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const solicitarRecuperacao = (email) => api.post("/auth/esqueci-senha", { email });
//   export const redefinirSenha = (token, senha) => api.post("/auth/redefinir-senha", { token, senha });
// =========================================================
import { falhar, responder } from "./armazenamento.js";

// Na demonstração o "link do e-mail" usa este token.
export const TOKEN_DEMONSTRACAO = "demo";

/**
 * Pede o e-mail de recuperação. Por segurança, a resposta é a mesma
 * exista ou não uma conta com esse e-mail (não revela quem é cadastrado).
 */
export function solicitarRecuperacao(email) {
  return responder({ email, token: TOKEN_DEMONSTRACAO }, 900);
}

export function redefinirSenha(token, senha) {
  if (token !== TOKEN_DEMONSTRACAO) return falhar("Este link expirou ou já foi usado. Peça um novo.");
  return responder({ ok: true, tamanho: senha.length }, 900);
}
