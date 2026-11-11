import "../css/Esqueleto.css";

/**
 * Blocos cinzas no formato do conteúdo, mostrados enquanto os dados carregam.
 * - tipo: "cards" | "lista" | "kpis" | "botoes"
 * - quantidade: quantos itens desenhar
 * - rotulo: texto lido por leitores de tela
 */
export default function Esqueleto({ tipo = "lista", quantidade = 3, rotulo = "Carregando..." }) {
  const itens = Array.from({ length: quantidade }, (_, i) => i);

  return (
    <div className={`esq esq-${tipo}`} role="status" aria-busy="true" aria-live="polite">
      <span className="esq-sr">{rotulo}</span>

      {tipo === "cards" &&
        itens.map((i) => (
          <div key={i} className="esq-card" aria-hidden="true">
            <div className="esq-bloco esq-foto" />
            <div className="esq-card-corpo">
              <div className="esq-bloco esq-linha curta" />
              <div className="esq-bloco esq-linha grossa" />
              <div className="esq-bloco esq-linha media" />
            </div>
          </div>
        ))}

      {tipo === "lista" &&
        itens.map((i) => (
          <div key={i} className="esq-item" aria-hidden="true">
            <div className="esq-bloco esq-quadrado" />
            <div className="esq-item-texto">
              <div className="esq-bloco esq-linha media" />
              <div className="esq-bloco esq-linha curta" />
            </div>
            <div className="esq-bloco esq-pilula" />
          </div>
        ))}

      {tipo === "kpis" &&
        itens.map((i) => (
          <div key={i} className="esq-kpi" aria-hidden="true">
            <div className="esq-bloco esq-linha curta" />
            <div className="esq-bloco esq-linha grossa media" />
          </div>
        ))}

      {tipo === "botoes" && itens.map((i) => <div key={i} className="esq-bloco esq-botao" aria-hidden="true" />)}
    </div>
  );
}
