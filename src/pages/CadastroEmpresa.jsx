import { useState } from "react";
import {
  CalendarCheck,
  Clock,
  Mail,
  MessageCircle,
  Send,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { CONTATO, linkEmail, linkWhatsApp } from "../config/contato.js";
import { emailValido, mascaraTelefone, telefoneValido } from "../utils/mascaras.js";
import "../css/CadastroEmpresa.css";

const beneficios = [
  { icone: CalendarCheck, titulo: "Agenda online", texto: "Reservas 24h por dia, sem precisar atender telefone." },
  { icone: TrendingUp, titulo: "Mais visibilidade", texto: "Seu espaço aparece para jogadores da sua região." },
  { icone: Wallet, titulo: "Controle financeiro", texto: "Acompanhe reservas e faturamento em um painel." },
];

const passos = [
  "Você envia seus dados por WhatsApp ou e-mail.",
  "Nossa equipe retorna em até 1 dia útil.",
  "Cadastramos suas quadras e seu espaço vai ao ar.",
];

const modalidadesOpcoes = [
  "Futebol society",
  "Futsal",
  "Vôlei",
  "Vôlei de areia",
  "Beach tennis",
  "Basquete",
  "Tênis",
  "Padel",
  "Outra",
];

const vazio = {
  responsavel: "",
  empresa: "",
  cidade: "",
  whatsapp: "",
  email: "",
  quadras: "1",
  modalidades: [],
  mensagem: "",
};

function montarMensagem(f) {
  return [
    "Olá, equipe Bah Quadras! Tenho interesse em anunciar meu espaço.",
    "",
    `Responsável: ${f.responsavel}`,
    `Empresa/espaço: ${f.empresa}`,
    `Cidade: ${f.cidade}`,
    `WhatsApp: ${f.whatsapp}`,
    f.email && `E-mail: ${f.email}`,
    `Quantidade de quadras: ${f.quadras}`,
    f.modalidades.length > 0 && `Modalidades: ${f.modalidades.join(", ")}`,
    f.mensagem && `\nMensagem: ${f.mensagem}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CadastroEmpresa() {
  const [form, setForm] = useState(vazio);
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(null);

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "whatsapp" ? mascaraTelefone(value) : value }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function alternarModalidade(m) {
    setForm((f) => ({
      ...f,
      modalidades: f.modalidades.includes(m)
        ? f.modalidades.filter((x) => x !== m)
        : [...f.modalidades, m],
    }));
  }

  function validar() {
    const e = {};
    if (!form.responsavel.trim()) e.responsavel = "Informe seu nome.";
    if (!form.empresa.trim()) e.empresa = "Informe o nome do espaço.";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!telefoneValido(form.whatsapp)) e.whatsapp = "Digite um número com DDD.";
    if (form.email && !emailValido(form.email)) e.email = "E-mail inválido.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function enviar(canal) {
    if (!validar()) {
      document.querySelector(".empresa-form [aria-invalid='true']")?.focus();
      return;
    }
    const texto = montarMensagem(form);
    if (canal === "whatsapp") {
      window.open(linkWhatsApp(texto), "_blank", "noopener");
    } else {
      // mailto abre o app de e-mail; em nova aba alguns navegadores deixam uma aba em branco.
      window.location.href = linkEmail(`Quero anunciar no Bah Quadras - ${form.empresa}`, texto);
    }
    setEnviado(canal);
  }

  const campo = (name, rotulo, props = {}) => (
    <div className={`empresa-campo ${erros[name] ? "com-erro" : ""}`}>
      <label htmlFor={`emp-${name}`}>{rotulo}</label>
      <input
        id={`emp-${name}`}
        name={name}
        value={form[name]}
        onChange={atualizar}
        aria-invalid={!!erros[name]}
        {...props}
      />
      {erros[name] && (
        <p className="empresa-erro" role="alert">
          {erros[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="empresa">
      <Header />

      <main className="empresa-main">
        <section className="empresa-hero">
          <div className="empresa-hero-conteudo">
            <span className="empresa-eyebrow">Para donos de quadra</span>
            <h1>
              Coloque sua quadra <em>no Bah Quadras.</em>
            </h1>
            <p className="empresa-lead">
              O cadastro de empresas é feito com a nossa equipe. Conte um pouco sobre o seu espaço e
              a gente entra em contato para colocar tudo no ar.
            </p>
          </div>
        </section>

        <div className="empresa-container">
          {/* ===== Lado esquerdo: benefícios e contatos ===== */}
          <section className="empresa-intro">
            <ul className="empresa-beneficios">
              {beneficios.map(({ icone: Icone, titulo, texto }) => (
                <li key={titulo}>
                  <span className="empresa-beneficio-icone" aria-hidden="true">
                    <Icone size={22} />
                  </span>
                  <div>
                    <strong>{titulo}</strong>
                    <p>{texto}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="empresa-passos">
              <h2>Como funciona</h2>
              <ol>
                {passos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>

            <div className="empresa-canais">
              <a href={linkWhatsApp("Olá! Quero anunciar minha quadra no Bah Quadras.")} target="_blank" rel="noopener noreferrer" className="empresa-canal whatsapp">
                <MessageCircle size={22} aria-hidden="true" />
                <span>
                  <small>WhatsApp</small>
                  {CONTATO.whatsappFormatado}
                </span>
              </a>
              <a href={linkEmail("Quero anunciar no Bah Quadras")} className="empresa-canal">
                <Mail size={22} aria-hidden="true" />
                <span>
                  <small>E-mail</small>
                  {CONTATO.email}
                </span>
              </a>
            </div>
            <p className="empresa-horario">
              <Clock size={16} aria-hidden="true" /> Atendimento: {CONTATO.horario}
            </p>
          </section>

          {/* ===== Lado direito: formulário ===== */}
          <section className="empresa-card" aria-labelledby="empresa-form-titulo">
            <h2 id="empresa-form-titulo">Fale com a nossa equipe</h2>
            <p className="empresa-card-sub">
              Preencha os dados e escolha por onde quer enviar. A mensagem já vai pronta.
            </p>

            <form className="empresa-form" onSubmit={(e) => { e.preventDefault(); enviar("whatsapp"); }} noValidate>
              <div className="empresa-duas">
                {campo("responsavel", "Seu nome *", { autoComplete: "name", placeholder: "Nome completo" })}
                {campo("empresa", "Nome do espaço *", { autoComplete: "organization", placeholder: "Ex.: Arena Sport" })}
              </div>

              <div className="empresa-duas">
                {campo("cidade", "Cidade *", { autoComplete: "address-level2", placeholder: "Ex.: Porto Alegre/RS" })}
                {campo("whatsapp", "WhatsApp *", { type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "(51) 99999-9999" })}
              </div>

              <div className="empresa-duas">
                {campo("email", "E-mail (opcional)", { type: "email", autoComplete: "email", placeholder: "contato@empresa.com" })}
                <div className="empresa-campo">
                  <label htmlFor="emp-quadras">Quantas quadras?</label>
                  <select id="emp-quadras" name="quadras" value={form.quadras} onChange={atualizar}>
                    <option value="1">1 quadra</option>
                    <option value="2 a 3">2 a 3 quadras</option>
                    <option value="4 a 6">4 a 6 quadras</option>
                    <option value="mais de 6">Mais de 6</option>
                  </select>
                </div>
              </div>

              <fieldset className="empresa-campo">
                <legend>Modalidades</legend>
                <div className="empresa-chips">
                  {modalidadesOpcoes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className="empresa-chip"
                      aria-pressed={form.modalidades.includes(m)}
                      onClick={() => alternarModalidade(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="empresa-campo">
                <label htmlFor="emp-mensagem">Mensagem (opcional)</label>
                <textarea
                  id="emp-mensagem"
                  name="mensagem"
                  rows={3}
                  maxLength={500}
                  placeholder="Conte algo sobre o seu espaço, horários, dúvidas..."
                  value={form.mensagem}
                  onChange={atualizar}
                />
              </div>

              {enviado && (
                <p className="empresa-sucesso" role="status">
                  Abrimos {enviado === "whatsapp" ? "o WhatsApp" : "seu aplicativo de e-mail"} com a
                  mensagem pronta. É só enviar! Se não abriu, fale com a gente pelos contatos ao lado.
                </p>
              )}

              <div className="empresa-acoes">
                <button type="submit" className="empresa-botao whatsapp">
                  <MessageCircle size={18} aria-hidden="true" /> Enviar pelo WhatsApp
                </button>
                <button type="button" className="empresa-botao contorno" onClick={() => enviar("email")}>
                  <Send size={18} aria-hidden="true" /> Enviar por e-mail
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
