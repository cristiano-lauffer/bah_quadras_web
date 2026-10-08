import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <span className="eyebrow">BAH QUADRAS</span>
        <h1>404</h1>
        <h2>Página não encontrada</h2>
        <p className="muted">O endereço acessado não existe.</p>
        <Link to="/" className="btn btn-primary">Voltar ao início</Link>
      </div>
    </main>
  );
}
