// =========================================================
// Serviço de QUADRAS DA EMPRESA (US4, US5 e US6)
//
// Hoje: dados de demonstração salvos no navegador.
// Com o backend: troque o corpo de cada função por uma chamada à API
// mantendo o mesmo nome e retorno, por exemplo:
//   export const listarQuadras = () => api.get("/empresa/quadras").then(r => r.data);
// =========================================================
import { empresaDemo, quadrasEmpresa as quadrasIniciais } from "../data/empresa.js";
import { apagar, falhar, lerSalvo, responder, salvar } from "./armazenamento.js";

const CHAVE = "bahquadras:empresa:quadras";

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

/** Grade semanal a partir do horário de funcionamento da empresa. */
export function gradePadrao() {
  const grade = {};
  for (const h of empresaDemo.horarios) {
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

function dadosIniciais() {
  const extras = {
    "society-1": { piso: "Grama sintética", cobertura: "descoberta", capacidade: 14, comodidades: ["Vestiário", "Chuveiro", "Iluminação", "Estacionamento"] },
    "society-2": { piso: "Grama sintética", cobertura: "descoberta", capacidade: 14, comodidades: ["Vestiário", "Iluminação", "Churrasqueira"] },
    futsal: { piso: "Madeira", cobertura: "coberta", capacidade: 10, comodidades: ["Vestiário", "Arquibancada", "Bebedouro"] },
    areia: { piso: "Areia", cobertura: "descoberta", capacidade: 4, comodidades: ["Iluminação", "Aluguel de materiais"] },
  };
  return quadrasIniciais.map((q) => ({
    descricao: "",
    ...extras[q.id],
    ...q,
    horarios: gradePadrao(),
  }));
}

function ler() {
  return lerSalvo(CHAVE) ?? dadosIniciais();
}

/* ---------------- Funções públicas (mesma "cara" de uma API) ---------------- */

export function listarQuadras() {
  return responder(ler());
}

export function buscarQuadra(id) {
  const quadra = ler().find((q) => q.id === id);
  return quadra ? responder(quadra) : falhar("Quadra não encontrada.");
}

/** Quadra da empresa ligada a uma página pública (/quadra/:id), se existir. */
export function buscarVinculoPublico(publicaId) {
  return responder(ler().find((q) => q.publicaId === publicaId) ?? null, 150);
}

/** Cria (sem id) ou atualiza (com id) uma quadra. */
export function salvarQuadra(dados) {
  const lista = ler();
  let salva;
  if (dados.id) {
    const indice = lista.findIndex((q) => q.id === dados.id);
    if (indice < 0) return falhar("Quadra não encontrada.");
    salva = { ...lista[indice], ...dados };
    lista[indice] = salva;
  } else {
    salva = { ocupacao: 0, horarios: gradePadrao(), ...dados, id: `quadra-${Date.now()}` };
    lista.push(salva);
  }
  salvar(CHAVE, lista);
  return responder(salva, 500);
}

export function alterarStatus(id, status) {
  return salvarQuadra({ id, status });
}

export function salvarHorarios(id, horarios) {
  return salvarQuadra({ id, horarios });
}

/** Volta os dados de demonstração ao estado original. */
export function restaurarDemonstracao() {
  apagar(CHAVE);
}
