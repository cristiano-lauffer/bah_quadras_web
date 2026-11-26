import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, KeyRound, LoaderCircle } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Esqueleto from "../components/Esqueleto.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { atualizarEmpresa, buscarEmpresa, cadastrarEmpresa, gerarLinkDeSenha } from "../services/adminService.js";
import { cnpjCompleto, emailValido, mascaraCnpj, mascaraTelefone, telefoneValido } from "../utils/mascaras.js";
import "../css/Admin.css";

const mascaras = { cnpj: mascaraCnpj, telefone: mascaraTelefone };

/** Cadastro (/admin/empresas/nova) e edição (/admin/empresas/:id) de empresa pelo admin. */
export default function AdminEmpresa() {
  const { id } = useParams();
  const { dados: empresa, erro } = useDados(() => (id ? buscarEmpresa(id) : Promise.resolve(null)), [id]);

  if (id && !empresa) {
    return (
      <AdminLayout titulo="Editar empresa">
        {erro ? <p className="pn-erro" role="alert">{erro.message}</p> : <Esqueleto tipo="lista" quantidade={3} rotulo="Carregando empresa..." />}
      </AdminLayout>
    );
  }
  return <Formulario key={id ?? "nova"} empresa={empresa} />;
}

function Formulario({ empresa }) {
  const navigate = useNavigate();
  const editando = Boolean(empresa);
  const [form, setForm] = useState({
    nome: empresa?.nome ?? "",
    cnpj: empresa?.cnpj ? mascaraCnpj(empresa.cnpj) : "",
    telefone: empresa?.telefone ? mascaraTelefone(empresa.telefone) : "",
    endereco: empresa?.endereco ?? "",
    responsavel: empresa?.responsavel?.nome ?? "",
    email: empresa?.responsavel?.email ?? "",
    senha: "",
  });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [link, setLink] = useState(null);
  const [toast, setToast] = useState("");

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: mascaras[name] ? mascaras[name](value) : value }));
    if (erros[name]) setErros((a) => ({ ...a, [name]: "" }));
  }

  function validar() {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = "Informe o nome da empresa.";
    if (!editando && !cnpjCompleto(form.cnpj)) novos.cnpj = "O CNPJ precisa ter 14 números.";
    if (editando && form.cnpj && !cnpjCompleto(form.cnpj)) novos.cnpj = "O CNPJ precisa ter 14 números.";
    if (form.telefone && !telefoneValido(form.telefone)) novos.telefone = "Digite um telefone com DDD.";
    if (!form.responsavel.trim()) novos.responsavel = "Informe o responsável.";
    if (!emailValido(form.email)) novos.email = "Digite um e-mail válido.";
    if (!editando && form.senha.length < 6) novos.senha = "A senha inicial precisa ter pelo menos 6 caracteres.";
    setErros(novos);
    return !Object.keys(novos).length;
  }

  async function salvar(e) {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    try {
      if (editando) {
        await atualizarEmpresa(empresa.id, {
          nome: form.nome.trim(),
          cnpj: form.cnpj,
          telefone: form.telefone,
          endereco: form.endereco.trim(),
          ...(empresa.responsavel && { responsavel_nome: form.responsavel.trim(), responsavel_email: form.email.trim() }),
        });
        setToast("Empresa atualizada.");
      } else {
        await cadastrarEmpresa({
          empresa: form.nome.trim(),
          cnpj: form.cnpj,
          responsavel: form.responsavel.trim(),
          email: form.email.trim(),
          telefone: form.telefone || undefined,
          senha: form.senha,
          endereco: form.endereco.trim() || undefined,
        });
        navigate("/admin/empresas", { replace: true });
      }
    } catch (falha) {
      setErros({ envio: falha.message });
    } finally {
      setSalvando(false);
    }
  }

  async function gerarLink() {
    try {
      setLink(await gerarLinkDeSenha(empresa.id));
    } catch (falha) {
      setToast(falha.message);
    }
  }

  const campo = (name, rotulo, props = {}) => (
    <div className="pn-campo">
      <label htmlFor={`ad-${name}`}>{rotulo}</label>
      <input id={`ad-${name}`} name={name} value={form[name]} onChange={atualizar} aria-invalid={!!erros[name]} {...props} />
      {erros[name] && <p className="pn-erro">{erros[name]}</p>}
    </div>
  );

  return (
    <AdminLayout
      titulo={editando ? `Editar ${empresa.nome}` : "Cadastrar empresa"}
      subtitulo={editando ? "Dados da empresa e do responsável" : "A empresa e a conta do responsável são criadas juntas"}
      acoes={<Link to="/admin/empresas" className="pn-botao pn-botao-contorno">Voltar</Link>}
    >
      <form className="pn-pilha" onSubmit={salvar} noValidate>
        <section className="pn-card">
          <div className="pn-card-topo"><h2>Empresa</h2></div>
          <div className="pn-form">
            <div className="pn-form-grade">
              {campo("nome", "Nome da empresa *", { maxLength: 200 })}
              {campo("cnpj", editando ? "CNPJ" : "CNPJ *", { inputMode: "numeric", placeholder: "00.000.000/0000-00" })}
              {campo("telefone", "Telefone", { inputMode: "numeric", placeholder: "(51) 99999-9999" })}
              {campo("endereco", "Endereço", { maxLength: 500, placeholder: "Rua, número - Bairro, Cidade/UF" })}
            </div>
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-topo"><h2>Responsável (login da empresa)</h2></div>
          <div className="pn-form">
            <div className="pn-form-grade">
              {campo("responsavel", "Nome *", { autoComplete: "off", maxLength: 100 })}
              {campo("email", "E-mail de login *", { type: "email", autoComplete: "off" })}
              {!editando && campo("senha", "Senha inicial *", { type: "password", autoComplete: "new-password" })}
            </div>
            {editando && !empresa.responsavel && <p className="pn-erro">Esta empresa não tem responsável com login.</p>}
          </div>
        </section>

        {editando && empresa.responsavel && (
          <section className="pn-card">
            <div className="pn-card-topo">
              <div>
                <h2>Senha do responsável</h2>
                <p>Gera um link para {empresa.responsavel.email} criar uma senha nova. Vale por 24 horas e só pode ser usado uma vez.</p>
              </div>
              <button type="button" className="pn-botao pn-botao-contorno" onClick={gerarLink}>
                <KeyRound size={16} aria-hidden="true" /> Gerar link
              </button>
            </div>
            {link && (
              <div className="ad-link">
                <code>{link.link}</code>
                <button
                  type="button"
                  className="pn-botao pn-botao-contorno"
                  onClick={() => navigator.clipboard?.writeText(link.link).then(() => setToast("Link copiado. Envie para o responsável."))}
                >
                  <Copy size={15} aria-hidden="true" /> Copiar
                </button>
              </div>
            )}
          </section>
        )}

        {erros.envio && <p className="pn-erro" role="alert">{erros.envio}</p>}
        <div className="pn-form-acoes">
          <Link to="/admin/empresas" className="pn-botao pn-botao-contorno">Cancelar</Link>
          <button type="submit" className="pn-botao" disabled={salvando}>
            {salvando && <LoaderCircle size={16} className="re-girando" aria-hidden="true" />}
            {editando ? "Salvar alterações" : "Cadastrar empresa"}
          </button>
        </div>
      </form>
      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </AdminLayout>
  );
}
