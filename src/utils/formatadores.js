// Funções de formatação usadas em várias páginas.

// Sem centavos quando o valor é inteiro (R$ 80); com centavos quando não é (R$ 95,50).
export const formatarPreco = (valor, casas = Number.isInteger(valor) ? 0 : 2) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

export const formatarNota = (nota) => nota.toFixed(1).replace(".", ",");

/** Quadra ainda sem avaliações (ex.: parceira recém-cadastrada). */
export const semAvaliacoes = (quadra) => !quadra.quantidadeAvaliacoes || quadra.avaliacao == null;

// Datas ISO (AAAA-MM-DD) são lidas ao meio-dia para evitar problemas de fuso.
export const paraData = (iso) => new Date(`${iso}T12:00:00`);

export function formatarData(iso, opcoes = { day: "2-digit", month: "long", year: "numeric" }) {
  return paraData(iso).toLocaleDateString("pt-BR", opcoes);
}

// Gera uma data ISO a partir de hoje (+n dias ou -n dias). Útil para dados de demonstração
// que não "envelhecem".
export function isoComDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Diferença em dias entre hoje e a data ISO (positivo = futuro).
export function diasAte(iso) {
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  return Math.round((paraData(iso) - hoje) / 86_400_000);
}

export function tempoRelativo(iso) {
  const dias = diasAte(iso);
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  if (dias === -1) return "ontem";
  if (dias > 1) return `em ${dias} dias`;
  const passados = -dias;
  if (passados < 7) return `há ${passados} dias`;
  if (passados < 30) {
    const semanas = Math.floor(passados / 7);
    return `há ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
  }
  const meses = Math.floor(passados / 30);
  return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;
}

export const iniciais = (nome) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

// Normaliza texto para buscas (sem acentos e em minúsculas).
export const normalizar = (texto) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Cor de avatar estável a partir do nome.
const coresAvatar = ["#07834e", "#0e7490", "#7c3aed", "#c2410c", "#be185d", "#4d7c0f", "#1d4ed8"];
export function corDoNome(nome) {
  let soma = 0;
  for (const c of nome) soma += c.charCodeAt(0);
  return coresAvatar[soma % coresAvatar.length];
}
