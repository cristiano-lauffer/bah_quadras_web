// =========================================================
// Serviço do CATÁLOGO PÚBLICO DE QUADRAS (o que o jogador vê)
//
// Junta as quadras de demonstração (data/quadras.js) com as quadras das
// empresas cadastradas na API (GET /publico/quadras, sem login).
// As quadras da API têm id numérico ("3"); as de demonstração, um nome ("arena-sport").
// =========================================================
import { quadras as quadrasFixas } from "../data/quadras.js";
import { notaDaQuadra } from "./avaliacoesService.js";
import { api, ErroApi } from "./api.js";
import { modalidadeDoTipo } from "./quadrasService.js";

// Últimas quadras lidas da API (para as leituras imediatas).
let quadrasDaApi = [];

/**
 * "Av. Ipiranga, 6681 - Partenon, Porto Alegre/RS" -> { bairro: "Partenon", cidade: "Porto Alegre/RS" }
 * O endereço da empresa é um texto só; sem o " - " o bairro e a cidade ficam vazios.
 */
function separarEndereco(endereco) {
  const depoisDoNumero = (endereco ?? "").split(" - ").slice(1).join(" - ");
  const partes = depoisDoNumero.split(",").map((p) => p.trim()).filter(Boolean);
  if (partes.length >= 2) return { bairro: partes[0], cidade: partes.at(-1) };
  return { bairro: "", cidade: partes[0] ?? "" };
}

/** Converte uma quadra da API para o formato do catálogo público. */
function paraPublica(q) {
  const { bairro, cidade } = separarEndereco(q.empresa?.endereco);
  const modalidade = modalidadeDoTipo(q.tipo_quadra);
  return {
    id: String(q.id),
    nome: `${q.nome} · ${q.empresa.nome}`,
    modalidade,
    bairro: bairro || cidade,
    cidade,
    endereco: q.empresa.endereco ?? "",
    preco: q.valor_hora,
    descricao: q.descricao || `${modalidade} na ${q.empresa.nome}.`,
    imagens: q.imagem_url ? [q.imagem_url] : [],
    estrutura: q.comodidades ?? [],
    situacao: q.status, // "ativa" | "manutencao" (inativas não vêm da API)
    livresHoje: (q.horarios_livres ?? []).map((h) => h.hora_inicio),
    daEmpresa: true,
  };
}

const comNota = (q) => ({ ...q, ...notaDaQuadra(q.id) });

/** Lista completa (leitura imediata, com as quadras da API já carregadas). */
export function quadrasPublicas() {
  return [...quadrasFixas, ...quadrasDaApi].map(comNota);
}

/** Uma quadra do catálogo pelo id da página pública (leitura imediata). */
export const buscarQuadraPublica = (id) => quadrasPublicas().find((q) => q.id === String(id));

/**
 * Busca as quadras da API e devolve o catálogo completo.
 * Se a API estiver fora do ar, a Home continua mostrando as quadras de demonstração.
 */
export async function listarQuadrasPublicas() {
  try {
    const lista = await api("/publico/quadras", { publico: true });
    quadrasDaApi = lista.map(paraPublica);
  } catch (erro) {
    console.warn("Não foi possível carregar as quadras da API:", erro.message);
  }
  return quadrasPublicas();
}

/**
 * Uma quadra pelo id, mesmo que o catálogo ainda não tenha sido carregado
 * (ex.: alguém abriu o link /quadra/3 direto). Devolve null se não existir.
 */
export async function carregarQuadraPublica(id) {
  const ja = buscarQuadraPublica(id);
  if (ja || !/^\d+$/.test(String(id))) return ja ?? null;
  try {
    const quadra = paraPublica(await api(`/publico/quadras/${id}`, { publico: true }));
    quadrasDaApi = [...quadrasDaApi.filter((q) => q.id !== quadra.id), quadra];
    return comNota(quadra);
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

/** Modalidades presentes numa lista, sem repetição. */
export const modalidadesDe = (lista) => [...new Set(lista.map((q) => q.modalidade))];

/** Quadras que podem ser reservadas agora (as em manutenção ficam fora da Home). */
export const disponiveisParaReserva = (lista) => lista.filter((q) => !q.situacao || q.situacao === "ativa");
