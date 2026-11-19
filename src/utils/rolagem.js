// Sobe a página até o topo. Suave, a não ser que a pessoa tenha pedido menos
// animação no sistema (acessibilidade: "reduzir movimento").
export function rolarParaOTopo() {
  const semAnimacao = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: semAnimacao ? "auto" : "smooth" });
}

/**
 * Para links que levam à Home (logo, "Início"): se a pessoa já está na Home,
 * o link não muda de página, então só sobe até o topo.
 * Uso: <Link to="/" onClick={(e) => irParaInicio(e, pathname, hash)}>
 */
export function irParaInicio(evento, pathname, hash) {
  if (pathname === "/" && !hash) {
    evento.preventDefault();
    rolarParaOTopo();
  }
}
