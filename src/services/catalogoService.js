// =========================================================
// Serviço do CATÁLOGO PÚBLICO DE QUADRAS (o que o jogador vê)
//
// Junta as quadras de demonstração (data/quadras.js) com as quadras que a
// empresa cadastrou no painel e que ainda não tinham página pública.
// Com o backend: tudo vem de um endpoint só, por exemplo:
//   export const listarQuadrasPublicas = () => api.get("/quadras").then(r => r.data);
// =========================================================
import { quadras as quadrasFixas } from "../data/quadras.js";
import { responder } from "./armazenamento.js";
import { empresaAtual } from "./empresaService.js";
import { quadrasDaEmpresaAtual } from "./quadrasService.js";

/** Converte uma quadra do painel da empresa para o formato do catálogo público. */
function paraPublica(quadra, empresa) {
  const { bairro, cidade, estado, rua, numero } = empresa.endereco;
  return {
    id: quadra.id,
    nome: `${quadra.nome} · ${empresa.nome}`,
    modalidade: quadra.modalidade,
    bairro: bairro || cidade,
    cidade: `${cidade}/${estado}`,
    endereco: `${rua}, ${numero} - ${cidade}/${estado}`,
    preco: quadra.preco,
    avaliacao: null,
    quantidadeAvaliacoes: 0,
    descricao: quadra.descricao || `${quadra.modalidade} na ${empresa.nome}.`,
    imagens: quadra.imagem ? [quadra.imagem] : [],
    estrutura: quadra.comodidades ?? [],
    situacao: quadra.status, // "ativa" | "manutencao" | "inativa"
    daEmpresa: true,
  };
}

/**
 * Lista completa (leitura imediata).
 * Quadras desativadas pela empresa ficam fora do catálogo.
 */
export function quadrasPublicas() {
  const empresa = empresaAtual();
  const daEmpresa = quadrasDaEmpresaAtual()
    .filter((q) => !q.publicaId && q.status !== "inativa")
    .map((q) => paraPublica(q, empresa));
  return [...quadrasFixas, ...daEmpresa];
}

/** Uma quadra do catálogo pelo id da página pública (leitura imediata). */
export const buscarQuadraPublica = (id) => quadrasPublicas().find((q) => q.id === id);

/** Mesma lista, no formato de uma chamada à API (assíncrona). */
export const listarQuadrasPublicas = () => responder(quadrasPublicas(), 150);

/** Modalidades presentes numa lista, sem repetição. */
export const modalidadesDe = (lista) => [...new Set(lista.map((q) => q.modalidade))];

/** Quadras que podem ser reservadas agora (as em manutenção ficam fora da Home). */
export const disponiveisParaReserva = (lista) => lista.filter((q) => !q.situacao || q.situacao === "ativa");
