import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import FormularioQuadra from "../components/FormularioQuadra.jsx";

// US4 - Empresa cadastra quadras
export default function CadastroQuadra() {
  return (
    <EmpresaLayout titulo="Nova quadra" subtitulo="Preencha os dados que os jogadores vão ver">
      <FormularioQuadra />
    </EmpresaLayout>
  );
}
