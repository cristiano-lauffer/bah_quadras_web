import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Cadastro() {
  return (
    <div className="public-page">
      <Header />
      <main className="choice-page">
        <div className="choice-heading">
          <span className="eyebrow">BAH QUADRAS</span>
          <h1>Crie sua conta</h1>
          <p className="muted">Escolha o tipo de conta que deseja criar.</p>
        </div>

        <div className="choice-grid">
          <article className="choice-card">
            <div className="choice-icon">♙</div>
            <h2>Usuário</h2>
            <p>Para quem deseja encontrar quadras e reservar horários para jogar.</p>
            <Link className="btn btn-primary full" to="/cadastro/usuario">Continuar como usuário →</Link>
          </article>
          <article className="choice-card">
            <div className="choice-icon">▦</div>
            <h2>Empresa</h2>
            <p>Para proprietários que desejam divulgar e administrar suas quadras.</p>
            <Link className="btn btn-primary full" to="/cadastro/empresa">Entre em Contato →</Link>
          </article>
        </div>
        <p className="center muted">Já possui uma conta? <Link className="inline-link" to="/login">Entrar</Link></p>
      </main>
      <Footer />
    </div>
  );
}
