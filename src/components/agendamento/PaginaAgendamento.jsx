import Header from "../Header.jsx";
import Footer from "../Footer.jsx";

/** Molde das telas de agendamento (cabeçalho, conteúdo e rodapé). */
export default function PaginaAgendamento({ children }) {
  return (
    <div className="public-page ag">
      <Header />
      <main className="ag-container">{children}</main>
      <Footer />
    </div>
  );
}
