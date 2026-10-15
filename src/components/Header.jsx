import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <Link to="/" className="logo">
          <span className="logo-simbolo" aria-hidden="true">
            ⚽
          </span>

          <span className="logo-texto">
            <strong>BAH</strong>
            <span>QUADRAS</span>
          </span>
        </Link>

        <nav className="menu-principal" aria-label="Menu principal">
          <Link to="/" className="menu-link">
            Início
          </Link>

          <Link to="/#quadras" className="menu-link">
            Quadras
          </Link>

          <Link to="/#sobre" className="menu-link">
            Sobre
          </Link>
        </nav>

        <div className="cabecalho-acoes">
          <Link
            to="/login"
            className="botao-entrar"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}