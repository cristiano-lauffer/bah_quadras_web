// =========================================================
// Serviço do PERFIL DA EMPRESA
//
// O perfil completo (endereço, contatos, horário de funcionamento, política
// de cancelamento...) ainda não existe na API: continua salvo no navegador.
// O nome da empresa, o responsável e o e-mail vêm da conta logada (API).
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const obterEmpresa = () => api("/empresa/perfil");
// =========================================================
import { empresaDemo } from "../data/empresa.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { sessaoAtual } from "./sessaoService.js";

const CHAVE = "bahquadras:empresa:perfil";

/** Dados que a conta de empresa logada já traz da API. */
function daConta() {
  const sessao = sessaoAtual();
  if (sessao?.tipo !== "empresa" || !sessao.empresa) return {};
  return { nome: sessao.empresa.nome, responsavel: sessao.nome, email: sessao.email };
}

/**
 * Leitura imediata (sem esperar), para dados pequenos usados em vários lugares
 * como o nome no menu lateral. Telas devem preferir obterEmpresa().
 */
export function empresaAtual() {
  return { ...(lerSalvo(CHAVE) ?? empresaDemo), ...daConta() };
}

export function obterEmpresa() {
  return responder(empresaAtual());
}

export function salvarEmpresa(dados) {
  const atualizada = { ...empresaAtual(), ...dados };
  salvar(CHAVE, atualizada);
  return responder(atualizada, 500);
}
