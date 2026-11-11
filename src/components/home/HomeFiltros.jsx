import { faixasPreco, ordenacoes } from "../../utils/filtrosQuadras.js";

/** Filtros de cidade, preço e ordenação da lista de quadras. */
export default function HomeFiltros({ cidades, cidade, onCidade, faixaPreco, onFaixaPreco, ordem, onOrdem, filtrosAtivos, onLimpar }) {
  return (
    <div className="home-filtros">
      <label className="home-ordenar">
        Cidade
        <select value={cidade} onChange={(e) => onCidade(e.target.value)}>
          <option value="todas">Todas</option>
          {cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="home-ordenar">
        Preço
        <select value={faixaPreco} onChange={(e) => onFaixaPreco(e.target.value)}>
          {Object.entries(faixasPreco).map(([valor, { texto }]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </label>
      <label className="home-ordenar">
        Ordenar
        <select value={ordem} onChange={(e) => onOrdem(e.target.value)}>
          {Object.entries(ordenacoes).map(([valor, { texto }]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </label>
      {filtrosAtivos > 0 && (
        <button type="button" className="home-limpar" onClick={onLimpar}>
          Limpar filtros ({filtrosAtivos})
        </button>
      )}
    </div>
  );
}
