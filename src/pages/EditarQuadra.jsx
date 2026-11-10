import { Link, useParams } from "react-router-dom";
import { Clock, LoaderCircle, SearchX } from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import FormularioQuadra from "../components/FormularioQuadra.jsx";
import { useDados } from "../hooks/useDados.js";
import { buscarQuadra } from "../services/quadrasService.js";

// US4 e US6 - Empresa edita a quadra e atualiza o preço
export default function EditarQuadra() {
  const { id } = useParams();
  const { dados: quadra, carregando, erro } = useDados(() => buscarQuadra(id), [id]);

  return (
    <EmpresaLayout
      titulo={quadra ? `Editar ${quadra.nome}` : "Editar quadra"}
      subtitulo="Atualize os dados, o preço ou a situação da quadra"
      acoes={
        quadra && (
          <Link to={`/empresa/quadras/${id}/horarios`} className="pn-botao pn-botao-contorno">
            <Clock size={17} aria-hidden="true" /> Horários
          </Link>
        )
      }
    >
      {carregando ? (
        <p className="pn-texto-suave" role="status">
          <LoaderCircle size={16} aria-hidden="true" /> Carregando...
        </p>
      ) : erro ? (
        <div className="pn-vazio">
          <SearchX size={40} aria-hidden="true" />
          <h3>Quadra não encontrada</h3>
          <p>Ela pode ter sido removida ou o endereço está incorreto.</p>
          <Link to="/empresa/quadras" className="pn-botao">Voltar para Minhas quadras</Link>
        </div>
      ) : (
        // "key" garante que o formulário reinicia ao trocar de quadra.
        <FormularioQuadra key={quadra.id} inicial={quadra} />
      )}
    </EmpresaLayout>
  );
}
