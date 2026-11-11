import { Star } from "lucide-react";

/** Nota em estrelas (somente leitura). */
export default function Estrelas({ valor, tamanho = 16 }) {
  return (
    <span className="av-estrelas" role="img" aria-label={`${valor} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={tamanho} className={n <= Math.round(valor) ? "on" : ""} aria-hidden="true" />
      ))}
    </span>
  );
}
