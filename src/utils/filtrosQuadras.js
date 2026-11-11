// Opções de ordenação e filtros da lista de quadras (Home).

export const ordenacoes = {
  relevancia: { texto: "Relevância", fn: (a, b) => Number(!!b.destaque) - Number(!!a.destaque) },
  avaliacao: { texto: "Melhor avaliadas", fn: (a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0) },
  menorPreco: { texto: "Menor preço", fn: (a, b) => a.preco - b.preco },
};

// Preço por hora (ou por bateria, no caso do kart).
export const faixasPreco = {
  qualquer: { texto: "Qualquer preço", aceita: () => true },
  ate70: { texto: "Até R$ 70", aceita: (p) => p <= 70 },
  de70a100: { texto: "R$ 71 a R$ 100", aceita: (p) => p > 70 && p <= 100 },
  acima100: { texto: "Acima de R$ 100", aceita: (p) => p > 100 },
};

export const cidadesDe = (lista) =>
  [...new Set(lista.map((q) => q.cidade))].sort((a, b) => a.localeCompare(b, "pt-BR"));
