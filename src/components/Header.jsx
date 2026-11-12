import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import BotaoTema from "./BotaoTema.jsx";
import { useSessao } from "../hooks/useSessao.js";
import { sair } from "../services/sessaoService.js";
import { contarNaoLidas } from "../services/notificacoesUsuarioService.js";
import "../css/Header.css";

const links = [
  { to: "/", texto: "Início" },
  { to: "/#quadras", texto: "Quadras" },
  { to: "/#sobre", texto: "Sobre" },
];

/** Atalhos do menu da conta, conforme o tipo de conta. */
function atalhosDa(sessao) {
  if (sessao.tipo === "empresa") {
    return [
      { to: "/empresa/dashboard", texto: "Painel da empresa", icone: LayoutDashboard },
      { to: "/empresa/reservas", texto: "Reservas", icone: CalendarDays },
      { to: "/empresa/perfil", texto: "Perfil da empresa", icone: Building2 },
    ];
  }
  return [
    { to: "/usuario/perfil", texto: "Minha área", icone: LayoutDashboard },
    { to: "/usuario/reservas", texto: "Minhas reservas", icone: CalendarDays },
    { to: "/usuario/notificacoes", texto: "Notificações", icone: Bell, badge: contarNaoLidas() },
    { to: "/usuario/perfil?secao=favoritas", texto: "Favoritas", icone: Heart },
  ];
}

export default function Header() {
  const sessao = useSessao();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const contaRef = useRef(null);

  // Fecha os menus com a tecla Esc; o da conta também ao clicar fora.
  useEffect(() => {
    if (!menuAberto && !contaAberta) return undefined;
    const aoTeclar = (e) => {
      if (e.key !== "Escape") return;
      setMenuAberto(false);
      setContaAberta(false);
    };
    const aoClicar = (e) => contaRef.current && !contaRef.current.contains(e.target) && setContaAberta(false);
    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicar);
    };
  }, [menuAberto, contaAberta]);

  function fecharTudo() {
    setMenuAberto(false);
    setContaAberta(false);
  }

  function sairDaConta() {
    fecharTudo();
    sair();
    navigate("/");
  }

  // Depois de entrar, volta para a página onde a pessoa estava.
  const estadoLogin = pathname === "/" ? undefined : { de: `${pathname}${search}` };
  const atalhos = sessao ? atalhosDa(sessao) : [];
  const primeiroNome = sessao?.nome.split(" ")[0];

  return (
    <header className={`cabecalho ${menuAberto ? "menu-aberto" : ""}`}>
      <div className="cabecalho-conteudo">
        <Link to="/" className="logo" onClick={fecharTudo}>
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
            <Link key={l.to} to={l.to} className="menu-link" onClick={fecharTudo}>
              {l.texto}
            </Link>
          ))}

          {/* No celular, a conta aparece dentro do menu */}
          {sessao ? (
            <div className="menu-conta-celular">
              <div className="conta-identidade">
                <span className="conta-avatar" aria-hidden="true">{sessao.avatar}</span>
                <span>
                  <strong>{sessao.nome}</strong>
                  <small>{sessao.email}</small>
                </span>
              </div>
              {atalhos.map(({ to, texto, icone: Icone, badge }) => (
                <Link key={to} to={to} className="menu-link menu-link-conta" onClick={fecharTudo}>
                  <Icone size={18} aria-hidden="true" /> {texto}
                  {badge ? <span className="conta-badge">{badge}</span> : null}
                </Link>
              ))}
              <button type="button" className="menu-link menu-link-conta conta-sair" onClick={sairDaConta}>
                <LogOut size={18} aria-hidden="true" /> Sair
              </button>
            </div>
          ) : (
            <Link to="/login" state={estadoLogin} className="botao-entrar menu-entrar-celular" onClick={fecharTudo}>
              Entrar
            </Link>
          )}
        </nav>

        <div className="cabecalho-acoes">
          <BotaoTema sobreEscuro />

          {sessao ? (
            <div className="conta" ref={contaRef}>
              <button
                type="button"
                className="conta-botao"
                onClick={() => setContaAberta((v) => !v)}
                aria-expanded={contaAberta}
                aria-controls="menu-conta"
                aria-label={`Conta de ${sessao.nome}`}
              >
                <span className="conta-avatar" aria-hidden="true">{sessao.avatar}</span>
                <span className="conta-nome">{primeiroNome}</span>
                <ChevronDown size={16} aria-hidden="true" className="conta-seta" />
              </button>

              {contaAberta && (
                <div id="menu-conta" className="conta-menu">
                  <div className="conta-identidade">
                    <span className="conta-avatar" aria-hidden="true">{sessao.avatar}</span>
                    <span>
                      <strong>{sessao.nome}</strong>
                      <small>{sessao.email}</small>
                    </span>
                  </div>
                  <nav aria-label="Minha conta">
                    {atalhos.map(({ to, texto, icone: Icone, badge }) => (
                      <Link key={to} to={to} className="conta-item" onClick={fecharTudo}>
                        <Icone size={17} aria-hidden="true" /> {texto}
                        {badge ? <span className="conta-badge">{badge}</span> : null}
                      </Link>
                    ))}
                  </nav>
                  <button type="button" className="conta-item conta-sair" onClick={sairDaConta}>
                    <LogOut size={17} aria-hidden="true" /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" state={estadoLogin} className="botao-entrar">
              Entrar
            </Link>
          )}

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

