// =========================================================
// Serviço do CATÁLOGO PÚBLICO DE QUADRAS (o que o jogador vê)
//
// Tudo vem da API (GET /publico/quadras, sem login): quadras ativas e em
// manutenção das empresas cadastradas, com nota média, fotos e os horários
// livres de hoje. O id da página pública (/quadra/:id) é o id da quadra no banco.
// =========================================================
import { api, ErroApi } from "./api.js";
import { modalidadeDoTipo } from "./quadrasService.js";

// Últimas quadras lidas da API (para as leituras imediatas).
let quadrasDaApi = [];

/**
 * "Av. Ipiranga, 6681 - Partenon, Porto Alegre/RS" -> { bairro: "Partenon", cidade: "Porto Alegre/RS" }
 * Usado quando a empresa ainda não informou bairro e cidade no perfil.
 */
function separarEndereco(endereco) {
  const depoisDoNumero = (endereco ?? "").split(" - ").slice(1).join(" - ");
  const partes = depoisDoNumero.split(",").map((p) => p.trim()).filter(Boolean);
  if (partes.length >= 2) return { bairro: partes[0], cidade: partes.at(-1) };
  return { bairro: "", cidade: partes[0] ?? "" };
}

/**
 * Nome mostrado no site: "Society 1 · Arena Central".
 * Quando a quadra já leva o nome da empresa ("Arena Sport", "RGM Academy - Futebol 7"), fica só ele.
 */
export function nomeNaVitrine(nomeQuadra, nomeEmpresa) {
  if (!nomeEmpresa) return nomeQuadra;
  const igual = (a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;
  if (igual(nomeQuadra, nomeEmpresa) || nomeQuadra.toLowerCase().startsWith(nomeEmpresa.toLowerCase())) return nomeQuadra;
  return `${nomeQuadra} · ${nomeEmpresa}`;
}

/** Converte uma quadra da API para o formato do catálogo público. */
export function paraPublica(q) {
  const separado = separarEndereco(q.empresa?.endereco);
  const cidade = q.empresa?.cidade || separado.cidade;
  const bairro = q.empresa?.bairro || separado.bairro || cidade;
  const modalidade = modalidadeDoTipo(q.tipo_quadra);
  return {
    id: String(q.id),
    nome: nomeNaVitrine(q.nome, q.empresa?.nome),
    modalidade,
    bairro,
    cidade,
    endereco: q.empresa?.endereco ?? "",
    mapa: q.mapa || undefined,
    preco: q.valor_hora,
    destaque: Boolean(q.destaque),
    descricao: q.descricao || `${modalidade} na ${q.empresa?.nome}.`,
    imagens: q.imagens?.length ? q.imagens : q.imagem_url ? [q.imagem_url] : [],
    estrutura: q.comodidades ?? [],
    cobranca: q.cobranca === "bateria" ? { unidade: "bateria", minutos: q.minutos_bateria ?? 15 } : undefined,
    situacao: q.status, // "ativa" | "manutencao" (inativas não vêm da API)
    livresHoje: (q.horarios_livres ?? []).map((h) => h.hora_inicio),
    avaliacao: q.avaliacao ?? null,
    quantidadeAvaliacoes: q.quantidade_avaliacoes ?? 0,
    empresa: q.empresa
      ? {
          id: q.empresa.id,
          nome: q.empresa.nome,
          telefone: q.empresa.telefone,
          whatsapp: q.empresa.whatsapp,
          politicaCancelamento: q.empresa.politica_cancelamento,
        }
      : null,
  };
}

/** Lista completa já carregada (leitura imediata). */
export function quadrasPublicas() {
  return quadrasDaApi;
}

/** Uma quadra do catálogo pelo id da página pública (leitura imediata). */
export const buscarQuadraPublica = (id) => quadrasDaApi.find((q) => q.id === String(id));

/** Busca as quadras na API e devolve o catálogo completo. */
export async function listarQuadrasPublicas() {
  const lista = await api("/publico/quadras", { publico: true });
  quadrasDaApi = lista.map(paraPublica);
  return quadrasDaApi;
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
    return quadra;
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

/** Nota média e total de avaliações de uma lista de quadras (para os números da Home). */
export function resumoDasNotas(lista) {
  const avaliadas = lista.filter((q) => q.quantidadeAvaliacoes);
  const total = avaliadas.reduce((s, q) => s + q.quantidadeAvaliacoes, 0);
  const media = total ? avaliadas.reduce((s, q) => s + q.avaliacao * q.quantidadeAvaliacoes, 0) / total : null;
  return { media, total };
}

/** Modalidades presentes numa lista, sem repetição. */
export const modalidadesDe = (lista) => [...new Set(lista.map((q) => q.modalidade))];

/** Quadras que podem ser reservadas agora (as em manutenção ficam fora da Home). */
export const disponiveisParaReserva = (lista) => lista.filter((q) => !q.situacao || q.situacao === "ativa");
