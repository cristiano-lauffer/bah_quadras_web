import "../css/CarregandoPagina.css";

/** Mostrado por um instante enquanto o arquivo de uma página é baixado. */
export default function CarregandoPagina() {
  return (
    <div className="carregando-pagina" role="status" aria-live="polite">
      <span className="carregando-pagina-bola" aria-hidden="true">⚽</span>
      <span className="carregando-pagina-texto">Carregando...</span>
    </div>
  );
}
