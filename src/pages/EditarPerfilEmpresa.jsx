import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, LoaderCircle } from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import { empresaAtual, salvarEmpresa } from "../services/empresaService.js";
import {
  cnpjCompleto,
  emailValido,
  mascaraCep,
  mascaraCnpj,
  mascaraTelefone,
  telefoneValido,
} from "../utils/mascaras.js";
import "../css/EditarPerfilEmpresa.css";

const opcoesComodidades = [
  "Estacionamento",
  "Vestiário",
  "Chuveiro",
  "Iluminação LED",
  "Lanchonete",
  "Bar",
  "Wi-Fi",
  "Churrasqueira",
  "Acessibilidade",
  "Loja de artigos esportivos",
];
const opcoesPagamento = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];

const horasAbertura = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`); // 06 a 23
const horasFechamento = [...horasAbertura.slice(1), "00:00"]; // 07 até meia-noite
const emMinutos = (h) => (h === "00:00" ? 24 * 60 : Number(h.slice(0, 2)) * 60);

const mascaras = { telefone: mascaraTelefone, whatsapp: mascaraTelefone, cnpj: mascaraCnpj, cep: mascaraCep };

// Converte o objeto da empresa para um formulário "plano" (mais fácil de editar).
function paraFormulario(e) {
  return {
    nome: e.nome,
    slogan: e.slogan ?? "",
    responsavel: e.responsavel,
    cnpj: e.cnpj,
    telefone: e.telefone,
    whatsapp: e.whatsapp ?? "",
    email: e.email,
    instagram: e.instagram ?? "",
    site: e.site ?? "",
    descricao: e.descricao,
    ...e.endereco,
    comodidades: e.comodidades ?? [],
    pagamentos: e.pagamentos ?? [],
    politicaCancelamento: e.politicaCancelamento ?? "",
    horarios: e.horarios.map((h) => ({ ...h, fechado: !h.abre })),
  };
}

export default function EditarPerfilEmpresa() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => paraFormulario(empresaAtual()));
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  function atualizar(e) {
    const { name, value } = e.target;
    const valor = mascaras[name] ? mascaras[name](value) : name === "estado" ? value.toUpperCase().slice(0, 2) : value;
    setForm((f) => ({ ...f, [name]: valor }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function alternarLista(campo, item) {
    setForm((f) => ({
      ...f,
      [campo]: f[campo].includes(item) ? f[campo].filter((x) => x !== item) : [...f[campo], item],
    }));
  }

  function mudarHorario(dia, mudanca) {
    setForm((f) => ({ ...f, horarios: f.horarios.map((h) => (h.dia === dia ? { ...h, ...mudanca } : h)) }));
    if (erros.horarios) setErros((atual) => ({ ...atual, horarios: "" }));
  }

  function validar() {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = "Informe o nome da empresa.";
    if (!form.responsavel.trim()) novos.responsavel = "Informe o responsável.";
    if (!cnpjCompleto(form.cnpj)) novos.cnpj = "O CNPJ precisa ter 14 números.";
    if (!telefoneValido(form.telefone)) novos.telefone = "Digite um telefone com DDD.";
    if (form.whatsapp && !telefoneValido(form.whatsapp)) novos.whatsapp = "Digite um número com DDD.";
    if (!emailValido(form.email)) novos.email = "Digite um e-mail válido.";
    if (!form.rua.trim() || !form.numero.trim()) novos.rua = "Informe rua e número.";
    if (!form.cidade.trim()) novos.cidade = "Informe a cidade.";
    if (form.estado.length !== 2) novos.estado = "Use a sigla (ex.: RS).";
    const invalido = form.horarios.find((h) => !h.fechado && emMinutos(h.fecha) <= emMinutos(h.abre));
    if (invalido) novos.horarios = `${invalido.nome}: o horário de fechamento precisa ser depois da abertura.`;
    setErros(novos);
    return novos;
  }

  async function enviar(e) {
    e.preventDefault();
    const novos = validar();
    if (Object.keys(novos).length) {
      document.querySelector(`[name="${Object.keys(novos)[0]}"], #ep-horarios`)?.focus();
      return;
    }
    setSalvando(true);
    const { rua, numero, bairro, cidade, estado, cep, horarios, ...resto } = form;
    await salvarEmpresa({
      ...resto,
      nome: form.nome.trim(),
      endereco: { rua, numero, bairro, cidade, estado, cep },
      horarios: horarios.map(({ fechado, ...h }) => (fechado ? { ...h, abre: "", fecha: "" } : h)),
    });
    navigate("/empresa/perfil", { state: { aviso: "Perfil da empresa atualizado!" } });
  }

  const campo = (name, rotulo, props = {}) => (
    <div className="pn-campo">
      <label htmlFor={`ep-${name}`}>{rotulo}</label>
      <input id={`ep-${name}`} name={name} value={form[name]} onChange={atualizar} aria-invalid={!!erros[name]} {...props} />
      {erros[name] && <p className="pn-erro">{erros[name]}</p>}
    </div>
  );

  return (
    <EmpresaLayout
      titulo="Editar perfil"
      subtitulo="Atualize as informações que os jogadores veem"
      acoes={<Link to="/empresa/perfil" className="pn-botao pn-botao-contorno">Cancelar</Link>}
    >
      <form className="pn-pilha ep" onSubmit={enviar} noValidate>
        <section className="pn-card">
          <div className="pn-card-topo"><h2>Informações da empresa</h2></div>
          <div className="pn-form">
            <div className="pn-form-grade">
              {campo("nome", "Nome da empresa *", { autoComplete: "organization", maxLength: 60 })}
              {campo("slogan", "Slogan", { maxLength: 60, placeholder: "Ex.: Seu jogo começa aqui." })}
              {campo("responsavel", "Responsável *", { autoComplete: "name" })}
              {campo("cnpj", "CNPJ *", { inputMode: "numeric", placeholder: "00.000.000/0000-00" })}
            </div>
            <div className="pn-campo">
              <label htmlFor="ep-descricao">Descrição</label>
              <textarea
                id="ep-descricao"
                name="descricao"
                rows={4}
                maxLength={600}
                value={form.descricao}
                onChange={atualizar}
                className="ep-textarea"
              />
              <small className="ep-contador">{form.descricao.length}/600</small>
            </div>
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-topo"><h2>Contato e redes sociais</h2></div>
          <div className="pn-form-grade">
            {campo("telefone", "Telefone *", { type: "tel", inputMode: "numeric", autoComplete: "tel" })}
            {campo("whatsapp", "WhatsApp", { type: "tel", inputMode: "numeric" })}
            {campo("email", "E-mail *", { type: "email", autoComplete: "email" })}
            {campo("instagram", "Instagram", { placeholder: "@suaempresa" })}
            {campo("site", "Site", { placeholder: "suaempresa.com.br" })}
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-topo"><h2>Endereço</h2></div>
          <div className="ep-endereco">
            <div className="ep-rua">{campo("rua", "Rua / Avenida *", { autoComplete: "address-line1" })}</div>
            {campo("numero", "Número *")}
            {campo("bairro", "Bairro")}
            {campo("cidade", "Cidade *", { autoComplete: "address-level2" })}
            {campo("estado", "Estado *", { maxLength: 2, placeholder: "RS" })}
            {campo("cep", "CEP", { inputMode: "numeric", placeholder: "00000-000" })}
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-topo">
            <div>
              <h2 id="ep-horarios" tabIndex={-1}>Horário de funcionamento</h2>
              <p>Usado como base na grade de horários das quadras.</p>
            </div>
          </div>
          <ul className="ep-horarios">
            {form.horarios.map((h) => (
              <li key={h.dia} className={h.fechado ? "fechado" : ""}>
                <strong>{h.nome}</strong>
                <label className="ep-aberto">
                  <input
                    type="checkbox"
                    checked={!h.fechado}
                    onChange={(e) =>
                      mudarHorario(h.dia, e.target.checked
                        ? { fechado: false, abre: h.abre || "08:00", fecha: h.fecha || "22:00" }
                        : { fechado: true })
                    }
                  />
                  {h.fechado ? "Fechado" : "Aberto"}
                </label>
                {!h.fechado && (
                  <span className="ep-horas">
                    <select aria-label={`${h.nome}: abre às`} value={h.abre} onChange={(e) => mudarHorario(h.dia, { abre: e.target.value })}>
                      {horasAbertura.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    às
                    <select aria-label={`${h.nome}: fecha às`} value={h.fecha} onChange={(e) => mudarHorario(h.dia, { fecha: e.target.value })}>
                      {horasFechamento.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </span>
                )}
              </li>
            ))}
          </ul>
          {erros.horarios && <p className="pn-erro">{erros.horarios}</p>}
        </section>

        <section className="pn-card">
          <div className="pn-card-topo"><h2>Comodidades</h2></div>
          <div className="pn-chips">
            {[...new Set([...opcoesComodidades, ...form.comodidades])].map((c) => (
              <button key={c} type="button" className="pn-chip" aria-pressed={form.comodidades.includes(c)} onClick={() => alternarLista("comodidades", c)}>
                {form.comodidades.includes(c) && <Check size={14} aria-hidden="true" />} {c}
              </button>
            ))}
          </div>
        </section>

        <section className="pn-card">
          <div className="pn-card-topo"><h2>Pagamento e cancelamento</h2></div>
          <div className="pn-form">
            <fieldset className="pn-campo">
              <legend>Formas de pagamento aceitas</legend>
              <div className="pn-chips">
                {opcoesPagamento.map((p) => (
                  <button key={p} type="button" className="pn-chip" aria-pressed={form.pagamentos.includes(p)} onClick={() => alternarLista("pagamentos", p)}>
                    {form.pagamentos.includes(p) && <Check size={14} aria-hidden="true" />} {p}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="pn-campo">
              <label htmlFor="ep-politica">Política de cancelamento</label>
              <textarea
                id="ep-politica"
                name="politicaCancelamento"
                rows={3}
                maxLength={300}
                value={form.politicaCancelamento}
                onChange={atualizar}
                className="ep-textarea"
              />
            </div>
          </div>
        </section>

        <div className="ep-barra">
          <Link to="/empresa/perfil" className="pn-botao pn-botao-contorno">Cancelar</Link>
          <button type="submit" className="pn-botao" disabled={salvando}>
            {salvando ? (
              <>
                <LoaderCircle size={17} className="ep-girando" aria-hidden="true" /> Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </form>
    </EmpresaLayout>
  );
}
