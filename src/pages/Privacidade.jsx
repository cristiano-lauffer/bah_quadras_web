import PaginaLegal from "../components/PaginaLegal.jsx";

const secoes = [
  {
    id: "dados",
    titulo: "Quais dados coletamos",
    itens: [
      "Dados da conta: nome, e-mail, telefone e senha (guardada de forma criptografada).",
      "Reservas: quadra, data, horário, valor e forma de pagamento escolhida.",
      "Avaliações que você publica e quadras que você favorita.",
      "Preferências, como o tema claro ou escuro, que ficam salvas no seu próprio navegador.",
    ],
  },
  {
    id: "uso",
    titulo: "Para que usamos",
    itens: [
      "Fazer e gerenciar as suas reservas.",
      "Enviar confirmações, lembretes antes do jogo e avisos de cancelamento.",
      "Mostrar quadras perto de você e melhorar a plataforma.",
      "Enviar novidades e promoções, só se você ativar essa opção em Configurações.",
    ],
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos",
    paragrafos: [
      "Quando você reserva, a empresa responsável pelo espaço recebe o seu nome, telefone e os dados da reserva, para poder receber você no dia.",
      "Não vendemos os seus dados. Só os compartilhamos com outras pessoas ou empresas quando a lei exigir.",
    ],
  },
  {
    id: "direitos",
    titulo: "Seus direitos (LGPD)",
    paragrafos: ["Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode a qualquer momento:"],
    itens: [
      "Saber quais dados temos sobre você e pedir uma cópia.",
      "Corrigir dados incompletos ou desatualizados (em Meus dados).",
      "Pedir a exclusão da sua conta e dos seus dados.",
      "Retirar a autorização para receber novidades e promoções.",
    ],
  },
  {
    id: "seguranca",
    titulo: "Segurança e armazenamento",
    paragrafos: [
      "Usamos conexão segura (HTTPS) e senhas criptografadas. Os dados ficam guardados enquanto a sua conta existir; ao excluí-la, apagamos as informações pessoais, exceto as que a lei manda guardar por mais tempo.",
    ],
  },
  {
    id: "cookies",
    titulo: "Cookies e armazenamento no navegador",
    paragrafos: [
      "Usamos o armazenamento do seu navegador só para o site funcionar: manter você conectado, lembrar o tema escolhido e as quadras favoritas. Não usamos cookies de propaganda.",
    ],
  },
  {
    id: "contato",
    titulo: "Fale com a gente",
    paragrafos: [
      "Para exercer qualquer um dos seus direitos ou tirar dúvidas sobre os seus dados, mande um e-mail para a equipe. Respondemos em até 15 dias.",
    ],
  },
];

export default function Privacidade() {
  return (
    <PaginaLegal
      titulo="Política de Privacidade"
      resumo="Quais dados o Bah Quadras usa, para quê, e como você controla as suas informações."
      atualizadoEm="2026-11-11"
      secoes={secoes}
    />
  );
}
