
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../PerfilUsuario.css";

export default function PerfilUsuario() {
  const [editando, setEditando] = useState(false);

  const [usuario, setUsuario] = useState({
    nome: "João da Silva",
    email: "joao@email.com",
    telefone: "(51) 99999-9999",
    cidade: "Porto Alegre - RS",
  });

  const [formulario, setFormulario] = useState(usuario);
  const [mensagem, setMensagem] = useState("");

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarPerfil(event) {
    event.preventDefault();
    setUsuario(formulario);
    setEditando(false);
    setMensagem("Seus dados foram atualizados!");
  }

  function cancelarEdicao() {
    setFormulario(usuario);
    setEditando(false);
    setMensagem("");
  }

  return (
    <div className="perfil-usuario-page">
      <Header />

      <main className="perfil-usuario-container">
        <div className="perfil-usuario-heading">
          <div>
            <span className="perfil-usuario-eyebrow">
              ÁREA DO CLIENTE
            </span>
            <h1>Meu perfil</h1>
            <p>Gerencie suas informações e acompanhe suas reservas.</p>
          </div>

          <Link to="/" className="perfil-usuario-voltar">
            ← Voltar para o início
          </Link>
        </div>

        <div className="perfil-usuario-layout">
          <aside className="perfil-usuario-sidebar">
            <div className="perfil-usuario-resumo">
              <div className="perfil-usuario-avatar">
                {usuario.nome.charAt(0).toUpperCase()}
              </div>

              <h2>{usuario.nome}</h2>
              <p>{usuario.email}</p>
              <span className="perfil-usuario-status">
                <span className="perfil-usuario-status-ponto" />
                Conta de usuário
              </span>
            </div>

            <nav className="perfil-usuario-menu">
              <a href="#dados" className="perfil-usuario-menu-item ativo">
                <span>👤</span>
                Meus dados
              </a>

              <a href="#reservas" className="perfil-usuario-menu-item">
                <span>📅</span>
                Minhas reservas
              </a>

              <a href="#configuracoes" className="perfil-usuario-menu-item">
                <span>⚙️</span>
                Configurações
              </a>

              <Link to="/" className="perfil-usuario-menu-item">
                <span>🏠</span>
                Página inicial
              </Link>
            </nav>
          </aside>

          <div className="perfil-usuario-conteudo">
            <section className="perfil-usuario-card" id="dados">
              <div className="perfil-usuario-card-heading">
                <div>
                  <h2>Informações pessoais</h2>
                  <p>Mantenha seus dados sempre atualizados.</p>
                </div>

                {!editando && (
                  <button
                    className="perfil-usuario-btn-secundario"
                    onClick={() => {
                      setFormulario(usuario);
                      setEditando(true);
                      setMensagem("");
                    }}
                  >
                    ✎ Editar perfil
                  </button>
                )}
              </div>

              {mensagem && (
                <div className="perfil-usuario-mensagem">
                  ✓ {mensagem}
                </div>
              )}

              {editando ? (
                <form onSubmit={salvarPerfil} className="perfil-usuario-form">
                  <div className="perfil-usuario-campo">
                    <label htmlFor="nome">Nome completo</label>
                    <input
                      id="nome"
                      name="nome"
                      value={formulario.nome}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>

                  <div className="perfil-usuario-campo">
                    <label htmlFor="email">E-mail</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formulario.email}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>

                  <div className="perfil-usuario-campo">
                    <label htmlFor="telefone">Telefone</label>
                    <input
                      id="telefone"
                      name="telefone"
                      value={formulario.telefone}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>

                  <div className="perfil-usuario-campo">
                    <label htmlFor="cidade">Cidade</label>
                    <input
                      id="cidade"
                      name="cidade"
                      value={formulario.cidade}
                      onChange={atualizarCampo}
                      required
                    />
                  </div>

                  <div className="perfil-usuario-acoes">
                    <button
                      type="button"
                      className="perfil-usuario-btn-cancelar"
                      onClick={cancelarEdicao}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="perfil-usuario-btn-principal"
                    >
                      Salvar alterações
                    </button>
                  </div>
                </form>
              ) : (
                <div className="perfil-usuario-dados">
                  <div className="perfil-usuario-dado">
                    <span>Nome completo</span>
                    <strong>{usuario.nome}</strong>
                  </div>

                  <div className="perfil-usuario-dado">
                    <span>E-mail</span>
                    <strong>{usuario.email}</strong>
                  </div>

                  <div className="perfil-usuario-dado">
                    <span>Telefone</span>
                    <strong>{usuario.telefone}</strong>
                  </div>

                  <div className="perfil-usuario-dado">
                    <span>Cidade</span>
                    <strong>{usuario.cidade}</strong>
                  </div>
                </div>
              )}
            </section>

            <section className="perfil-usuario-card" id="reservas">
              <div className="perfil-usuario-card-heading">
                <div>
                  <h2>Minhas reservas</h2>
                  <p>Acompanhe seus agendamentos de quadras.</p>
                </div>
              </div>

              <div className="perfil-usuario-reservas-vazio">
                <div className="perfil-usuario-reservas-icone">📅</div>
                <h3>Nenhuma reserva por enquanto</h3>
                <p>
                  Encontre uma quadra, escolha o horário ideal e
                  organize sua próxima partida.
                </p>
                <Link
                  to="/"
                  className="perfil-usuario-btn-principal"
                >
                  Encontrar quadras
                </Link>
              </div>
            </section>

            <section
              className="perfil-usuario-card"
              id="configuracoes"
            >
              <div className="perfil-usuario-card-heading">
                <div>
                  <h2>Configurações da conta</h2>
                  <p>Opções para gerenciar seu acesso.</p>
                </div>
              </div>

              <div className="perfil-usuario-config-item">
                <div>
                  <strong>Senha e segurança</strong>
                  <p>Proteja o acesso à sua conta.</p>
                </div>
                <span className="perfil-usuario-em-breve">
                  Em breve
                </span>
              </div>

              <div className="perfil-usuario-config-item">
                <div>
                  <strong>Notificações</strong>
                  <p>Gerencie avisos sobre suas reservas.</p>
                </div>
                <span className="perfil-usuario-em-breve">
                  Em breve
                </span>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
