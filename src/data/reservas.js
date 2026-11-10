// Reservas de demonstração do usuário logado.
// As datas são relativas a hoje para a demonstração nunca ficar desatualizada.
import { isoComDias } from "../utils/formatadores.js";

export const reservas = [
  { id: 1, quadraId: "arena-sport", quadra: "Arena Sport", modalidade: "Futebol society", endereco: "Viamão, RS", data: isoComDias(2), hora: "19:00", duracao: 1, valor: 80, status: "confirmada" },
  { id: 2, quadraId: "beach-arena", quadra: "Beach Arena", modalidade: "Beach tennis", endereco: "Porto Alegre, RS", data: isoComDias(5), hora: "15:00", duracao: 2, valor: 130, status: "confirmada" },
  { id: 3, quadraId: "arena-basketball", quadra: "Arena Basketball", modalidade: "Basquete", endereco: "Porto Alegre, RS", data: isoComDias(-12), hora: "18:00", duracao: 1, valor: 75, status: "concluida" },
  { id: 4, quadraId: "play-sports", quadra: "Play Sports", modalidade: "Vôlei de areia", endereco: "Porto Alegre, RS", data: isoComDias(-25), hora: "10:00", duracao: 2, valor: 120, status: "concluida" },
  { id: 5, quadraId: "quadra-center", quadra: "Quadra Center", modalidade: "Futsal", endereco: "Viamão, RS", data: isoComDias(-8), hora: "20:00", duracao: 1, valor: 70, status: "cancelada" },
];
