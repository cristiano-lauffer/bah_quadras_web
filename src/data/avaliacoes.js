// Avaliações de demonstração. Cada uma pertence a uma quadra (quadraId).
import { isoComDias } from "../utils/formatadores.js";

export const aspectosAvaliacao = [
  "Iluminação",
  "Limpeza",
  "Atendimento",
  "Estrutura",
  "Localização",
  "Custo-benefício",
];

export const rotulosNota = ["", "Péssima", "Ruim", "Regular", "Boa", "Excelente"];

export const avaliacoes = [
  { id: 1, quadraId: "arena-sport", nome: "Mariana Costa", nota: 5, data: isoComDias(-3), util: 12, aspectos: ["Iluminação", "Atendimento"], texto: "Ótima quadra, bem cuidada e com iluminação excelente. O atendimento também foi muito bom! Já marcamos o próximo jogo." },
  { id: 2, quadraId: "arena-sport", nome: "Lucas Ferreira", nota: 5, data: isoComDias(-9), util: 8, aspectos: ["Estrutura", "Localização"], texto: "Espaço organizado, grama em boas condições e fácil de chegar. Recomendo!" },
  { id: 3, quadraId: "arena-sport", nome: "Rafael Martins", nota: 4, data: isoComDias(-16), util: 5, aspectos: ["Limpeza"], texto: "A quadra é muito boa e os vestiários estavam limpos. O estacionamento poderia ser maior em dia de jogo." },
  { id: 4, quadraId: "arena-sport", nome: "Camila Souza", nota: 4, data: isoComDias(-24), util: 3, aspectos: ["Custo-benefício"], texto: "Boa estrutura e ótimo custo-benefício para jogar com os amigos." },
  { id: 5, quadraId: "arena-sport", nome: "Bruno Almeida", nota: 3, data: isoComDias(-40), util: 1, aspectos: [], texto: "Quadra boa, mas a reserva atrasou 10 minutos porque o jogo anterior não liberou no horário." },
  { id: 6, quadraId: "arena-sport", nome: "Fernanda Lima", nota: 5, data: isoComDias(-55), util: 6, aspectos: ["Iluminação", "Estrutura"], texto: "Melhor society da região. Iluminação perfeita para jogar à noite." },
  { id: 7, quadraId: "beach-arena", nome: "Patrícia Rocha", nota: 5, data: isoComDias(-2), util: 9, aspectos: ["Localização", "Atendimento"], texto: "Jogar beach tennis com o pôr do sol do Guaíba não tem preço. Equipe super atenciosa." },
  { id: 8, quadraId: "beach-arena", nome: "Diego Santos", nota: 4, data: isoComDias(-20), util: 2, aspectos: ["Custo-benefício"], texto: "Areia boa e aluguel de raquete barato. Só faltou sombra entre os jogos." },
  { id: 9, quadraId: "arena-basketball", nome: "Thiago Oliveira", nota: 5, data: isoComDias(-6), util: 7, aspectos: ["Estrutura", "Limpeza"], texto: "Piso excelente e tabelas oficiais. Dá pra treinar de verdade." },
  { id: 10, quadraId: "play-sports", nome: "Juliana Pereira", nota: 5, data: isoComDias(-11), util: 4, aspectos: ["Atendimento"], texto: "Lugar descontraído, areia limpa e o pessoal é muito gente boa." },
  { id: 11, quadraId: "quadra-center", nome: "Gustavo Ribeiro", nota: 4, data: isoComDias(-14), util: 3, aspectos: ["Estrutura"], texto: "Quadra coberta, ótima para dias de chuva. Arquibancada ajuda quando tem torcida." },
  { id: 12, quadraId: "gol-de-ouro", nome: "Aline Barbosa", nota: 4, data: isoComDias(-30), util: 2, aspectos: ["Custo-benefício", "Estrutura"], texto: "Grama nova e churrasqueira caprichada para depois do jogo." },
];

export const avaliacoesDaQuadra = (quadraId) => avaliacoes.filter((a) => a.quadraId === quadraId);
