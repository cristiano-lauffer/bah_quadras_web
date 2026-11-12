import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, FileText, Mail, ShieldCheck } from "lucide-react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { CONTATO, linkEmail } from "../config/contato.js";
import { formatarData } from "../utils/formatadores.js";
import { useTitulo } from "../hooks/useTitulo.js";
import "../css/PaginaLegal.css";

const paginas = [
  { to: "/termos", texto: "Termos de Uso", icone: FileText },
  { to: "/privacidade", texto: "Política de Privacidade", icone: ShieldCheck },
];

/**
 * Página de texto (Termos de Uso, Privacidade...).
 * - secoes: [{ id, titulo, paragrafos?: [], itens?: [] }]
 *   O "id" vira âncora: /termos#cancelamento abre direto nessa seção.
 */
export default function PaginaLegal({ titulo, resumo, atualizadoEm, secoes }) {
  useTitulo(titulo);
  const { hash } = useLocation();

  // A página é carregada sob demanda, então o navegador não acha a âncora sozinho.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="lg">
      <Header />

      <main className="lg-container">
        <header className="lg-cabecalho">
          <nav className="lg-abas" aria-label="Documentos">
            {paginas.map(({ to, texto, icone: Icone }) => (
              <Link key={to} to={to} className="lg-aba" aria-current={texto === titulo ? "page" : undefined}>
                <Icone size={16} aria-hidden="true" /> {texto}
              </Link>
            ))}
          </nav>
          <h1>{titulo}</h1>
          <p>{resumo}</p>
          <small>Última atualização: {formatarData(atualizadoEm)}</small>
        </header>

        <div className="lg-grade">
          <nav className="lg-sumario" aria-label="Nesta página">
            <strong>Nesta página</strong>
            <ol>
              {secoes.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.titulo}</a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="lg-texto">
            <p className="lg-nota" role="note">
              O Bah Quadras é um projeto acadêmico em desenvolvimento. Este texto mostra como a plataforma
              vai funcionar e será revisado antes do lançamento.
            </p>

            {secoes.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titulo`}>
                <h2 id={`${s.id}-titulo`}>
                  <span aria-hidden="true">{i + 1}.</span> {s.titulo}
                </h2>
                {s.paragrafos?.map((p) => <p key={p}>{p}</p>)}
                {s.itens && (
                  <ul>
                    {s.itens.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <aside className="lg-contato">
              <div>
                <strong>Ficou alguma dúvida?</strong>
                <p>Fale com a equipe do Bah Quadras ({CONTATO.horario.toLowerCase()}).</p>
              </div>
              <a href={linkEmail(`Dúvida sobre: ${titulo}`)} className="lg-botao">
                <Mail size={17} aria-hidden="true" /> {CONTATO.email}
              </a>
            </aside>

            <Link to="/" className="lg-voltar">
              Encontrar quadras <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
