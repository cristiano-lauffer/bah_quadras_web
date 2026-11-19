import { Link, useLocation } from "react-router-dom";
import { irParaInicio, rolarParaOTopo } from "../utils/rolagem.js";
import "../css/Footer.css";

export default function Footer() {
  const { pathname, hash } = useLocation();
  const paraInicio = (e) => irParaInicio(e, pathname, hash);

  return (
    <footer className="rodape">
      <div className="rodape-conteudo">
        <div className="rodape-marca">
          <Link to="/" className="logo rodape-logo" onClick={paraInicio}>
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

          <Link to="/" onClick={paraInicio}>
            Início
          </Link>
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

          <Link to="/#quadras" className="rodape-botao">
            Encontrar quadras →
          </Link>
        </div>
      </div>

      <div className="rodape-final">
        <p>
          © {new Date().getFullYear()} BAH QUADRAS. Todos os direitos
          reservados.
        </p>

        <nav className="rodape-legal" aria-label="Documentos">
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/privacidade">Privacidade</Link>
        </nav>

        {/* Sobe a página atual (antes era um link para a Home e, na própria Home, não fazia nada). */}
        <button type="button" className="rodape-voltar" onClick={rolarParaOTopo}>
          Voltar ao topo <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}