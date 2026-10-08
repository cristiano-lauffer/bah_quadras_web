import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PerfilEmpresa() {
  return (
    <div className="dashboard-page">
      <Header dashboard />

      <div className="dashboard-layout">
        <aside className="sidebar">
          <Link to="/" className="side-link">
            ⌂ <span>Início</span>
          </Link>

          <Link to="/empresa/perfil" className="side-link active">
            ♙ <span>Meu perfil</span>
          </Link>

          <Link to="/empresa/quadras" className="side-link">
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
              <h1>Perfil da empresa</h1>
              <p className="muted">
                Visualize e gerencie as informações da sua empresa.
              </p>
            </div>

            <Link to="/empresa/editar" className="btn btn-primary">
              ✎ Editar perfil
            </Link>
          </div>

          <section className="company-profile-card">
            <div className="company-top">
              <div className="company-avatar">⚽</div>

              <div className="company-main-info">
                <div className="company-name-row">
                  <h2>Arena Sport</h2>
                  <span className="status-badge">Perfil ativo</span>
                </div>

                <p className="muted">
                  CNPJ: 12.345.678/0001-90
                </p>

                <p className="muted">
                  Telefone: (51) 98765-4321
                </p>

                <p className="muted">
                  E-mail: contato@arenasport.com
                </p>
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-columns">
              <div>
                <div className="section-title-row compact">
                  <h3>Sobre a empresa</h3>

                  <Link
                    to="/empresa/editar"
                    className="icon-link"
                    aria-label="Editar descrição"
                  >
                    ✎
                  </Link>
                </div>

                <p className="profile-description">
                  Somos uma empresa especializada em quadras esportivas,
                  oferecendo espaços de qualidade para você reunir seus
                  amigos e praticar seu esporte favorito.
                </p>

                <h3 className="subsection-title">
                  Informações de contato
                </h3>

                <p className="detail-line">
                  ⌖
                  <span>
                    <strong>Endereço</strong>
                    <br />
                    Av. das Quadras, 123 - Centro, Porto Alegre/RS
                  </span>
                </p>

                <p className="detail-line">
                  ◷
                  <span>
                    <strong>Horário de funcionamento</strong>
                    <br />
                    Segunda a domingo - 08h às 23h
                  </span>
                </p>

                <p className="detail-line">
                  ◎
                  <span>
                    <strong>Redes sociais</strong>
                    <br />
                    Instagram: @arenasport
                  </span>
                </p>
              </div>

              <div className="stats-card">
                <h3>Resumo</h3>

                <div className="stat-row">
                  <span>▦</span>

                  <div>
                    <strong>6</strong>
                    <small>Quadras cadastradas</small>
                  </div>
                </div>

                <div className="stat-row">
                  <span>▣</span>

                  <div>
                    <strong>128</strong>
                    <small>Reservas no mês</small>
                  </div>
                </div>

                <div className="stat-row">
                  <span>★</span>

                  <div>
                    <strong>4,8</strong>
                    <small>Avaliação média</small>
                  </div>
                </div>

                <Link
                  to="/empresa/quadras"
                  className="btn btn-secondary stats-button"
                >
                  Ver minhas quadras
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}