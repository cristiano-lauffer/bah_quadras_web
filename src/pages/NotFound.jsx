import { Link, useNavigate } from "react-router-dom";
import "../NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  function voltarPagina() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <main className="notfound-pagina">
      <div className="notfound-fundo notfound-fundo-um" />
      <div className="notfound-fundo notfound-fundo-dois" />

      <header className="notfound-cabecalho">
        <Link
          to="/"
          className="notfound-logo"
          aria-label="BAH QUADRAS - Página inicial"
        >
          <span className="notfound-logo-icone" aria-hidden="true">
            ⚽
          </span>

          <span className="notfound-logo-texto">
            BAH <strong>QUADRAS</strong>
          </span>
        </Link>

        <Link to="/" className="notfound-link-inicio">
          <span aria-hidden="true">←</span>
          Ir para o início
        </Link>
      </header>

      <section className="notfound-conteudo">
        <div className="notfound-ilustracao" aria-hidden="true">
          <div className="notfound-circulo">
            <span className="notfound-numero">404</span>
            <span className="notfound-bola">⚽</span>
          </div>

          <span className="notfound-detalhe notfound-detalhe-um" />
          <span className="notfound-detalhe notfound-detalhe-dois" />
          <span className="notfound-detalhe notfound-detalhe-tres" />
        </div>

        <span className="notfound-etiqueta">
          OPS! SAÍMOS DO CAMPO
        </span>

        <h1>
          Parece que essa
          <br />
          <span>página saiu de jogo.</span>
        </h1>

        <p className="notfound-descricao">
          Não encontramos o endereço que você tentou acessar.
          Mas não se preocupe: ainda dá tempo de voltar para a partida!
        </p>

        <div className="notfound-acoes">
          <Link to="/" className="notfound-botao-principal">
            <span aria-hidden="true">⌂</span>
            Voltar ao início
            <span className="notfound-seta" aria-hidden="true">
              →
            </span>
          </Link>

          <button
            type="button"
            className="notfound-botao-secundario"
            onClick={voltarPagina}
          >
            Voltar à página anterior
          </button>
        </div>

        <div className="notfound-ajuda">
          <span className="notfound-ajuda-icone" aria-hidden="true">
            ?
          </span>

          <p>
            Precisa de ajuda? Volte ao início e encontre sua próxima quadra.
          </p>
        </div>
      </section>

      <footer className="notfound-rodape">
        <span>© {new Date().getFullYear()} BAH QUADRAS</span>
        <span className="notfound-rodape-divisor">•</span>
        <span>Feito para quem vive o esporte.</span>
      </footer>
    </main>
  );
}