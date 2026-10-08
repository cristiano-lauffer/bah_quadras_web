import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    // Demonstração de front-end: autenticação real depende do backend.
    alert("Tela de login pronta para integração com o backend.");
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span className="brand-mark large">⚽</span>
        <strong>BAH QUADRAS</strong>
        <span>Conectando pessoas e esportes.</span>
      </div>

      <section className="auth-card">
        <h1>Entrar</h1>
        <p className="muted center">Acesse sua conta para continuar</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            E-mail
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <div className="password-wrap">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setMostrarSenha((v) => !v)}>
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>
          <div className="form-options">
            <label className="check-label">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              Lembrar de mim
            </label>
            <button type="button" className="text-button" onClick={() => alert("Recuperação de senha será integrada depois.")}>
              Esqueceu sua senha?
            </button>
          </div>
          <button className="btn btn-primary full" type="submit">Entrar</button>
        </form>

        <div className="auth-divider"><span>ou</span></div>
        <p className="center muted">Ainda não tem uma conta?</p>
        <button className="btn btn-outline full" type="button" onClick={() => navigate("/cadastro")}>
          Cadastre-se
        </button>
      </section>
    </main>
  );
}
