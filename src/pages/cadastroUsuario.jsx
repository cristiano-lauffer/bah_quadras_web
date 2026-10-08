import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CadastroUsuario() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirmar: "" });
  const [erro, setErro] = useState("");

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    if (form.senha !== form.confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    alert("Cadastro validado visualmente. A integração com o backend será feita depois.");
  }

  return (
    <div className="public-page">
      <Header />
      <main className="form-page">
        <section className="form-card">
          <Link to="/cadastro" className="back-link">← Voltar à escolha</Link>
          <span className="eyebrow">CONTA PESSOAL</span>
          <h1>Criar conta de usuário</h1>
          <p className="muted">Preencha seus dados para começar.</p>
          <form className="form-stack" onSubmit={submit}>
            <label>Nome completo<input name="nome" value={form.nome} onChange={update} placeholder="Seu nome" required /></label>
            <label>E-mail<input name="email" type="email" value={form.email} onChange={update} placeholder="seuemail@exemplo.com" required /></label>
            <label>Telefone<input name="telefone" type="tel" value={form.telefone} onChange={update} placeholder="(00) 00000-0000" required /></label>
            <div className="form-two">
              <label>Senha<input name="senha" type="password" minLength="6" value={form.senha} onChange={update} placeholder="Mínimo 6 caracteres" required /></label>
              <label>Confirmar senha<input name="confirmar" type="password" value={form.confirmar} onChange={update} placeholder="Repita a senha" required /></label>
            </div>
            {erro && <p className="form-error">{erro}</p>}
            <button className="btn btn-primary full" type="submit">Criar conta</button>
          </form>
          <p className="center muted small">Já tem uma conta? <Link className="inline-link" to="/login">Entrar</Link></p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
