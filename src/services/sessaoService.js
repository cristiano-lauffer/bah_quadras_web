// =========================================================
// Serviço de SESSÃO (quem está logado)
//
// Login e cadastro vão para a API (POST /auth/login e /auth/register).
// A sessão guarda o token devolvido, que o api.js manda em toda chamada.
// "Manter conectado" guarda a sessão no localStorage; sem ele, só até fechar
// a aba (sessionStorage).
// O resto do site (Header, painéis, Login) só usa as funções daqui e o hook
// useSessao.
// =========================================================
import { api, configurarSessaoDaApi } from "./api.js";
import { iniciais } from "../utils/formatadores.js";

const CHAVE = "bahquadras:sessao";
const ouvintes = new Set();
let atual; // cache em memória (undefined = ainda não lido)

// Sessão de antes da integração com a API (sem token): não vale mais.
const sessaoValida = (sessao) => Boolean(sessao?.token && sessao?.tipo);

function ler() {
  for (const armazem of ["sessionStorage", "localStorage"]) {
    try {
      const texto = window[armazem].getItem(CHAVE);
      if (texto) {
        const sessao = JSON.parse(texto);
        return sessaoValida(sessao) ? sessao : null;
      }
    } catch {
      /* sem acesso ao armazenamento: segue sem sessão salva */
    }
  }
  return null;
}

function estaLembrada() {
  try {
    return Boolean(window.localStorage.getItem(CHAVE));
  } catch {
    return false;
  }
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

/**
 * Converte a resposta da API ({ token, usuario }) na sessão usada pelo site.
 * tipo: "usuario" (jogador), "empresa" ou "admin", como nas rotas /usuario, /empresa e /admin.
 */
function montarSessao({ token, usuario }) {
  const tipo = usuario.papel === "empresa" ? "empresa" : usuario.papel === "admin" ? "admin" : "usuario";
  return {
    tipo,
    papel: usuario.papel,
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone ?? null,
    empresa: usuario.empresa ?? null, // { id, nome } para contas de empresa
    foto: usuario.foto_url ?? null,
    avatar: iniciais(tipo === "empresa" && usuario.empresa ? usuario.empresa.nome : usuario.nome),
    token,
  };
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

/**
 * Avisa quando a CONTA muda (entrou, saiu ou trocou de conta), mas não quando só o nome
 * ou o e-mail da mesma conta mudam. Os serviços usam para limpar o que guardam em memória.
 */
export function aoTrocarConta(limpar) {
  let contaAnterior = sessaoAtual()?.id ?? null;
  return observarSessao(() => {
    const conta = sessaoAtual()?.id ?? null;
    if (conta !== contaAnterior) {
      contaAnterior = conta;
      limpar();
    }
  });
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

/** Entra na conta pela API. Devolve a sessão criada. */
export async function entrar(email, senha, lembrar = false) {
  const resposta = await api("/auth/login", { metodo: "POST", corpo: { email: email.trim(), senha }, publico: true });
  const sessao = montarSessao(resposta);
  gravar(sessao, lembrar);
  return sessao;
}

/**
 * Cria a conta de jogador na API e já entra nela (a API devolve o token no cadastro).
 * dados: { nome, email, telefone, senha }
 */
export async function cadastrar({ nome, email, telefone, senha }) {
  const resposta = await api("/auth/register", {
    metodo: "POST",
    corpo: { nome: nome.trim(), email: email.trim(), telefone, senha },
    publico: true,
  });
  const sessao = montarSessao(resposta);
  gravar(sessao, false);
  return sessao;
}

/**
 * Troca a sessão pela resposta nova da API ({ token, usuario }), mantendo o "Manter conectado".
 * Usado depois de editar "Meus dados" ou o perfil da empresa (o token leva nome e e-mail).
 */
export function renovarSessao(resposta) {
  if (!sessaoAtual()) return;
  gravar(montarSessao(resposta), estaLembrada());
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
export const inicioDaConta = (sessao) =>
  sessao?.tipo === "empresa" ? "/empresa/dashboard" : sessao?.tipo === "admin" ? "/admin" : "/usuario/perfil";

// O api.js manda o token desta sessão e, se ele expirar, encerra a sessão.
configurarSessaoDaApi({
  token: () => sessaoAtual()?.token ?? null,
  expirou: () => sair(),
});
