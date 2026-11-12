// Dados de demonstração da empresa logada (Arena Sport).
// TODO: substituir por chamadas à API quando o backend estiver pronto.
import { quadras } from "./quadras.js";

export const empresaDemo = {
  nome: "Arena Sport",
  slogan: "Seu jogo começa aqui.",
  cnpj: "12.345.678/0001-90",
  responsavel: "Carlos Mendes",
  telefone: "(51) 98765-4321",
  whatsapp: "(51) 98765-4321",
  email: "contato@arenasport.com",
  instagram: "@arenasport",
  site: "arenasport.com.br",
  descricao:
    "Somos um complexo esportivo em Viamão com campos de society, quadra coberta de futsal e arena de areia. Estrutura completa para você reunir os amigos, treinar o time ou organizar campeonatos.",
  endereco: {
    rua: "Rua das Esmeraldas",
    numero: "120",
    bairro: "Centro",
    cidade: "Viamão",
    estado: "RS",
    cep: "94400-000",
  },
  membroDesde: "2025-08-15",
  verificada: true,
  logo: "⚽",
  capa: quadras[0].imagens[1],
  fotos: [quadras[0].imagens[0], quadras[5].imagens[0], quadras[1].imagens[0], quadras[4].imagens[0]],
  comodidades: [
    "Estacionamento",
    "Vestiário",
    "Chuveiro",
    "Iluminação LED",
    "Lanchonete",
    "Wi-Fi",
    "Churrasqueira",
    "Acessibilidade",
  ],
  pagamentos: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
  politicaCancelamento:
    "Cancelamento gratuito até 24 horas antes do horário reservado. Depois disso, é cobrado 50% do valor.",
  // dia: 0 = domingo ... 6 = sábado (igual ao Date.getDay())
  horarios: [
    { dia: 1, nome: "Segunda", abre: "08:00", fecha: "23:00" },
    { dia: 2, nome: "Terça", abre: "08:00", fecha: "23:00" },
    { dia: 3, nome: "Quarta", abre: "08:00", fecha: "23:00" },
    { dia: 4, nome: "Quinta", abre: "08:00", fecha: "23:00" },
    { dia: 5, nome: "Sexta", abre: "08:00", fecha: "00:00" },
    { dia: 6, nome: "Sábado", abre: "08:00", fecha: "00:00" },
    { dia: 0, nome: "Domingo", abre: "09:00", fecha: "20:00" },
  ],
};

// Quadras administradas pela empresa.
// "publicaId" aponta para a página pública /quadra/:id quando ela existe.
export const quadrasEmpresa = [
  { id: "society-1", publicaId: "arena-sport", nome: "Campo Society 1", modalidade: "Futebol society", preco: 80, ocupacao: 82, status: "ativa", imagem: quadras[0].imagens[0] },
  { id: "society-2", nome: "Campo Society 2", modalidade: "Futebol society", preco: 90, ocupacao: 74, status: "ativa", imagem: quadras[5].imagens[0] },
  { id: "futsal", nome: "Quadra Coberta", modalidade: "Futsal", preco: 70, ocupacao: 61, status: "ativa", imagem: quadras[1].imagens[0] },
  { id: "areia", nome: "Arena de Areia", modalidade: "Beach tennis", preco: 65, ocupacao: 0, status: "manutencao", imagem: quadras[4].imagens[0] },
];

// Últimos 6 meses completos, do mais antigo para o mais recente.
const faturamento = [9120, 10480, 9860, 11320, 11890, 12740];
const reservasMes = [118, 132, 126, 145, 152, 168];

export const historicoMensal = faturamento.map((valor, i) => {
  const hoje = new Date();
  const data = new Date(hoje.getFullYear(), hoje.getMonth() - (faturamento.length - i), 1);
  return {
    mes: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    mesLongo: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    mesNome: data.toLocaleDateString("pt-BR", { month: "long" }), // "outubro"
    faturamento: valor,
    reservas: reservasMes[i],
  };
});

// Agenda do dia (horário de início, quadra, cliente).
export const agendaHoje = [
  { id: 1, hora: "08:00", duracao: 1, quadraId: "society-1", cliente: "Lucas Ferreira", valor: 80, pago: true },
  { id: 2, hora: "10:00", duracao: 2, quadraId: "futsal", cliente: "Time Amigos do Bairro", valor: 140, pago: true },
  { id: 3, hora: "14:00", duracao: 1, quadraId: "society-2", cliente: "Rafael Martins", valor: 90, pago: true },
  { id: 4, hora: "18:00", duracao: 1, quadraId: "society-1", cliente: "Mariana Costa", valor: 80, pago: true },
  { id: 5, hora: "19:00", duracao: 1, quadraId: "society-1", cliente: "João da Silva", valor: 80, pago: false },
  { id: 6, hora: "19:00", duracao: 2, quadraId: "society-2", cliente: "Pelada de Quinta", valor: 180, pago: true },
  { id: 7, hora: "20:00", duracao: 1, quadraId: "futsal", cliente: "Bruno Almeida", valor: 70, pago: false },
  { id: 8, hora: "21:00", duracao: 1, quadraId: "society-1", cliente: "Camila Souza", valor: 80, pago: true },
];
