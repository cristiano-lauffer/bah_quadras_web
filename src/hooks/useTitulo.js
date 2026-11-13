import { useEffect } from "react";

const SITE = "Bah Quadras";

/**
 * Define o título da aba do navegador.
 *   useTitulo("Arena Sport")  ->  "Arena Sport · Bah Quadras"
 *   useTitulo()                 ->  "Bah Quadras"
 */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${SITE}` : SITE;
  }, [titulo]);
}
