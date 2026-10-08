import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function EditarPerfilEmpresa() {
  const [form, setForm] = useState({
    nome: "Arena Sport",
    cnpj: "12.345.678/0001-90",
    telefone: "(51) 98765-4321",
    email: "contato@arenasport.com",
    descricao: "Somos uma empresa especializada em quadras esportivas, oferecendo espaços de qualidade para você reunir seus amigos e praticar seu esporte favorito.",
    rua: "Av. das Quadras",
    numero: "123",
    bairro: "Centro",
    cidade: "Porto Alegre",
    estado: "RS",
    instagram: "@arenasport",
  });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    alert("Alterações demonstrativas. Para salvar permanentemente, será necessária a integração com o backend.");
  }

  return (
    <div className="dashboard-page">
      <Header dashboard />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <Link to="/" className="side-link">⌂ <span>Início</span></Link>
          <Link to="/empresa/perfil" className="side-link active">♙ <span>Meu perfil</span></Link>
          <button className="side-link" type="button" onClick={() => alert("Cadastro de quadras será implementado depois.")}>▦ <span>Minhas quadras</span></button>
          <button className="side-link" type="button" onClick={() => alert("Reservas serão implementadas depois.")}>▣ <span>Reservas</span></button>
          <button className="side-link" type="button" onClick={() => alert("Financeiro será implementado depois.")}>＄ <span>Financeiro</span></button>
          <button className="side-link" type="button" onClick={() => alert("Configurações serão implementadas depois.")}>⚙ <span>Configurações</span></button>
          <Link to="/login" className="side-link side-logout">⇥ <span>Sair</span></Link>
        </aside>

        <main className="dashboard-content">
          <div className="page-title-row">
            <div><span className="eyebrow">ÁREA DA EMPRESA</span><h1>Editar perfil</h1></div>
            <Link to="/empresa/perfil" className="btn btn-outline">Cancelar</Link>
          </div>

          <form className="edit-card form-stack" onSubmit={submit}>
            <h2>Informações da empresa</h2>
            <div className="form-two">
              <label>Nome da empresa<input name="nome" value={form.nome} onChange={update} required /></label>
              <label>CNPJ<input name="cnpj" value={form.cnpj} onChange={update} required /></label>
              <label>Telefone<input name="telefone" value={form.telefone} onChange={update} required /></label>
              <label>E-mail<input name="email" type="email" value={form.email} onChange={update} required /></label>
            </div>
            <label>Descrição<textarea name="descricao" value={form.descricao} onChange={update} rows="4" /></label>
            <h2>Endereço</h2>
            <div className="form-two address-grid">
              <label>Rua / Avenida<input name="rua" value={form.rua} onChange={update} /></label>
              <label>Número<input name="numero" value={form.numero} onChange={update} /></label>
              <label>Bairro<input name="bairro" value={form.bairro} onChange={update} /></label>
              <label>Cidade<input name="cidade" value={form.cidade} onChange={update} /></label>
              <label>Estado<input name="estado" value={form.estado} onChange={update} maxLength="2" /></label>
            </div>
            <h2>Redes sociais</h2>
            <label>Instagram<input name="instagram" value={form.instagram} onChange={update} placeholder="@suaempresa" /></label>
            <div className="form-actions">
              <Link to="/empresa/perfil" className="btn btn-outline">Cancelar</Link>
              <button className="btn btn-primary" type="submit">Salvar alterações</button>
            </div>
          </form>
        </main>
      </div>
      <Footer />
    </div>
  );
}
