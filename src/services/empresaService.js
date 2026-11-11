// =========================================================
// Serviço do PERFIL DA EMPRESA
//
// Hoje: dados de demonstração salvos no navegador.
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const obterEmpresa = () => api.get("/empresa/perfil").then(r => r.data);
// =========================================================
import { empresaDemo } from "../data/empresa.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";

const CHAVE = "bahquadras:empresa:perfil";

/**
 * Leitura imediata (sem esperar), para dados pequenos usados em vários lugares
 * como o nome no menu lateral. Telas devem preferir obterEmpresa().
 */
export function empresaAtual() {
  return lerSalvo(CHAVE) ?? empresaDemo;
}

export function obterEmpresa() {
  return responder(empresaAtual());
}

export function salvarEmpresa(dados) {
  const atualizada = { ...empresaAtual(), ...dados };
  salvar(CHAVE, atualizada);
  return responder(atualizada, 500);
}
