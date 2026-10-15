import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <div className="rodape-marca">
          <Link to="/" className="logo rodape-logo">
            <span className="logo-simbolo" aria-hidden="true">
              ⚽
            </span>

            <span className="logo-texto">
              <strong>BAH</strong>
              <span>QUADRAS</span>
            </span>
          </Link>

          <p>
            Mais esporte, mais diversão, mais momentos.
          </p>
        </div>

        <div className="rodape-links">
          <h3>Navegação</h3>

          <Link to="/">Início</Link>
          <Link to="/#quadras">Quadras</Link>
          <Link to="/#sobre">Sobre</Link>
        </div>

        <div className="rodape-links">
          <h3>Minha conta</h3>

          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/cadastro/empresa">Cadastrar empresa</Link>
        </div>

        <div className="rodape-contato">
          <h3>Vamos jogar?</h3>

          <p>
            Encontre seu espaço esportivo e prepare-se para a próxima partida.
          </p>

          <Link to="/login" className="rodape-botao">
            Encontrar quadras →
          </Link>
        </div>
      </div>

      <div className="rodape-final">
        <p>
          © {new Date().getFullYear()} BAH QUADRAS. Todos os direitos
          reservados.
        </p>

        <Link to="/" className="rodape-voltar">
          Voltar ao início ↑
        </Link>
      </div>
    </footer>
  );
}