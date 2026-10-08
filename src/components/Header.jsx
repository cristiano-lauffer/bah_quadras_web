import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header({ dashboard = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`site-header ${dashboard ? "dashboard-header" : ""}`}>
      <Link to="/" className="brand" aria-label="Bah Quadras - início">
        <span className="brand-mark">⚽</span>
        <span>BAH QUADRAS</span>
      </Link>

      {dashboard ? (
        <div className="header-user">
          <span className="company-pill">Empresa</span>
          <span className="avatar-small">A</span>
        </div>
      ) : (
        <>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
            <NavLink to="/" onClick={() => setMenuOpen(false)}>Início</NavLink>
            <a href="/#quadras" onClick={() => setMenuOpen(false)}>Quadras</a>
            <a href="/#sobre" onClick={() => setMenuOpen(false)}>Sobre</a>
            <Link className="nav-login" to="/login" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
