// =========================================================
// Cliente HTTP da API (repositório bah_quadras_api)
//
// Endereço da API: variável VITE_API_URL do arquivo .env (veja .env.example).
// Sem ela, usa http://localhost:3000, o padrão do "npm run dev" da API.
//
// Os serviços (quadrasService, catalogoService, sessaoService...) chamam só
// esta função. Ela manda o token de quem está logado, transforma o
// { "erro": "..." } da API em um Error com a mensagem e, se o token
// expirar, encerra a sessão.
// =========================================================

const URL_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

// O sessaoService informa como ler o token e o que fazer quando ele expira.
// (Assim este arquivo não importa o sessaoService e não cria um import circular.)
let lerToken = () => null;
let aoExpirar = () => {};

export function configurarSessaoDaApi({ token, expirou }) {
  lerToken = token;
  aoExpirar = expirou;
}

/** Erro devolvido pela API. "status" é o código HTTP (0 = servidor fora do ar). */
export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

/**
 * Chama a API e devolve o JSON da resposta.
 *   api("/quadras")
 *   api("/quadras", { metodo: "POST", corpo: { nome: "Society 1" } })
 *   api("/publico/quadras", { publico: true })   // sem token
 */
export async function api(caminho, { metodo = "GET", corpo, publico = false } = {}) {
  const token = publico ? null : lerToken();
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi("Não foi possível falar com o servidor. Confira sua conexão e tente de novo.", 0);
  }

  const texto = await resposta.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    /* resposta sem JSON (ex.: página de erro do servidor) */
  }

  if (!resposta.ok) {
    // Token vencido ou inválido: sai da conta para a pessoa entrar de novo.
    if (resposta.status === 401 && token) {
      aoExpirar();
      throw new ErroApi("Sua sessão expirou. Entre novamente.", 401);
    }
    throw new ErroApi(dados?.erro ?? `O servidor respondeu com erro (${resposta.status}). Tente de novo.`, resposta.status);
  }
  return dados;
}
