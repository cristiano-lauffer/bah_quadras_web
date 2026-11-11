import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Volta a página para o topo sempre que o endereço muda.
 * Links com âncora (ex.: "/#quadras") são ignorados: quem rola é a própria página.
 * Trocar só a "?busca" também não rola (ex.: trocar de seção no perfil mantém a posição).
 */
export default function RolarParaTopo() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
