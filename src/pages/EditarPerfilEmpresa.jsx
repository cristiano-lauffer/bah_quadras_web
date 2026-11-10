import { useState } from "react";
import { Link } from "react-router-dom";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import { empresaDemo } from "../data/empresa.js";

export default function EditarPerfilEmpresa() {
  const [form, setForm] = useState({
    nome: empresaDemo.nome,
    cnpj: empresaDemo.cnpj,
    telefone: empresaDemo.telefone,
    email: empresaDemo.email,
    descricao: empresaDemo.descricao,
    rua: empresaDemo.endereco.rua,
    numero: empresaDemo.endereco.numero,
    bairro: empresaDemo.endereco.bairro,
    cidade: empresaDemo.endereco.cidade,
    estado: empresaDemo.endereco.estado,
    instagram: empresaDemo.instagram,
  });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    alert("Alterações demonstrativas. Para salvar permanentemente, será necessária a integração com o backend.");
  }

  return (
    <EmpresaLayout
      titulo="Editar perfil"
      subtitulo="Atualize as informações que os jogadores veem"
      acoes={<Link to="/empresa/perfil" className="pn-botao pn-botao-contorno">Cancelar</Link>}
    >
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
    </EmpresaLayout>
  );
}
