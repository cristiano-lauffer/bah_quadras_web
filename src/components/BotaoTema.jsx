import { Moon, Sun } from "lucide-react";
import { useTema } from "../hooks/useTema.js";
import "../css/BotaoTema.css";

/**
 * Botão que alterna entre tema claro e escuro.
 * - sobreEscuro: use quando o botão fica sobre um fundo verde-escuro (ex.: cabeçalho do site).
 */
export default function BotaoTema({ sobreEscuro = false }) {
  const { tema, alternar } = useTema();
  const escuro = tema === "escuro";

  return (
    <button
      type="button"
      className={`botao-tema ${sobreEscuro ? "sobre-escuro" : ""}`}
      onClick={alternar}
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
      title={escuro ? "Tema claro" : "Tema escuro"}
    >
      {escuro ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
    </button>
  );
}
