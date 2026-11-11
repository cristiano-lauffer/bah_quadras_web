import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import PaginaAgendamento from "./PaginaAgendamento.jsx";

export default function QuadraNaoEncontrada() {
  return (
    <PaginaAgendamento>
      <div className="ag-aviso-grande">
        <CircleAlert size={40} aria-hidden="true" />
        <h1>Quadra não encontrada</h1>
        <p>O link pode estar incorreto ou a quadra não está mais disponível.</p>
        <Link to="/agendamento" className="ag-botao">Ver todas as quadras</Link>
      </div>
    </PaginaAgendamento>
  );
}
