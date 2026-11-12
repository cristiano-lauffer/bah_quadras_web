import { useSyncExternalStore } from "react";
import { observarSessao, sessaoAtual } from "../services/sessaoService.js";

/**
 * Quem está logado agora (ou null). A tela atualiza sozinha ao entrar ou sair.
 *   const sessao = useSessao();
 *   sessao?.tipo === "empresa"
 */
export function useSessao() {
  return useSyncExternalStore(observarSessao, sessaoAtual, () => null);
}
