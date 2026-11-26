// =========================================================
// Serviço de DADOS DO JOGADOR (Meus dados e Configurações)
//
// API (qualquer conta logada):
//   GET /me, PATCH /me          dados, cidade, esportes, preferências e foto
//   PUT /me/senha               { senha_atual, nova_senha }
//   DELETE /me                  exclui a conta do jogador
// =========================================================
import { api } from "./api.js";
import { aoTrocarConta, renovarSessao, sair, sessaoAtual } from "./sessaoService.js";
import { enviarFoto } from "./uploadService.js";
import { mascaraTelefone } from "../utils/mascaras.js";

const PREFERENCIAS_PADRAO = { lembrete: true, confirmacao: true, novidades: false };

/** Conta da API -> formato das telas. */
function daApi(c) {
  return {
    nome: c.nome,
    email: c.email,
    telefone: c.telefone ? mascaraTelefone(c.telefone) : "",
    cidade: c.cidade ?? "",
    esportes: c.esportes ?? [],
    membroDesde: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : null,
    foto: c.foto_url ?? "",
    preferencias: { ...PREFERENCIAS_PADRAO, ...c.preferencias },
  };
}

let atual = null;
aoTrocarConta(() => {
  atual = null;
});

/** Dados do jogador logado (leitura imediata): os últimos lidos ou o que a sessão já sabe. */
export function dadosDoUsuario() {
  if (atual) return atual;
  const sessao = sessaoAtual();
  return {
    nome: sessao?.nome ?? "",
    email: sessao?.email ?? "",
    telefone: sessao?.telefone ? mascaraTelefone(sessao.telefone) : "",
    cidade: "",
    esportes: [],
    membroDesde: null,
    foto: sessao?.foto ?? "",
    preferencias: PREFERENCIAS_PADRAO,
  };
}

export async function carregarDadosDoUsuario() {
  atual = daApi(await api("/me"));
  return atual;
}

/** Salva Meus dados. dados: { nome, email, telefone, cidade, esportes, foto? } */
export async function salvarDadosDoUsuario(dados) {
  const corpo = {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    cidade: dados.cidade,
    esportes: dados.esportes,
  };
  if (dados.foto !== undefined) corpo.foto_url = (await enviarFoto(dados.foto)) || null;
  const resposta = await api("/me", { metodo: "PATCH", corpo });
  atual = daApi(resposta.conta);
  // Nome/e-mail novos aparecem na hora no cabeçalho e no menu.
  renovarSessao(resposta);
  return atual;
}

/** Troca a foto de perfil (data URL do arquivo escolhido). */
export async function salvarFoto(dataUrl) {
  const resposta = await api("/me", { metodo: "PATCH", corpo: { foto_url: await enviarFoto(dataUrl) } });
  atual = daApi(resposta.conta);
  renovarSessao(resposta); // a foto aparece no menu
  return atual;
}

export const preferenciasDoUsuario = () => dadosDoUsuario().preferencias;

export async function salvarPreferencias(preferencias) {
  const resposta = await api("/me", { metodo: "PATCH", corpo: { preferencias } });
  atual = daApi(resposta.conta);
  return atual.preferencias;
}

export async function trocarSenha(atualSenha, novaSenha) {
  await api("/me/senha", { metodo: "PUT", corpo: { senha_atual: atualSenha, nova_senha: novaSenha } });
}

/** Exclui a conta do jogador e sai. */
export async function excluirConta() {
  await api("/me", { metodo: "DELETE" });
  sair();
}
