import PaginaLegal from "../components/PaginaLegal.jsx";

const secoes = [
  {
    id: "sobre",
    titulo: "O que é o Bah Quadras",
    paragrafos: [
      "O Bah Quadras é uma plataforma que conecta jogadores a espaços esportivos (quadras, campos, pistas de kart e similares). Pelo site, você encontra o espaço, vê os horários livres e faz a sua reserva.",
      "O Bah Quadras não é o dono das quadras: cada espaço é administrado por uma empresa parceira, que define preços, horários, regras de uso e a política de cancelamento.",
    ],
  },
  {
    id: "conta",
    titulo: "Sua conta",
    itens: [
      "Para reservar, você precisa ter uma conta com nome, e-mail e telefone verdadeiros.",
      "A senha é pessoal. Não compartilhe com ninguém e avise a gente se suspeitar que alguém acessou a sua conta.",
      "Você é responsável pelas reservas feitas na sua conta.",
      "Você pode excluir a sua conta a qualquer momento em Configurações.",
    ],
  },
  {
    id: "reservas",
    titulo: "Reservas",
    itens: [
      "A reserva fica confirmada quando aparece em Minhas reservas com o status \"Confirmada\".",
      "O valor mostrado no resumo é o que você paga. No kart, o preço é por bateria; nas quadras, por hora.",
      "Hoje o pagamento é feito no local, na forma escolhida na hora de reservar.",
      "Chegue com alguns minutos de antecedência: o horário termina no tempo reservado, mesmo que o jogo comece atrasado.",
    ],
  },
  {
    id: "cancelamento",
    titulo: "Cancelamento e remarcação",
    paragrafos: [
      "Cada empresa tem a sua política de cancelamento, que aparece na página da quadra e antes de você confirmar a reserva. Ao reservar, você concorda com ela.",
      "Você pode cancelar pela página Minhas reservas. Se a empresa precisar cancelar (chuva em quadra aberta, manutenção, etc.), você será avisado pelas notificações e por e-mail.",
    ],
  },
  {
    id: "uso",
    titulo: "Uso dos espaços",
    itens: [
      "Respeite as regras do local, os funcionários e os outros jogadores.",
      "Danos causados ao espaço podem ser cobrados pela empresa responsável.",
      "Atividades esportivas têm riscos. Use o equipamento adequado e respeite os seus limites.",
    ],
  },
  {
    id: "avaliacoes",
    titulo: "Avaliações",
    paragrafos: [
      "Depois de jogar, você pode avaliar o espaço. As avaliações são públicas e ajudam outros jogadores a escolher.",
      "Não são permitidas ofensas, discurso de ódio, dados pessoais de terceiros ou propaganda. Avaliações assim podem ser removidas. A empresa pode responder publicamente à sua avaliação.",
    ],
  },
  {
    id: "empresas",
    titulo: "Para empresas parceiras",
    itens: [
      "A empresa deve manter preços, horários e fotos atualizados e fiéis ao espaço real.",
      "Reservas confirmadas pela plataforma devem ser respeitadas.",
      "A empresa é responsável pela segurança e manutenção do espaço.",
    ],
  },
  {
    id: "mudancas",
    titulo: "Mudanças nestes termos",
    paragrafos: [
      "Podemos atualizar estes termos para acompanhar novidades da plataforma. Quando a mudança for importante, avisaremos por e-mail ou por uma notificação no site.",
    ],
  },
];

export default function Termos() {
  return (
    <PaginaLegal
      titulo="Termos de Uso"
      resumo="As regras para usar o Bah Quadras, escritas da forma mais simples possível."
      atualizadoEm="2026-11-11"
      secoes={secoes}
    />
  );
}
