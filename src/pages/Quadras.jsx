import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const quadras = [
  {
    id: 1,
    nome: "Arena Sport Society",
    esporte: "Futebol Society",
    avaliacao: "4,8",
    preco: "R$ 80,00/h",
    status: "Ativa",
  },
  {
    id: 2,
    nome: "Arena Sport Futsal",
    esporte: "Futsal",
    avaliacao: "4,7",
    preco: "R$ 70,00/h",
    status: "Ativa",
  },
  {
    id: 3,
    nome: "Arena Sport Beach",
    esporte: "Vôlei de areia",
    avaliacao: "4,9",
    preco: "R$ 60,00/h",
    status: "Ativa",
  },
  {
    id: 4,
    nome: "Arena Sport Basketball",
    esporte: "Basquete",
    avaliacao: "4,6",
    preco: "R$ 75,00/h",
    status: "Ativa",
  },
  {
    id: 5,
    nome: "Arena Sport Tennis",
    esporte: "Beach Tennis",
    avaliacao: "4,8",
    preco: "R$ 65,00/h",
    status: "Ativa",
  },
  {
    id: 6,
    nome: "Arena Sport Premium",
    esporte: "Futebol Society",
    avaliacao: "4,9",
    preco: "R$ 90,00/h",
    status: "Ativa",
  },
];

export default function Quadras() {
  return (
    <div className="dashboard-page">
      <Header dashboard />

      <div className="dashboard-layout">
        <aside className="sidebar">
          <Link to="/" className="side-link">
            ⌂ <span>Início</span>
          </Link>

          <Link to="/empresa/perfil" className="side-link">
            ♙ <span>Meu perfil</span>
          </Link>

          <Link
            to="/empresa/quadras"
            className="side-link active"
          >
            ▦ <span>Minhas quadras</span>
          </Link>

          <button
            className="side-link"
            type="button"
            onClick={() => alert("Reservas serão implementadas depois.")}
          >
            ▣ <span>Reservas</span>
          </button>

          <button
            className="side-link"
            type="button"
            onClick={() => alert("Financeiro será implementado depois.")}
          >
            ＄ <span>Financeiro</span>
          </button>

          <button
            className="side-link"
            type="button"
            onClick={() => alert("Configurações serão implementadas depois.")}
          >
            ⚙ <span>Configurações</span>
          </button>

          <Link to="/login" className="side-link side-logout">
            ⇥ <span>Sair</span>
          </Link>
        </aside>

        <main className="dashboard-content">
          <div className="page-title-row">
            <div>
              <span className="eyebrow">ÁREA DA EMPRESA</span>

              <h1>Minhas quadras</h1>

              <p className="muted">
                Gerencie as quadras disponíveis para reserva.
              </p>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() =>
                alert("Cadastro de quadra será implementado depois.")
              }
            >
              + Cadastrar quadra
            </button>
          </div>

          <section className="courts-management">
            <div className="courts-summary">
              <div>
                <strong>{quadras.length}</strong>
                <span>quadras cadastradas</span>
              </div>

              <div>
                <strong>
                  {quadras.filter((quadra) => quadra.status === "Ativa").length}
                </strong>
                <span>quadras ativas</span>
              </div>
            </div>

            <div className="company-courts-grid">
              {quadras.map((quadra) => (
                <article className="company-court-card" key={quadra.id}>
                  <div className="company-court-image">
                    <span>Quadra esportiva</span>
                  </div>

                  <div className="company-court-content">
                    <div className="company-court-header">
                      <span className="court-type">
                        {quadra.esporte}
                      </span>

                      <span className="court-status">
                        {quadra.status}
                      </span>
                    </div>

                    <h2>{quadra.nome}</h2>

                    <div className="company-court-info">
                      <span>★ {quadra.avaliacao}</span>

                      <strong>{quadra.preco}</strong>
                    </div>

                    <div className="company-court-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          alert(`Editar ${quadra.nome}`)
                        }
                      >
                        ✎ Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() =>
                          alert(`Gerenciar ${quadra.nome}`)
                        }
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}