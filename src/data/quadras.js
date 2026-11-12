// Dados de demonstração das quadras.
// A nota e a quantidade de avaliações NÃO ficam aqui: são calculadas a partir de
// avaliações (veja notaDaQuadra em services/avaliacoesService.js) pelo catalogoService.
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
    descricao:
      "Quadras de areia à beira do Guaíba, com aluguel de raquetes e bolinhas. O lugar certo para jogar beach tennis no fim de tarde.",
    imagens: [
      img("photo-1592656094267-764a45160876"),
      img("photo-1612872087720-bb876e2e67d1"),
      img("photo-1622163642998-1ea32b0bbc67"),
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
  // Mais exemplos (empresas e endereços fictícios, só para demonstração).
  // ---------------------------------------------------------------
  {
    id: "turbo-kart-indoor",
    nome: "Turbo Kart Indoor",
    modalidade: "Kart",
    bairro: "Navegantes",
    cidade: "Porto Alegre/RS",
    endereco: "Av. Sertório, 1500 - Navegantes, Porto Alegre/RS",
    cobranca: { unidade: "bateria", minutos: 10 },
    preco: 70, // por bateria
    destaque: true,
    descricao:
      "Kartódromo coberto com pista de 600 metros, cronometragem eletrônica e telão com o ranking ao vivo. Chuva não cancela a corrida!",
    imagens: [img("photo-1508550794981-ed0e94d56589"), img("photo-1505570554449-69ce7d4fa36b")],
    estrutura: ["Pista coberta", "Cronometragem eletrônica", "Capacete e balaclava inclusos", "Lanchonete", "Estacionamento"],
  },
  {
    id: "pampa-kart-racing",
    nome: "Pampa Kart Racing",
    modalidade: "Kart",
    bairro: "Mathias Velho",
    cidade: "Canoas/RS",
    endereco: "Rua Boqueirão, 2800 - Mathias Velho, Canoas/RS",
    cobranca: { unidade: "bateria", minutos: 20 },
    preco: 120, // por bateria
    descricao:
      "Pista ao ar livre de 1.100 metros com curvas de alta velocidade. Karts de 13 cv, ideal para quem quer sentir a adrenalina de uma corrida de verdade.",
    imagens: [img("photo-1505570554449-69ce7d4fa36b"), img("photo-1508550794981-ed0e94d56589")],
    estrutura: ["Pista ao ar livre", "Karts 13 cv", "Pódio para fotos", "Área de eventos", "Estacionamento"],
  },
  {
    id: "tenis-clube-figueira",
    nome: "Tênis Clube Figueira",
    modalidade: "Tênis",
    bairro: "Três Figueiras",
    cidade: "Porto Alegre/RS",
    endereco: "Rua Carlos Trein Filho, 640 - Três Figueiras, Porto Alegre/RS",
    preco: 95,
    descricao:
      "Três quadras de saibro e uma de piso rápido, cercadas de verde. Aluguel de raquetes, máquina de bolinhas e professores para aulas avulsas.",
    imagens: [
      img("photo-1554068865-24cecd4e34b8"),
      img("photo-1622279457486-62dcc4a431d6"),
      img("photo-1617883861744-13b534e3b928"),
    ],
    estrutura: ["Quadras de saibro", "Aluguel de raquetes", "Vestiário", "Iluminação", "Café"],
  },
  {
    id: "smash-badminton-club",
    nome: "Smash Badminton Club",
    modalidade: "Badminton",
    bairro: "Vila Imbuí",
    cidade: "Cachoeirinha/RS",
    endereco: "Av. Flores da Cunha, 1200 - Vila Imbuí, Cachoeirinha/RS",
    preco: 50,
    descricao:
      "Ginásio com quatro quadras oficiais de badminton, piso emborrachado e iluminação sem reflexo. Empresta raquetes e petecas para quem está começando.",
    imagens: [
      img("photo-1626224583764-f87db24ac4ea"),
      img("photo-1546519638-68e109498ffc"),
      img("photo-1574629810360-7efbbe195018"),
    ],
    estrutura: ["Quadras oficiais", "Empréstimo de raquetes", "Vestiário", "Bebedouro", "Ar-condicionado"],
  },
  {
    id: "campo-do-parque",
    nome: "Campo do Parque Society",
    modalidade: "Futebol society",
    bairro: "Centro",
    cidade: "Canoas/RS",
    endereco: "Rua Tiradentes, 455 - Centro, Canoas/RS",
    preco: 85,
    descricao:
      "Campo de society ao lado do parque, com grama sintética, refletores de LED e bar com telão para ver o jogo do Grêmio ou do Inter depois da pelada.",
    imagens: [
      img("photo-1487466365202-1afdb86c764e"),
      img("photo-1560272564-c83b66b1ad12"),
      img("photo-1575361204480-aadea25e6e68"),
    ],
    estrutura: ["Estacionamento", "Vestiário", "Bar com telão", "Iluminação de LED"],
  },
  {
    id: "garrafao-3x3",
    nome: "Garrafão 3x3",
    modalidade: "Basquete",
    bairro: "Morada do Vale",
    cidade: "Gravataí/RS",
    endereco: "Rua Anápio Gomes, 980 - Morada do Vale, Gravataí/RS",
    preco: 55,
    descricao:
      "Quadra de basquete 3x3 com cobertura, piso de alta aderência e som ambiente. Point da galera do basquete de rua na Região Metropolitana.",
    imagens: [
      img("photo-1515523110800-9415d13b84a8"),
      img("photo-1504450758481-7338eba7524a"),
      img("photo-1519861531473-9200262188bf"),
    ],
    estrutura: ["Quadra coberta", "Som ambiente", "Bebedouro", "Bicicletário"],
  },

  // ---------------------------------------------------------------
  // Empresas parceiras reais. Elas entram SEM nota e SEM avaliações
  // (nenhuma avaliação delas em data/avaliacoes.js) para não inventar opiniões sobre empresas de verdade.
  // TODO: confirmar com cada empresa os campos marcados como "a confirmar".
  // ---------------------------------------------------------------
  {
    id: "velopark-kart",
    nome: "Velopark Kart",
    modalidade: "Kart",
    bairro: "BR-386, km 428",
    cidade: "Nova Santa Rita/RS",
    endereco: "BR-386, km 428 - Nova Santa Rita/RS",
    mapa: "Velopark, Nova Santa Rita - RS", // busca usada no mapa (mais precisa que o km da rodovia)
    // Kart é cobrado por bateria, não por hora.
    cobranca: { unidade: "bateria", minutos: 15 },
    preco: 90, // por bateria. TODO: valor ilustrativo, confirmar a tabela de preços com o Velopark
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
      img("photo-1622163642998-1ea32b0bbc67"),
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
