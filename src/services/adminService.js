// =========================================================
// Serviço do PAINEL DO ADMIN
//
// API (só admin):
//   GET   /admin/resumo                         números gerais
//   GET   /admin/empresas, GET /admin/empresas/:id
//   POST  /admin/empresas                       cadastra empresa + responsável
//   PATCH /admin/empresas/:id                   edita, ativa/desativa
//   POST  /admin/empresas/:id/redefinir-senha   link (24 h) para o responsável criar senha nova
// =========================================================
import { api } from "./api.js";

export const resumoDoSistema = () => api("/admin/resumo");
export const listarEmpresas = () => api("/admin/empresas");
export const buscarEmpresa = (id) => api(`/admin/empresas/${id}`);

/** dados: { empresa, cnpj, responsavel, email, telefone, senha, endereco } */
export async function cadastrarEmpresa(dados) {
  const resposta = await api("/admin/empresas", { metodo: "POST", corpo: dados });
  return resposta.empresa;
}

/** dados: { nome?, cnpj?, telefone?, endereco?, ativo?, responsavel_nome?, responsavel_email? } */
export async function atualizarEmpresa(id, dados) {
  const resposta = await api(`/admin/empresas/${id}`, { metodo: "PATCH", corpo: dados });
  return resposta.empresa;
}

/** Devolve { link, email } para o admin repassar ao responsável. */
export const gerarLinkDeSenha = (id) => api(`/admin/empresas/${id}/redefinir-senha`, { metodo: "POST" });
