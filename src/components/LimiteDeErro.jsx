import { Component } from "react";
import { RefreshCw } from "lucide-react";
import "../css/LimiteDeErro.css";

// Erro típico quando o site foi publicado de novo e a página antiga tenta
// baixar um arquivo que não existe mais (as páginas carregam sob demanda).
const ehVersaoNova = (erro) =>
  /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(
    String(erro?.message ?? erro)
  );

/**
 * Mostra uma tela amigável em vez de uma página em branco quando algo quebra.
 * Uso: <LimiteDeErro key={pathname}>...</LimiteDeErro> (o key reinicia ao trocar de página).
 */
export default class LimiteDeErro extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    // TODO: enviar para um serviço de monitoramento quando houver um.
    console.error("Erro na página:", erro, info?.componentStack);
  }

  render() {
    const { erro } = this.state;
    if (!erro) return this.props.children;

    const versaoNova = ehVersaoNova(erro);
    return (
      <main className="le" role="alert">
        <div className="le-caixa">
          <span className="le-icone" aria-hidden="true">⚽</span>
          <h1>{versaoNova ? "O Bah Quadras foi atualizado" : "Ops, a bola saiu do campo"}</h1>
          <p>
            {versaoNova
              ? "Saiu uma versão nova do site enquanto você navegava. Recarregue para continuar de onde parou."
              : "Algo deu errado ao abrir esta página. Tente recarregar; se continuar, volte para o início."}
          </p>
          <div className="le-acoes">
            <button type="button" className="le-botao" onClick={() => window.location.reload()}>
              <RefreshCw size={17} aria-hidden="true" /> Recarregar
            </button>
            <a href="/" className="le-botao le-botao-contorno">
              Ir para o início
            </a>
          </div>
        </div>
      </main>
    );
  }
}
