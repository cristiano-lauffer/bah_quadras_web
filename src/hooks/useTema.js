import { useEffect, useState } from "react";

const CHAVE = "bahquadras:tema";
const consultaEscuro = () => window.matchMedia?.("(prefers-color-scheme: dark)");

function lerEscolha() {
  try {
    const valor = localStorage.getItem(CHAVE);
    return valor === "claro" || valor === "escuro" ? valor : null;
  } catch {
    return null;
  }
}

/**
 * Tema claro/escuro.
 * - Sem escolha salva, segue o tema do sistema (celular/computador).
 * - alternar() troca e lembra a escolha no navegador.
 * O index.html aplica o tema salvo antes da página aparecer (sem "piscar").
 */
export function useTema() {
  const [escolhido, setEscolhido] = useState(lerEscolha);
  const [sistema, setSistema] = useState(() => (consultaEscuro()?.matches ? "escuro" : "claro"));

  // Acompanha se o usuário muda o tema do sistema com a página aberta.
  useEffect(() => {
    const consulta = consultaEscuro();
    if (!consulta) return undefined;
    const mudar = () => setSistema(consulta.matches ? "escuro" : "claro");
    consulta.addEventListener("change", mudar);
    return () => consulta.removeEventListener("change", mudar);
  }, []);

  const tema = escolhido ?? sistema;

  function alternar() {
    const novo = tema === "escuro" ? "claro" : "escuro";
    setEscolhido(novo);
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      /* sem localStorage: vale só até recarregar */
    }
  }

  return { tema, alternar };
}
