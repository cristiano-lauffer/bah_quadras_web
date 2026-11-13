// =========================================================
// Serviço de SESSÃO (quem está logado)
//
// Hoje: login de demonstração. Qualquer e-mail válido entra como jogador;
// o e-mail da empresa de demonstração entra no painel da empresa.
// "Manter conectado" guarda a sessão no localStorage; sem ele, só até fechar
// a aba (sessionStorage).
// Com o backend (branch feature/US1-auth): troque o corpo de entrar() pela
// chamada à API e guarde o token devolvido. O resto do site (Header, painéis,
// Login) só usa as funções daqui e o hook useSessao, então não muda.
// =========================================================
import { usuarioDemo } from "../data/usuario.js";
import { empresaAtual } from "./empresaService.js";
import { responder } from "./armazenamento.js";
import { iniciais } from "../utils/formatadores.js";

const CHAVE = "bahquadras:sessao";
const ouvintes = new Set();
let atual; // cache em memória (undefined = ainda não lido)

/** Contas de demonstração mostradas na tela de login. */
export const contasDemo = {
  jogador: { email: usuarioDemo.email, rotulo: "Jogador" },
  empresa: { email: empresaAtual().email, rotulo: "Empresa" },
};

function ler() {
  for (const armazem of ["sessionStorage", "localStorage"]) {
    try {
      const texto = window[armazem].getItem(CHAVE);
      if (texto) return JSON.parse(texto);
    } catch {
      /* sem acesso ao armazenamento: segue sem sessão salva */
    }
  }
  return null;
}

function gravar(sessao, lembrar) {
  for (const armazem of ["sessionStorage", "localStorage"]) {
    try {
      window[armazem].removeItem(CHAVE);
    } catch {
      /* ignora */
    }
  }
  if (sessao) {
    try {
      window[lembrar ? "localStorage" : "sessionStorage"].setItem(CHAVE, JSON.stringify(sessao));
    } catch {
      /* fica só em memória */
    }
  }
  atual = sessao;
  ouvintes.forEach((avisar) => avisar());
}

function montarSessao(tipo, { nome, email }) {
  return { tipo, nome, email, avatar: tipo === "empresa" ? empresaAtual().logo : iniciais(nome) };
}

/* ---------------- Funções públicas ---------------- */

/** Sessão atual (leitura imediata) ou null. */
export function sessaoAtual() {
  if (atual === undefined) atual = ler();
  return atual;
}

/** Usado pelo hook useSessao para atualizar a tela quando alguém entra ou sai. */
export function observarSessao(avisar) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

// Entrou ou saiu em outra aba (sessão com "Manter conectado", no localStorage):
// relê a sessão para esta aba também atualizar o cabeçalho e as áreas protegidas.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== CHAVE && e.key !== null) return; // null = o armazenamento todo foi limpo
    atual = ler();
    ouvintes.forEach((avisar) => avisar());
  });
}

/**
 * Entra na conta. Devolve a sessão criada.
 * Com o backend: const { data } = await api.post("/auth/login", { email, senha });
 */
export async function entrar(email, _senha, lembrar = false) {
  const limpo = email.trim().toLowerCase();
  const empresa = empresaAtual();
  const sessao =
    limpo === empresa.email.toLowerCase()
      ? montarSessao("empresa", { nome: empresa.nome, email: empresa.email })
      : montarSessao("usuario", { nome: usuarioDemo.nome, email: limpo });
  await responder(null, 900);
  gravar(sessao, lembrar);
  return sessao;
}

/** Entra logo depois do cadastro, com o nome que a pessoa digitou. */
export function entrarAposCadastro({ nome, email }) {
  const sessao = montarSessao("usuario", { nome: nome.trim(), email: email.trim().toLowerCase() });
  gravar(sessao, false);
  return sessao;
}

/** Atualiza nome/e-mail da sessão (ex.: depois de editar "Meus dados"). */
export function atualizarSessao({ nome, email }) {
  const sessao = sessaoAtual();
  if (!sessao) return;
  let lembrar = false;
  try {
    lembrar = Boolean(window.localStorage.getItem(CHAVE));
  } catch {
    /* ignora */
  }
  gravar({ ...montarSessao(sessao.tipo, { nome: nome.trim(), email: email.trim().toLowerCase() }) }, lembrar);
}

// Onde e quando a pessoa clicou em "Sair" (para a área protegida mostrar o aviso certo).
let saida = { pagina: null, em: 0 };

/** Sai da conta. paginaAtual: a página do painel onde a pessoa clicou em "Sair". */
export function sair(paginaAtual = null) {
  saida = { pagina: paginaAtual, em: Date.now() };
  gravar(null);
}

/** Acabou de sair estando nesta página? */
export const acabouDeSair = (pagina) => saida.pagina === pagina && Date.now() - saida.em < 3000;

/** Página inicial de cada tipo de conta depois do login. */
export const inicioDaConta = (sessao) => (sessao?.tipo === "empresa" ? "/empresa/dashboard" : "/usuario/perfil");
