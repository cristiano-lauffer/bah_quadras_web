import { Link } from "react-router-dom";
import { ArrowRight, Building2, User } from "lucide-react";
import AuthLayout from "../layouts/AuthLayout.jsx";

const opcoes = [
  {
    para: "/cadastro/usuario",
    icone: User,
    titulo: "Quero jogar",
    texto: "Crie sua conta grátis para encontrar quadras e reservar horários.",
    acao: "Criar conta de jogador",
  },
  {
    para: "/cadastro/empresa",
    icone: Building2,
    titulo: "Tenho uma quadra",
    texto: "Quer anunciar seu espaço? Fale com nossa equipe por WhatsApp ou e-mail.",
    acao: "Falar com a equipe",
  },
];

export default function Cadastro() {
  return (
    <AuthLayout
      titulo="Bora jogar?"
      destaque="Comece agora."
      texto="Jogadores criam a conta na hora. Donos de quadra falam com a gente para colocar o espaço no ar."
      topo={
        <>
          <span>Já tem conta?</span>
          <Link to="/login" className="auth-link-forte">
            Entrar
          </Link>
        </>
      }
    >
      <header className="auth-cabecalho">
        <h2>Como você quer usar o Bah Quadras?</h2>
        <p>Escolha a opção que combina com você.</p>
      </header>

      <div className="auth-opcoes">
        {opcoes.map(({ para, icone: Icone, titulo, texto, acao }) => (
          <Link key={para} to={para} className="auth-opcao">
            <span className="auth-opcao-icone" aria-hidden="true">
              <Icone size={24} />
            </span>
            <span className="auth-opcao-texto">
              <strong>{titulo}</strong>
              <span>{texto}</span>
              <span className="auth-opcao-acao">
                {acao} <ArrowRight size={16} aria-hidden="true" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </AuthLayout>
  );
}
