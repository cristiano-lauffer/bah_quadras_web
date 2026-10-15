import { useState } from "react";
import { Link } from "react-router-dom";
import "../Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !senha) {
      alert("Preencha seu e-mail e sua senha.");
      return;
    }

    // Integração com o backend será feita posteriormente.
    alert("Formulário preenchido! A autenticação será implementada depois.");
  }

  function handleGoogleLogin() {
    // A autenticação com Google ainda precisa ser configurada.
    alert("O login com Google será implementado posteriormente.");
  }

  function handleRecuperarSenha() {
    alert("A recuperação de senha será implementada posteriormente.");
  }

  return (
    <main className="login-pagina">
      {/* Painel esquerdo */}
      <section className="login-lateral">
        <Link to="/" className="login-logo" aria-label="BAH QUADRAS - Início">
          <span className="login-logo-icone" aria-hidden="true">
            ⚽
          </span>

          <span className="login-logo-texto">
            BAH <strong>QUADRAS</strong>
          </span>
        </Link>

        <div className="login-mensagem">
          <span className="login-etiqueta">
            SUA PRÓXIMA PARTIDA COMEÇA AQUI
          </span>

          <h1>
            O esporte aproxima.
            <br />
            <span>A gente conecta.</span>
          </h1>

          <p>
            Encontre a quadra ideal, reúna sua galera e transforme qualquer
            dia em uma grande partida.
          </p>

          <div className="login-vantagens">
            <div className="login-vantagem">
              <span className="login-vantagem-icone" aria-hidden="true">
                ✓
              </span>
              <span>Encontre quadras para diferentes esportes</span>
            </div>

            <div className="login-vantagem">
              <span className="login-vantagem-icone" aria-hidden="true">
                ✓
              </span>
              <span>Organize suas próximas partidas</span>
            </div>

            <div className="login-vantagem">
              <span className="login-vantagem-icone" aria-hidden="true">
                ✓
              </span>
              <span>Tenha tudo em um só lugar</span>
            </div>
          </div>
        </div>

        <div className="login-lateral-rodape">
          Feito para quem vive o esporte.
        </div>
      </section>

      {/* Painel direito */}
      <section className="login-conteudo">
        <div className="login-topo">
          <span>
            Ainda não tem uma conta?
          </span>

          <Link to="/cadastro" className="login-link-cadastro">
            Criar conta
          </Link>
        </div>

        <div className="login-formulario-container">
          <div className="login-icone-usuario" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21a8 8 0 0 0-16 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <h2 className="login-boas-vindas">
            Que bom ter você aqui!
          </h2>

          <p className="login-subtitulo">
            Entre na sua conta para continuar.
          </p>

          <form className="login-formulario" onSubmit={handleSubmit}>
            <div className="login-campo">
              <label htmlFor="login-email">E-mail</label>

              <div className="login-input-container">
                <svg
                  className="login-input-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m4 7 8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Digite seu e-mail"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-campo">
              <label htmlFor="login-senha">Senha</label>

              <div className="login-input-container">
                <svg
                  className="login-input-icone"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="login-senha"
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="login-mostrar-senha"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={mostrarSenha}
                >
                  {mostrarSenha ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 4.5 9.5 7-.4 1-1.3 2.3-2.5 3.5M6.2 6.2C3.9 7.7 2.8 10 2.5 12c.7 1.8 2.5 4.5 6.2 6.2A10.8 10.8 0 0 0 12 19c1.1 0 2.1-.2 3-.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-opcoes">
              <label className="login-lembrar">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(event) => setLembrar(event.target.checked)}
                />
                <span>Lembrar de mim</span>
              </label>

              <button
                type="button"
                className="login-esqueci-senha"
                onClick={handleRecuperarSenha}
              >
                Esqueci minha senha
              </button>
            </div>

            <button type="submit" className="login-botao-principal">
              Entrar
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="login-separador">
            <span />
            <p>ou continue com</p>
            <span />
          </div>

          <button
            type="button"
            className="login-botao-secundario"
            onClick={handleGoogleLogin}
          >
            <svg
              className="login-google-icone"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.16 13.22l7.98 6.19C13.03 13.72 18.1 9.5 24 9.5Z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.78 46.98 24.55Z"
              />
              <path
                fill="#FBBC05"
                d="M10.14 28.59A14.4 14.4 0 0 1 9.36 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.58-6.19Z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-5.9 0-10.97-4.22-12.86-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z"
              />
            </svg>

            <span>Entrar com Google</span>
          </button>

          <p className="login-termos">
            Ao continuar, você concorda com nossos{" "}
            <Link to="/termos">Termos de Uso</Link> e{" "}
            <Link to="/privacidade">Política de Privacidade</Link>.
          </p>
        </div>

        <footer className="login-rodape">
          © {new Date().getFullYear()} BAH QUADRAS. Todos os direitos reservados.
        </footer>
      </section>
    </main>
  );
}