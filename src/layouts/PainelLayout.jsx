import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useTitulo } from "../hooks/useTitulo.js";
import { sair } from "../services/sessaoService.js";
import BotaoTema from "../components/BotaoTema.jsx";
import "../css/Painel.css";

/**
 * Estrutura das áreas logadas (empresa e jogador): menu lateral + barra superior.
 *
 * Props:
 * - variante: "empresa" (menu escuro) ou "usuario" (menu claro)
 * - menu: [{ texto, icone, to, ativo?, prefixo?, emBreve?, badge? }]
 *     "ativo" é opcional; sem ele, o item fica ativo quando o caminho é igual a "to"
 *     (ou começa com "prefixo", se informado).
 * - perfil: { nome, subtitulo, avatar (texto ou elemento) }
 * - titulo, subtitulo: cabeçalho da página (o título também vai para a aba do navegador)
 * - tituloAba: texto da aba, quando for diferente do título
 * - acoes: botões exibidos à direita do título
 */
export default function PainelLayout({ variante = "empresa", rotulo, menu, perfil, titulo, tituloAba, subtitulo, acoes, children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  function sairDaConta() {
    // Nas rotas protegidas, a RotaProtegida também leva ao Login com este aviso.
    navigate("/login", { state: { aviso: "Você saiu da sua conta. Até a próxima partida!" } });
    sair(`${pathname}${search}`);
  }
  // O título da página vira o título da aba (ex.: "Dashboard · Bah Quadras").
  // "tituloAba" permite um texto diferente do cabeçalho (ex.: "Minha área" em vez de "Olá, João!").
  useTitulo(tituloAba ?? (typeof titulo === "string" ? titulo : undefined));

  // "prefixo" deixa o item ativo também nas subpáginas (ex.: /empresa/quadras/nova).
  const estaAtivo = (item) =>
    item.ativo ?? (item.prefixo ? pathname.startsWith(item.prefixo) : `${pathname}${search}` === item.to);

  return (
    <div className={`pn pn-${variante} ${menuAberto ? "pn-menu-aberto" : ""}`}>
      <a href="#pn-conteudo" className="pn-pular">
        Pular para o conteúdo
      </a>

      <aside className="pn-lateral" aria-label="Menu da área">
        <div className="pn-lateral-topo">
          <Link to="/" className="pn-logo">
            <span className="pn-logo-icone" aria-hidden="true">⚽</span>
            <span>
              BAH <strong>QUADRAS</strong>
              {rotulo && <small>{rotulo}</small>}
            </span>
          </Link>
          <button type="button" className="pn-fechar" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="pn-nav" onClick={(e) => e.target.closest("a") && setMenuAberto(false)}>
          {menu.map((item) =>
            item.separador ? (
              <span key={item.separador} className="pn-nav-titulo">
                {item.separador}
              </span>
            ) : item.emBreve ? (
              <span key={item.texto} className="pn-nav-item desativado" aria-disabled="true">
                <item.icone size={19} aria-hidden="true" />
                {item.texto}
                <small className="pn-nav-tag">Em breve</small>
              </span>
            ) : (
              <Link
                key={item.texto}
                to={item.to}
                className={`pn-nav-item ${estaAtivo(item) ? "ativo" : ""}`}
                aria-current={estaAtivo(item) ? "page" : undefined}
              >
                <item.icone size={19} aria-hidden="true" />
                {item.texto}
                {item.badge ? <span className="pn-nav-badge">{item.badge}</span> : null}
              </Link>
            )
          )}
        </nav>

        <div className="pn-lateral-perfil">
          <span className="pn-avatar" aria-hidden="true">{perfil.avatar}</span>
          <div>
            <strong>{perfil.nome}</strong>
            <span>{perfil.subtitulo}</span>
          </div>
          <button type="button" className="pn-sair" onClick={sairDaConta} aria-label="Sair da conta" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {menuAberto && <div className="pn-sombra" onClick={() => setMenuAberto(false)} aria-hidden="true" />}

      <div className="pn-principal">
        <header className="pn-topo">
          <button
            type="button"
            className="pn-abrir"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <Menu size={22} />
          </button>
          <div className="pn-topo-titulo">
            <h1>{titulo}</h1>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <div className="pn-topo-acoes">
            {acoes}
            <BotaoTema />
          </div>
        </header>

        <main id="pn-conteudo" className="pn-conteudo" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
