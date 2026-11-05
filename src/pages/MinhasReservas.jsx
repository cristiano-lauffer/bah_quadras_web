import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../MinhasReservas.css";


const reservasIniciais = [
  {
    id: 1,
    quadra: "Arena Sport",
    modalidade: "Futebol society",
    endereco: "Viamão, RS",
    data: "2026-11-05",
    hora: "19:00",
    duracao: 1,
    valor: 80,
    status: "confirmada",
  },
  {
    id: 2,
    quadra: "Beach Arena",
    modalidade: "Beach tennis",
    endereco: "Porto Alegre, RS",
    data: "2026-11-08",
    hora: "15:00",
    duracao: 2,
    valor: 130,
    status: "confirmada",
  },
  {
    id: 3,
    quadra: "Arena Basketball",
    modalidade: "Basquete",
    endereco: "Porto Alegre, RS",
    data: "2026-10-20",
    hora: "18:00",
    duracao: 1,
    valor: 75,
    status: "concluida",
  },
];

const filtros = [
  { valor: "todas", texto: "Todas" },
  { valor: "confirmada", texto: "Próximas" },
  { valor: "concluida", texto: "Concluídas" },
  { valor: "cancelada", texto: "Canceladas" },
];

function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function MinhasReservas() {
  const [reservas, setReservas] = useState(reservasIniciais);
  const [filtro, setFiltro] = useState("todas");

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtro === "todas") return true;

    if (filtro === "confirmada") {
      return (
        reserva.status === "confirmada" &&
        new Date(`${reserva.data}T12:00:00`) >= hoje
      );
    }

    return reserva.status === filtro;
  });

  const proximas = reservas.filter(
    (reserva) =>
      reserva.status === "confirmada" &&
      new Date(`${reserva.data}T12:00:00`) >= hoje
  ).length;

  const concluidas = reservas.filter(
    (reserva) => reserva.status === "concluida"
  ).length;

  function cancelarReserva(id) {
    const confirmar = window.confirm(
      "Tem certeza de que deseja cancelar esta reserva?"
    );

    if (!confirmar) return;

    setReservas((atuais) =>
      atuais.map((reserva) =>
        reserva.id === id
          ? { ...reserva, status: "cancelada" }
          : reserva
      )
    );
  }

  return (
    <div className="public-page">
      <Header />

      <main className="reservas-page">
        <div className="reservas-container">
          <Link to="/" className="reservas-back">
            ← Voltar para o início
          </Link>

          <header className="reservas-heading">
            <div>
              <span className="reservas-eyebrow">
                SUA EXPERIÊNCIA NO BAH QUADRAS
              </span>

              <h1>Minhas reservas</h1>

              <p>
                Consulte seus agendamentos e organize seus próximos jogos.
              </p>
            </div>

            <Link to="/" className="reservas-nova">
              + Encontrar quadras
            </Link>
          </header>

          <section className="reservas-stats">
            <article className="reservas-stat">
              <span className="reservas-stat-icon">📋</span>
              <div>
                <span>Total de reservas</span>
                <strong>{reservas.length}</strong>
              </div>
            </article>

            <article className="reservas-stat">
              <span className="reservas-stat-icon">📅</span>
              <div>
                <span>Próximas reservas</span>
                <strong>{proximas}</strong>
              </div>
            </article>

            <article className="reservas-stat">
              <span className="reservas-stat-icon">✓</span>
              <div>
                <span>Jogos concluídos</span>
                <strong>{concluidas}</strong>
              </div>
            </article>
          </section>

          <section className="reservas-section">
            <div className="reservas-list-heading">
              <div>
                <h2>Seus agendamentos</h2>
                <p>
                  {reservasFiltradas.length} reserva(s) encontrada(s)
                </p>
              </div>
            </div>

            <div className="reservas-filtros">
              {filtros.map((item) => (
                <button
                  key={item.valor}
                  type="button"
                  className={
                    filtro === item.valor ? "ativo" : ""
                  }
                  onClick={() => setFiltro(item.valor)}
                >
                  {item.texto}
                </button>
              ))}
            </div>

            <div className="reservas-lista">
              {reservasFiltradas.map((reserva) => (
                <article className="reserva-card" key={reserva.id}>
                  <div className="reserva-imagem">
                    <span>🏟️</span>
                  </div>

                  <div className="reserva-conteudo">
                    <div className="reserva-topo">
                      <div>
                        <h3>{reserva.quadra}</h3>
                        <p>{reserva.modalidade}</p>
                      </div>

                      <span
                        className={`reserva-status ${reserva.status}`}
                      >
                        {reserva.status === "confirmada" &&
                          "Confirmada"}

                        {reserva.status === "concluida" &&
                          "Concluída"}

                        {reserva.status === "cancelada" &&
                          "Cancelada"}
                      </span>
                    </div>

                    <div className="reserva-informacoes">
                      <span>
                        📅 {formatarData(reserva.data)}
                      </span>

                      <span>
                        🕒 {reserva.hora} · {reserva.duracao}h
                      </span>

                      <span>📍 {reserva.endereco}</span>
                    </div>

                    <div className="reserva-rodape">
                      <div className="reserva-valor">
                        <span>Valor total</span>
                        <strong>
                          {formatarDinheiro(reserva.valor)}
                        </strong>
                      </div>

                      <div className="reserva-acoes">
                        {reserva.status === "confirmada" && (
                          <button
                            type="button"
                            className="reserva-cancelar"
                            onClick={() =>
                              cancelarReserva(reserva.id)
                            }
                          >
                            Cancelar reserva
                          </button>
                        )}

                        {reserva.status === "concluida" && (
                          <Link
                            to="/avaliacoes"
                            className="reserva-avaliar"
                          >
                            Avaliar quadra
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {reservasFiltradas.length === 0 && (
                <div className="reservas-vazio">
                  <span>📅</span>

                  <h3>Nenhuma reserva encontrada</h3>

                  <p>
                    Não há reservas nesta categoria no momento.
                  </p>

                  <button
                    type="button"
                    onClick={() => setFiltro("todas")}
                  >
                    Ver todas as reservas
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="reservas-aviso">
            <span>ⓘ</span>
            <p>
              Esta tela utiliza dados demonstrativos. Os agendamentos
              ainda não estão conectados ao banco de dados.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}