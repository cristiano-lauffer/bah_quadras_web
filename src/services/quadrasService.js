// =========================================================
// Serviço de QUADRAS DA EMPRESA (US4, US5 e US6)
//
// Os dados vêm da API (rotas /quadras e /quadras/:id/horarios, só para
// contas de empresa). As funções mantêm o formato que as telas já usavam:
//   { id, nome, modalidade, preco, descricao, status, piso, cobertura,
//     capacidade, comodidades, imagem, horarios }
// onde "horarios" é a grade da semana: { 1: ["18:00", "19:00"], ... }
// (cada horário = 1 hora de reserva; 0 = domingo, como no Date.getDay()).
// =========================================================
import { api, ErroApi } from "./api.js";
import { empresaAtual } from "./empresaService.js";

export const modalidadesDisponiveis = [
  "Futebol society",
  "Futsal",
  "Vôlei",
  "Vôlei de areia",
  "Beach tennis",
  "Basquete",
  "Tênis",
  "Padel",
];

export const tiposPiso = ["Grama sintética", "Madeira", "Cimento", "Areia", "Emborrachado", "Saibro"];

export const comodidadesDisponiveis = [
  "Vestiário",
  "Chuveiro",
  "Iluminação",
  "Estacionamento",
  "Arquibancada",
  "Bebedouro",
  "Churrasqueira",
  "Aluguel de materiais",
  "Wi-Fi",
  "Lanchonete",
];

export const statusQuadra = {
  ativa: "Ativa",
  manutencao: "Em manutenção",
  inativa: "Desativada",
};

