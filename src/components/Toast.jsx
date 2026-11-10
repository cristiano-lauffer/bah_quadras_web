import { useEffect } from "react";
import { CircleCheck, X } from "lucide-react";
import "../css/Toast.css";

/** Mensagem flutuante que some sozinha depois de alguns segundos. */
export default function Toast({ mensagem, onFechar, duracao = 4000 }) {
  useEffect(() => {
    if (!mensagem) return undefined;
    const timer = setTimeout(onFechar, duracao);
    return () => clearTimeout(timer);
  }, [mensagem, onFechar, duracao]);

  if (!mensagem) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <CircleCheck size={20} aria-hidden="true" />
      <span>{mensagem}</span>
      <button type="button" onClick={onFechar} aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
