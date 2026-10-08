import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CadastroEmpresa() {
  const [form, setForm] = useState({ empresa: "", cnpj: "", responsavel: "", email: "", telefone: "", senha: "", confirmar: "" });
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
          <span className="eyebrow">CONTA EMPRESARIAL</span>
          <h1>Cadastrar empresa</h1>
          <p className="muted">Informe os dados da empresa e do responsável.</p>
          <form className="form-stack" onSubmit={submit}>
            <label>Nome da empresa<input name="empresa" value={form.empresa} onChange={update} placeholder="Ex.: Arena Esportiva" required /></label>
            <div className="form-two">
              <label>CNPJ<input name="cnpj" value={form.cnpj} onChange={update} placeholder="00.000.000/0000-00" required /></label>
              <label>Telefone<input name="telefone" type="tel" value={form.telefone} onChange={update} placeholder="(00) 00000-0000" required /></label>
            </div>
            <label>Nome do responsável<input name="responsavel" value={form.responsavel} onChange={update} placeholder="Nome completo" required /></label>
            <label>E-mail empresarial<input name="email" type="email" value={form.email} onChange={update} placeholder="contato@empresa.com" required /></label>
            <div className="form-two">
              <label>Senha<input name="senha" type="password" minLength="6" value={form.senha} onChange={update} placeholder="Mínimo 6 caracteres" required /></label>
              <label>Confirmar senha<input name="confirmar" type="password" value={form.confirmar} onChange={update} placeholder="Repita a senha" required /></label>
            </div>
            {erro && <p className="form-error">{erro}</p>}
            <button className="btn btn-primary full" type="submit">Criar conta empresarial</button>
          </form>
          <p className="center muted small">Já tem uma conta? <Link className="inline-link" to="/login">Entrar</Link></p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
