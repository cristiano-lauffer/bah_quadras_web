import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Avaliacoes.css";


const iniciais = [
  { id: 1, nome: "Mariana Costa", nota: 5, data: "18/10/2026", texto: "Ótima quadra, bem cuidada e com iluminação excelente. O atendimento também foi muito bom!" },
  { id: 2, nome: "Lucas Ferreira", nota: 5, data: "12/10/2026", texto: "Espaço organizado, grama em boas condições e fácil de chegar. Recomendo!" },
  { id: 3, nome: "Rafael Martins", nota: 4, data: "05/10/2026", texto: "A quadra é muito boa e os vestiários estavam limpos. O estacionamento poderia ser maior." },
  { id: 4, nome: "Camila Souza", nota: 4, data: "28/09/2026", texto: "Boa estrutura e ótimo custo-benefício para jogar com os amigos." },
];

function Stars({ value, large = false }) {
  return <span className={`reviews-stars ${large ? "large" : ""}`} aria-label={`${value} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map(n => <span key={n} className={n <= value ? "on" : ""}>★</span>)}
  </span>;
}

export default function Avaliacoes() {
  const [reviews, setReviews] = useState(iniciais);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const average = useMemo(() => reviews.reduce((sum, r) => sum + r.nota, 0) / reviews.length, [reviews]);
  const count = rating => reviews.filter(r => r.nota === rating).length;
  const visible = filter === "all" ? reviews : reviews.filter(r => r.nota === Number(filter));

  function submitReview(event) {
    event.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setMessage("Preencha seu nome e o comentário.");
      return;
    }
    setReviews(current => [{
      id: Date.now(), nome: name.trim(), nota: rating,
      data: new Date().toLocaleDateString("pt-BR"), texto: comment.trim()
    }, ...current]);
    setName(""); setComment(""); setRating(5); setFilter("all");
    setShowForm(false);
    setMessage("Avaliação adicionada nesta demonstração.");
  }

  return <div className="public-page">
    <Header />
    <main className="reviews-page">
      <div className="reviews-container">
        <Link to="/" className="reviews-back">← Voltar para o início</Link>
        <header className="reviews-heading">
          <div><span className="reviews-eyebrow">OPINIÃO DE QUEM JÁ JOGOU</span>
            <h1>Avaliações</h1><p>Veja o que os jogadores dizem sobre a Arena Sport.</p></div>
          <button className="reviews-primary" onClick={() => { setShowForm(!showForm); setMessage(""); }}>
            {showForm ? "Fechar formulário" : "+ Escrever avaliação"}
          </button>
        </header>

        <section className="reviews-summary">
          <div className="reviews-score"><strong>{average.toFixed(1).replace(".", ",")}</strong>
            <Stars value={Math.round(average)} large /><span>{reviews.length} avaliações</span></div>
          <div className="reviews-breakdown">{[5, 4, 3, 2, 1].map(n =>
            <button key={n} className={filter === String(n) ? "selected" : ""} onClick={() => setFilter(filter === String(n) ? "all" : String(n))}>
              <span>{n} ★</span><span className="reviews-track"><i style={{ width: `${reviews.length ? count(n) / reviews.length * 100 : 0}%` }} /></span><span>{count(n)}</span>
            </button>)}</div>
        </section>

        {showForm && <form className="reviews-form" onSubmit={submitReview}>
          <h2>Conte como foi sua experiência</h2>
          <label>Sua nota</label><div className="reviews-picker">
            {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)} aria-label={`${n} estrelas`}>★</button>)}
            <span>{rating} de 5</span>
          </div>
          <label htmlFor="review-name">Nome</label><input id="review-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Seu nome" />
          <label htmlFor="review-comment">Comentário</label><textarea id="review-comment" value={comment} onChange={e => setComment(e.target.value)} maxLength={500} rows={4} placeholder="Conte o que achou da quadra..." />
          {message && <p className="reviews-message">{message}</p>}
          <div className="reviews-form-actions"><button type="button" className="reviews-secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="reviews-primary" type="submit">Publicar avaliação</button></div>
        </form>}
        {!showForm && message && <p className="reviews-message">{message}</p>}

        <div className="reviews-list-heading"><div><h2>Comentários dos jogadores</h2><p>{visible.length} avaliações encontradas</p></div>
          <label>Filtrar: <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todas as notas</option>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrelas</option>)}</select></label>
        </div>
        <div className="reviews-list">{visible.map(r => <article className="review-card" key={r.id}>
          <div className="review-avatar">{r.nome.split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase()}</div>
          <div className="review-body"><div className="review-top"><div><h3>{r.nome}</h3><Stars value={r.nota} /></div><time>{r.data}</time></div><p>{r.texto}</p></div>
        </article>)}
        {!visible.length && <div className="reviews-empty"><h3>Nenhuma avaliação com essa nota</h3><button className="reviews-secondary" onClick={() => setFilter("all")}>Ver todas</button></div>}
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
