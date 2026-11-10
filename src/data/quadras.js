// Dados de demonstração das quadras.
// Fonte única usada pela Home e pelos Detalhes da Quadra.
// Quando o backend estiver pronto, basta trocar este arquivo por uma chamada à API.

const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

// Dados comuns aos espaços da RGM Academy (Gravataí/RS).
// As fotos são ilustrativas. TODO: trocar por fotos reais da RGM.
const rgmAcademy = {
  bairro: "Distrito Industrial",
  cidade: "Gravataí/RS",
  endereco: "Rua Nissin Castiel, 883 - Distrito Industrial, Gravataí/RS",
  avaliacao: null,
  quantidadeAvaliacoes: 0,
  descricao:
    "A RGM Academy é um complexo esportivo e escola de futebol criado pelos ex-goleiros do Grêmio Galatto e Marcelo Grohe, com campos oficiais, academia e escola de goleiros.",
  estrutura: ["Academia", "Sala de fisioterapia", "6 vestiários", "Espaço para treino de goleiros"],
};

export const quadras = [
  {
    id: "arena-sport",
    nome: "Arena Sport",
    modalidade: "Futebol society",
    bairro: "Centro",
    cidade: "Viamão/RS",
    endereco: "Rua das Esmeraldas, 120 - Viamão/RS",
    preco: 80,
    avaliacao: 4.8,
    quantidadeAvaliacoes: 124,
    destaque: true,
    descricao:
      "A Arena Sport oferece um espaço moderno e confortável para você jogar futebol com seus amigos. Nossa quadra possui gramado de qualidade, iluminação e estrutura completa.",
    imagens: [
      img("photo-1522778119026-d647f0596c20"),
      img("photo-1518604666860-9ed391f76460"),
      img("photo-1551958219-acbc608c6377"),
    ],
    estrutura: ["Estacionamento", "Vestiário", "Iluminação", "Chuveiro", "Lanchonete"],
  },
  {
    id: "quadra-center",
    nome: "Quadra Center",
    modalidade: "Futsal",
    bairro: "Santa Isabel",
    cidade: "Viamão/RS",
    endereco: "Avenida Central, 450 - Viamão/RS",
    preco: 70,
    avaliacao: 4.6,
    quantidadeAvaliacoes: 89,
    descricao:
      "A Quadra Center é ideal para partidas de futsal. Possui espaço coberto, piso adequado para a prática esportiva e ambiente preparado para receber grupos e equipes.",
    imagens: [
      img("photo-1574629810360-7efbbe195018"),
      img("photo-1546519638-68e109498ffc"),
      img("photo-1521412644187-c49fa049e84d"),
    ],
    estrutura: ["Estacionamento", "Vestiário", "Iluminação", "Arquibancada"],
  },
  {
    id: "play-sports",
    nome: "Play Sports",
    modalidade: "Vôlei de areia",
    bairro: "Menino Deus",
    cidade: "Porto Alegre/RS",
    endereco: "Rua dos Esportes, 80 - Porto Alegre/RS",
    preco: 60,
    avaliacao: 4.7,
    quantidadeAvaliacoes: 96,
    descricao:
      "A Play Sports oferece uma excelente estrutura para quem gosta de vôlei de areia. Um ambiente descontraído para praticar esportes e aproveitar com os amigos.",
    imagens: [
      img("photo-1612872087720-bb876e2e67d1"),
      img("photo-1592656094267-764a45160876"),
      img("photo-1626224583764-f87db24ac4ea"),
    ],
    estrutura: ["Estacionamento", "Vestiário", "Iluminação", "Área de descanso"],
  },
  {
    id: "arena-basketball",
    nome: "Arena Basketball",
    modalidade: "Basquete",
    bairro: "Partenon",
    cidade: "Porto Alegre/RS",
    endereco: "Av. Bento Gonçalves, 2100 - Porto Alegre/RS",
    preco: 75,
    avaliacao: 4.9,
    quantidadeAvaliacoes: 58,
    destaque: true,
    descricao:
      "Quadra de basquete coberta com piso emborrachado, tabelas oficiais e iluminação de LED. Perfeita para treinos e partidas entre amigos.",
    imagens: [
      img("photo-1504450758481-7338eba7524a"),
      img("photo-1546519638-68e109498ffc"),
      img("photo-1519861531473-9200262188bf"),
    ],
    estrutura: ["Vestiário", "Iluminação", "Bebedouro", "Arquibancada"],
  },
  {
    id: "beach-arena",
    nome: "Beach Arena",
    modalidade: "Beach tennis",
    bairro: "Ipanema",
    cidade: "Porto Alegre/RS",
    endereco: "Av. Guaíba, 3500 - Porto Alegre/RS",
    preco: 65,
    avaliacao: 4.8,
    quantidadeAvaliacoes: 142,
    descricao:
      "Quadras de areia à beira do Guaíba, com aluguel de raquetes e bolinhas. O lugar certo para jogar beach tennis no fim de tarde.",
    imagens: [
      img("photo-1600320254374-ce2d293c324e"),
      img("photo-1612872087720-bb876e2e67d1"),
      img("photo-1592656094267-764a45160876"),
    ],
    estrutura: ["Estacionamento", "Aluguel de raquetes", "Bar", "Iluminação"],
  },
  {
    id: "gol-de-ouro",
    nome: "Gol de Ouro",
    modalidade: "Futebol society",
    bairro: "Sarandi",
    cidade: "Porto Alegre/RS",
    endereco: "Rua Dona Alzira, 900 - Porto Alegre/RS",
    preco: 90,
    avaliacao: 4.5,
    quantidadeAvaliacoes: 77,
    descricao:
      "Dois campos de society com grama sintética nova, churrasqueira e espaço para confraternização depois do jogo.",
    imagens: [
      img("photo-1518604666860-9ed391f76460"),
      img("photo-1522778119026-d647f0596c20"),
      img("photo-1551958219-acbc608c6377"),
    ],
    estrutura: ["Estacionamento", "Vestiário", "Churrasqueira", "Iluminação"],
  },

  // ---------------------------------------------------------------
  // Empresas parceiras reais. Elas entram SEM nota e SEM avaliações
  // (avaliacao: null) para não inventar opiniões sobre empresas de verdade.
  // TODO: confirmar com cada empresa os campos marcados como "a confirmar".
  // ---------------------------------------------------------------
  {
    id: "velopark-kart",
    nome: "Velopark Kart",
    modalidade: "Kart",
    bairro: "BR-386, km 428",
    cidade: "Nova Santa Rita/RS",
    endereco: "BR-386, km 428 - Nova Santa Rita/RS",
    preco: 150, // TODO: valor ilustrativo, confirmar a tabela de preços com o Velopark
    avaliacao: null,
    quantidadeAvaliacoes: 0,
    descricao:
      "Pista de kart de locação do complexo Velopark, a menos de 30 km de Porto Alegre. Um programa diferente para correr com os amigos, comemorar aniversários ou fazer eventos da empresa.",
    imagens: [img("photo-1505570554449-69ce7d4fa36b"), img("photo-1508550794981-ed0e94d56589")],
    estrutura: ["Pista de kart de locação", "Karts para aluguel"], // TODO: confirmar a estrutura completa
  },
  // RGM Academy: um complexo com vários espaços para alugar.
  // Cada espaço é uma opção de reserva separada (o sistema usa uma modalidade por quadra).
  {
    ...rgmAcademy,
    id: "rgm-academy-futebol-11",
    nome: "RGM Academy - Campo Sintético",
    modalidade: "Futebol 11",
    preco: 300, // TODO: valor ilustrativo, confirmar com a RGM
    descricao: `Campo oficial de futebol 11 com grama sintética e iluminação. ${rgmAcademy.descricao}`,
    imagens: [
      img("photo-1551958219-acbc608c6377"),
      img("photo-1522778119026-d647f0596c20"),
      img("photo-1518604666860-9ed391f76460"),
    ],
    estrutura: ["Grama sintética", "Iluminação", ...rgmAcademy.estrutura],
  },
  {
    ...rgmAcademy,
    id: "rgm-academy-futebol-7",
    nome: "RGM Academy - Futebol 7",
    modalidade: "Futebol 7",
    preco: 180, // TODO: valor ilustrativo, confirmar com a RGM
    descricao: `Campo de futebol 7, ideal para jogar com a galera. ${rgmAcademy.descricao}`,
    imagens: [
      img("photo-1518604666860-9ed391f76460"),
      img("photo-1551958219-acbc608c6377"),
      img("photo-1522778119026-d647f0596c20"),
    ],
  },
  {
    ...rgmAcademy,
    id: "rgm-academy-areia",
    nome: "RGM Academy - Quadras de Areia",
    modalidade: "Esportes de areia",
    preco: 80, // TODO: valor ilustrativo, confirmar com a RGM
    descricao: `Duas quadras de areia para esportes como beach tennis e futevôlei. ${rgmAcademy.descricao}`,
    imagens: [
      img("photo-1612872087720-bb876e2e67d1"),
      img("photo-1592656094267-764a45160876"),
      img("photo-1600320254374-ce2d293c324e"),
    ],
  },
];

export const modalidades = [...new Set(quadras.map((q) => q.modalidade))];

export function buscarQuadraPorId(id) {
  return quadras.find((q) => q.id === id);
}

// Horários livres de demonstração (sempre os mesmos para cada quadra).
// TODO: trocar pela disponibilidade real vinda do backend.
const gradeHorarios = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
export function horariosLivresHoje(quadra) {
  const deslocamento = quadra.nome.length % 3;
  return gradeHorarios.filter((_, i) => (i + deslocamento) % 2 === 0).slice(0, 3);
}
