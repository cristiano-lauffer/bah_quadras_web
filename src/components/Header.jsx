import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BotaoTema from "./BotaoTema.jsx";
import "../css/Header.css";

const links = [
  { to: "/", texto: "Início" },
  { to: "/#quadras", texto: "Quadras" },
  { to: "/#sobre", texto: "Sobre" },
];

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  // Fecha com a tecla Esc.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <header className={`cabecalho ${menuAberto ? "menu-aberto" : ""}`}>
      <div className="cabecalho-conteudo">
        <Link to="/" className="logo" onClick={() => setMenuAberto(false)}>
          <span className="logo-simbolo" aria-hidden="true">
            ⚽
          </span>

          <span className="logo-texto">
            <strong>BAH</strong>
            <span>QUADRAS</span>
          </span>
        </Link>

        <nav id="menu-principal" className="menu-principal" aria-label="Menu principal">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="menu-link" onClick={() => setMenuAberto(false)}>
              {l.texto}
            </Link>
          ))}
          <Link to="/login" className="botao-entrar menu-entrar-celular" onClick={() => setMenuAberto(false)}>
            Entrar
          </Link>
        </nav>

        <div className="cabecalho-acoes">
          <BotaoTema sobreEscuro />
          <Link to="/login" className="botao-entrar">
            Entrar
          </Link>
          <button
            type="button"
            className="botao-menu"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
