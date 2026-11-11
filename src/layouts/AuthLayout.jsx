import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import BotaoTema from "../components/BotaoTema.jsx";
import "../css/Auth.css";

const vantagensPadrao = [
  "Quadras de vários esportes em um só lugar",
  "Horários disponíveis em tempo real",
  "Reserve em poucos cliques, sem ligação",
];

/**
 * Layout das telas de autenticação (Login e Cadastro).
 * - topo: conteúdo do canto superior direito (ex.: link para criar conta)
 * - titulo / destaque / texto: mensagem do painel lateral
 */
export default function AuthLayout({
  topo,
  titulo = "O esporte aproxima.",
  destaque = "A gente conecta.",
  texto = "Encontre a quadra ideal, reúna sua galera e transforme qualquer dia em uma grande partida.",
  vantagens = vantagensPadrao,
  children,
}) {
  return (
    <div className="auth">
      <aside className="auth-lateral">
        <Link to="/" className="auth-logo" aria-label="Bah Quadras - página inicial">
          <span className="auth-logo-icone" aria-hidden="true">⚽</span>
          <span>
            BAH <strong>QUADRAS</strong>
          </span>
        </Link>

        <div className="auth-lateral-mensagem">
          <h1>
            {titulo}
            <em>{destaque}</em>
          </h1>
          <p>{texto}</p>

          <ul className="auth-vantagens">
            {vantagens.map((v) => (
              <li key={v}>
                <span aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-lateral-rodape">Feito para quem vive o esporte.</p>
      </aside>

      <main className="auth-conteudo">
        <div className="auth-topo">
          <Link to="/" className="auth-logo auth-logo-mobile" aria-label="Bah Quadras - página inicial">
            <span className="auth-logo-icone" aria-hidden="true">⚽</span>
            <span>
              BAH <strong>QUADRAS</strong>
            </span>
          </Link>
          <div className="auth-topo-acao">
            {topo}
            <BotaoTema />
          </div>
        </div>

        <div className="auth-caixa">{children}</div>

        <footer className="auth-rodape">
          © {new Date().getFullYear()} Bah Quadras. Todos os direitos reservados.
        </footer>
      </main>
    </div>
  );
}

/** Campo de formulário com rótulo, ícone e mensagem de erro. */
export function Campo({ id, rotulo, icone: Icone, erro, dica, acao, children }) {
  return (
    <div className={`auth-campo ${erro ? "com-erro" : ""}`}>
      <div className="auth-campo-rotulo">
        <label htmlFor={id}>{rotulo}</label>
        {acao}
      </div>
      <div className="auth-input">
        {Icone && <Icone className="auth-input-icone" size={18} aria-hidden="true" />}
        {children}
      </div>
      {erro ? (
        <p className="auth-erro" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      ) : (
        dica && <p className="auth-dica">{dica}</p>
      )}
    </div>
  );
}