// Horários de início possíveis (cada horário = 1 hora de reserva).
export const horasDoDia = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`);

// Dias na ordem em que aparecem na tela (segunda a domingo). 0 = domingo, como no Date.getDay().
export const diasDaSemana = [
  { dia: 1, curto: "Seg", nome: "Segunda" },
  { dia: 2, curto: "Ter", nome: "Terça" },
  { dia: 3, curto: "Qua", nome: "Quarta" },
  { dia: 4, curto: "Qui", nome: "Quinta" },
  { dia: 5, curto: "Sex", nome: "Sexta" },
  { dia: 6, curto: "Sáb", nome: "Sábado" },
  { dia: 0, curto: "Dom", nome: "Domingo" },
];

/** Grade semanal a partir do horário de funcionamento da empresa (o salvo no Editar perfil). */
export function gradePadrao() {
  const grade = {};
  for (const h of empresaAtual().horarios) {
    if (!h.abre) {
      grade[h.dia] = []; // dia fechado
      continue;
    }
    const abre = Number(h.abre.slice(0, 2));
    const fecha = h.fecha === "00:00" ? 24 : Number(h.fecha.slice(0, 2));
    grade[h.dia] = horasDoDia.filter((hora) => {
      const n = Number(hora.slice(0, 2));
      return n >= abre && n < fecha;
    });
  }
  return grade;
}

export const totalHorariosSemana = (grade) =>
  Object.values(grade ?? {}).reduce((soma, lista) => soma + lista.length, 0);

/* ---------------- Conversões entre o formato da API e o das telas ---------------- */

// "Futebol society" e "Futebol Society" são a mesma modalidade (ignora maiúsculas e acentos).
const mesmoTexto = (a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;

/** Nome da modalidade como as telas mostram, a partir do tipo de quadra da API. */
export const modalidadeDoTipo = (descricao) =>
  modalidadesDisponiveis.find((m) => mesmoTexto(m, descricao ?? "")) ?? descricao ?? "";

let tiposCarregando = null;
async function idDoTipo(modalidade) {
  tiposCarregando ??= api("/tipos-quadra").catch((erro) => {
    tiposCarregando = null; // tenta de novo na próxima vez
    throw erro;
  });
  const tipo = (await tiposCarregando).find((t) => mesmoTexto(t.descricao, modalidade));
  if (!tipo) throw new Error(`A modalidade "${modalidade}" ainda não está cadastrada no servidor.`);
  return tipo.id;
}

const fimDoHorario = (hora) => `${String(Number(hora.slice(0, 2)) + 1).padStart(2, "0")}:00`;

/** Slots da API ([{ dia_semana, hora_inicio, hora_fim, ativo }]) -> grade { dia: ["18:00", ...] }. */
export function slotsParaGrade(slots) {
  const grade = Object.fromEntries(diasDaSemana.map(({ dia }) => [dia, []]));
  for (const s of slots ?? []) {
    if (s.ativo === false) continue; // slot bloqueado pela empresa
    grade[s.dia_semana].push(s.hora_inicio.slice(0, 5));
  }
  for (const dia of Object.keys(grade)) grade[dia].sort();
  return grade;
}

/** Grade das telas -> slots de 1 hora para o PUT /quadras/:id/horarios. */
function gradeParaSlots(grade) {
  return Object.entries(grade ?? {}).flatMap(([dia, horas]) =>
    horas.map((hora) => ({ dia_semana: Number(dia), hora_inicio: hora, hora_fim: fimDoHorario(hora) }))
  );
}

/** Quadra da API -> formato das telas. */
function daApi(q, slots) {
  return {
    id: String(q.id),
    nome: q.nome,
    modalidade: modalidadeDoTipo(q.tipo_quadra),
    preco: q.valor_hora,
    descricao: q.descricao ?? "",
    status: q.status,
    piso: q.piso ?? "",
    cobertura: q.cobertura ?? "descoberta",
    capacidade: q.capacidade ?? null,
    comodidades: q.comodidades ?? [],
    imagem: q.imagem_url ?? "",
    ocupacao: 0, // a API ainda não calcula a ocupação
    horarios: slotsParaGrade(slots),
  };
}

/** Campos das telas -> corpo do POST/PATCH /quadras (só os campos presentes em "dados"). */
async function paraApi(dados) {
  const corpo = {};
  if (dados.nome !== undefined) corpo.nome = dados.nome;
  if (dados.modalidade !== undefined) corpo.tipo_quadra_id = await idDoTipo(dados.modalidade);
  if (dados.preco !== undefined) corpo.valor_hora = dados.preco;
  if (dados.descricao !== undefined) corpo.descricao = dados.descricao || null;
  if (dados.status !== undefined) corpo.status = dados.status;
  if (dados.piso !== undefined) corpo.piso = dados.piso || null;
  if (dados.cobertura !== undefined) corpo.cobertura = dados.cobertura || null;
  if (dados.capacidade !== undefined) corpo.capacidade = dados.capacidade ?? null;
  if (dados.comodidades !== undefined) corpo.comodidades = dados.comodidades;
  if (dados.imagem !== undefined) {
    if (dados.imagem?.startsWith("data:")) {
      throw new Error("O envio de arquivo de foto ainda não é aceito pelo servidor. Escolha uma das fotos sugeridas.");
    }
    corpo.imagem_url = dados.imagem || null;
  }
  return corpo;
}

const lerSlots = (id) => api(`/quadras/${id}/horarios`);

// Últimas quadras lidas da API, para as leituras imediatas (sem esperar) abaixo.
let ultimasQuadras = [];

/* ---------------- Funções públicas (mesma "cara" de antes) ---------------- */

/**
 * Id da página pública (/quadra/:id) de uma quadra da empresa.
 * Com a API, é o próprio id da quadra.
 */
export const idPublico = (quadra) => quadra.publicaId ?? quadra.id;

/** Quadras da empresa já carregadas (leitura imediata). */
export function quadrasDaEmpresaAtual() {
  return ultimasQuadras;
}

/** Ids das páginas públicas das quadras da empresa (leitura imediata). */
export function idsPublicosDaEmpresa() {
  return ultimasQuadras.map(idPublico);
}

export async function listarQuadras() {
  const quadras = await api("/quadras");
  const grades = await Promise.all(quadras.map((q) => lerSlots(q.id)));
  ultimasQuadras = quadras.map((q, i) => daApi(q, grades[i]));
  return ultimasQuadras;
}

export async function buscarQuadra(id) {
  const [quadra, slots] = await Promise.all([api(`/quadras/${id}`), lerSlots(id)]);
  return daApi(quadra, slots);
}

/**
 * Preço, situação e grade de uma quadra da página pública (/quadra/:id), se ela for de
 * uma empresa cadastrada na API. As quadras de demonstração (ids como "arena-sport") não têm.
 */
export async function buscarVinculoPublico(publicaId) {
  if (!/^\d+$/.test(String(publicaId))) return null;
  try {
    const q = await api(`/publico/quadras/${publicaId}`, { publico: true });
    return { id: String(q.id), preco: q.valor_hora, status: q.status, horarios: slotsParaGrade(q.grade) };
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

/**
 * Cria (sem id) ou atualiza (com id) uma quadra.
 * Quadra nova já ganha a grade do horário de funcionamento da empresa.
 */
export async function salvarQuadra(dados) {
  const corpo = await paraApi(dados);
  if (dados.id) {
    const { quadra } = await api(`/quadras/${dados.id}`, { metodo: "PATCH", corpo });
    const slots = await lerSlots(quadra.id);
    return daApi(quadra, slots);
  }
  const { quadra } = await api("/quadras", { metodo: "POST", corpo });
  const { horarios } = await api(`/quadras/${quadra.id}/horarios`, {
    metodo: "PUT",
    corpo: { horarios: gradeParaSlots(gradePadrao()) },
  });
  return daApi(quadra, horarios);
}

export function alterarStatus(id, status) {
  return salvarQuadra({ id, status });
}

/** Troca a grade inteira da quadra (a API apaga a antiga e grava a nova numa transação). */
export async function salvarHorarios(id, horarios) {
  const resposta = await api(`/quadras/${id}/horarios`, { metodo: "PUT", corpo: { horarios: gradeParaSlots(horarios) } });
  return slotsParaGrade(resposta.horarios);
}
