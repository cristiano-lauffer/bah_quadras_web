import "../css/GraficoBarras.css";

// Escolhe um topo "redondo" para o eixo Y (ex.: 12.740 -> 15.000).
function eixoBonito(maximo, divisoes = 4) {
  if (maximo <= 0) return { topo: 1, marcas: [0, 1] };
  const bruto = maximo / divisoes;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto);
  const topo = Math.ceil(maximo / passo) * passo;
  return { topo, marcas: Array.from({ length: Math.round(topo / passo) + 1 }, (_, i) => i * passo) };
}

/**
 * Gráfico de colunas de uma série (um eixo só).
 * - dados: [{ rotulo, rotuloLongo, valor, detalhe? }]
 * - formatar: valor -> texto completo (dica e rótulo da última coluna)
 * - formatarEixo: valor -> texto curto do eixo Y
 * Cada coluna é um botão: a dica aparece ao passar o mouse ou focar com o teclado.
 */
export default function GraficoBarras({ dados, formatar, formatarEixo = String }) {
  const { topo, marcas } = eixoBonito(Math.max(...dados.map((d) => d.valor)));
  const ultimo = dados.length - 1;

  return (
    <div className="gb">
      <div className="gb-area">
        {marcas.map((m) => (
          <div key={m} className="gb-grade" style={{ bottom: `${(m / topo) * 100}%` }}>
            <span>{formatarEixo(m)}</span>
          </div>
        ))}

        <div className="gb-colunas">
          {dados.map((d, i) => (
            <div key={d.rotulo} className="gb-coluna">
              <button type="button" className="gb-alvo" aria-label={`${d.rotuloLongo}: ${formatar(d.valor)}`}>
                <span className="gb-barra" style={{ height: `${(d.valor / topo) * 100}%` }}>
                  {i === ultimo && <span className="gb-rotulo">{formatar(d.valor)}</span>}
                </span>
                <span className="gb-dica" role="tooltip">
                  <strong>{d.rotuloLongo}</strong>
                  <span>{formatar(d.valor)}</span>
                  {d.detalhe && <small>{d.detalhe}</small>}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="gb-meses" aria-hidden="true">
        {dados.map((d) => (
          <span key={d.rotulo}>{d.rotulo}</span>
        ))}
      </div>
    </div>
  );
}
