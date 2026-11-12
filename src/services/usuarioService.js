// =========================================================
// Serviço de DADOS DO JOGADOR (Meus dados e Configurações)
//
// Hoje: o que o jogador edita fica salvo no navegador, separado por e-mail
// (assim duas contas de demonstração no mesmo navegador não se misturam).
// Com o backend: troque por chamadas à API, por exemplo:
//   export const salvarDadosDoUsuario = (dados) => api.put("/usuarios/eu", dados);
// =========================================================
import { usuarioDemo } from "../data/usuario.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { atualizarSessao, sessaoAtual } from "./sessaoService.js";

const PREFERENCIAS_PADRAO = { lembrete: true, confirmacao: true, novidades: false };

const contaAtual = () => {
  const sessao = sessaoAtual();
  return sessao?.tipo === "usuario" ? sessao : null;
};
const chave = (tipo) => `bahquadras:usuario:${tipo}:${contaAtual()?.email ?? usuarioDemo.email}`;

/** Dados do jogador logado (leitura imediata): salvos > sessão > demonstração. */
export function dadosDoUsuario() {
  const conta = contaAtual();
  const base = conta ? { ...usuarioDemo, nome: conta.nome, email: conta.email } : usuarioDemo;
  return { ...base, ...lerSalvo(chave("dados")) };
}

export function salvarDadosDoUsuario(dados) {
  const chaveAntiga = chave("dados");
  salvar(chaveAntiga, dados);
  // Nome/e-mail novos aparecem na hora no cabeçalho e no menu.
  if (contaAtual()) {
    atualizarSessao({ nome: dados.nome, email: dados.email });
    salvar(chave("dados"), dados); // se o e-mail mudou, a chave muda junto
  }
  return responder(dados, 400);
}

export const preferenciasDoUsuario = () => ({ ...PREFERENCIAS_PADRAO, ...lerSalvo(chave("preferencias")) });

export function salvarPreferencias(preferencias) {
  salvar(chave("preferencias"), preferencias);
  return responder(preferencias, 150);
}
