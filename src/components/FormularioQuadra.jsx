import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, CircleCheck, CirclePause, ImagePlus, LoaderCircle, Wrench } from "lucide-react";
import {
  comodidadesDisponiveis,
  modalidadesDisponiveis,
  salvarQuadra,
  statusQuadra,
  tiposPiso,
} from "../services/quadrasService.js";
import { quadras as quadrasPublicas } from "../data/quadras.js";
import { formatarPreco } from "../utils/formatadores.js";
import "../css/FormularioQuadra.css";

// Fotos prontas para a demonstração (sem precisar de upload).
const fotosSugeridas = [...new Set(quadrasPublicas.flatMap((q) => q.imagens))].slice(0, 8);
const TAMANHO_MAXIMO = 1024 * 1024; // 1 MB

const vazio = {
  nome: "",
  modalidade: "",
  preco: "",
  descricao: "",
  cobertura: "descoberta",
  piso: "",
  capacidade: "",
  comodidades: [],
  imagem: fotosSugeridas[0],
  status: "ativa",
};

// "8000" (centavos digitados) -> "80,00"
function mascaraDinheiro(texto) {
  const centavos = Number(texto.replace(/\D/g, "").slice(0, 7) || 0);
  return centavos ? (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
}
const paraNumero = (texto) => Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
const paraTexto = (numero) => (numero ? numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");

const visualStatus = {
  ativa: { icone: CircleCheck, classe: "ok", texto: "Aparece para os jogadores e recebe reservas." },
  manutencao: { icone: Wrench, classe: "alerta", texto: "Fica visível, mas sem horários para reservar." },
  inativa: { icone: CirclePause, classe: "neutro", texto: "Não aparece para os jogadores." },
};

/**
 * Formulário de quadra.
 * - inicial: quadra existente (edição) ou nada (cadastro)
 */
export default function FormularioQuadra({ inicial }) {
  const navigate = useNavigate();
  const editando = Boolean(inicial?.id);
  const [form, setForm] = useState(() =>
    inicial
      ? { ...vazio, ...inicial, preco: paraTexto(inicial.preco), capacidade: inicial.capacidade ? String(inicial.capacidade) : "" }
      : vazio
  );
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const precoAntigo = inicial?.preco;
  const precoNovo = paraNumero(form.preco);

  function atualizar(e) {
    const { name, value } = e.target;
    const valor = name === "preco" ? mascaraDinheiro(value) : name === "capacidade" ? value.replace(/\D/g, "").slice(0, 2) : value;
    setForm((f) => ({ ...f, [name]: valor }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function alternarComodidade(c) {
    setForm((f) => ({
      ...f,
      comodidades: f.comodidades.includes(c) ? f.comodidades.filter((x) => x !== c) : [...f.comodidades, c],
    }));
  }

  function enviarFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErros((atual) => ({ ...atual, imagem: "A imagem precisa ter no máximo 1 MB." }));
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      setForm((f) => ({ ...f, imagem: leitor.result }));
      setErros((atual) => ({ ...atual, imagem: "" }));
    };
    leitor.readAsDataURL(arquivo);
  }

  function validar() {
    const novos = {};
    if (form.nome.trim().length < 3) novos.nome = "Dê um nome com pelo menos 3 letras.";
    if (!form.modalidade) novos.modalidade = "Escolha a modalidade.";
    if (precoNovo <= 0) novos.preco = "Informe o preço por hora.";
    else if (precoNovo > 2000) novos.preco = "O preço parece alto demais. Confira o valor.";
    if (form.capacidade && (Number(form.capacidade) < 2 || Number(form.capacidade) > 50))
      novos.capacidade = "Informe entre 2 e 50 jogadores.";
    setErros(novos);
    return novos;
  }

  async function enviar(e) {
    e.preventDefault();
    const novos = validar();
    if (Object.keys(novos).length) {
      document.getElementById(`fq-${Object.keys(novos)[0]}`)?.focus();
      return;
    }
    setSalvando(true);
    const salva = await salvarQuadra({
      ...form,
      id: inicial?.id,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco: precoNovo,
      capacidade: form.capacidade ? Number(form.capacidade) : null,
    });
    navigate("/empresa/quadras", {
      state: { aviso: editando ? `Alterações em ${salva.nome} salvas.` : `${salva.nome} cadastrada! Agora defina os horários.` },
    });
  }

  const Status = visualStatus[form.status];

  return (
    <form className="fq" onSubmit={enviar} noValidate>
      <div className="fq-principal pn-pilha">
        {/* ===== Informações básicas ===== */}
        <section className="pn-card">
          <div className="pn-card-topo">
            <h2>Informações básicas</h2>
          </div>
          <div className="pn-form">
            <div className="pn-campo">
              <label htmlFor="fq-nome">Nome da quadra *</label>
              <input
                id="fq-nome"
                name="nome"
                value={form.nome}
                onChange={atualizar}
                maxLength={60}
                placeholder="Ex.: Campo Society 1"
                aria-invalid={!!erros.nome}
              />
              {erros.nome && <p className="pn-erro">{erros.nome}</p>}
            </div>

            <div className="pn-form-grade">
              <div className="pn-campo">
                <label htmlFor="fq-modalidade">Modalidade *</label>
                <select
                  id="fq-modalidade"
                  name="modalidade"
                  value={form.modalidade}
                  onChange={atualizar}
                  className="fq-select"
                  aria-invalid={!!erros.modalidade}
                >
                  <option value="">Selecione</option>
                  {modalidadesDisponiveis.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {erros.modalidade && <p className="pn-erro">{erros.modalidade}</p>}
              </div>

              <div className="pn-campo">
                <label htmlFor="fq-piso">Tipo de piso</label>
                <select id="fq-piso" name="piso" value={form.piso} onChange={atualizar} className="fq-select">
                  <option value="">Não informado</option>
                  {tiposPiso.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pn-campo">
              <label htmlFor="fq-descricao">Descrição</label>
              <textarea
                id="fq-descricao"
                name="descricao"
                value={form.descricao}
                onChange={atualizar}
                rows={3}
                maxLength={400}
                className="fq-textarea"
                placeholder="O que torna essa quadra especial? Ex.: grama nova, iluminação de LED..."
              />
              <small className="fq-contador">{form.descricao.length}/400</small>
            </div>
          </div>
        </section>

        {/* ===== Preço (US6) ===== */}
        <section className="pn-card">
          <div className="pn-card-topo">
            <div>
              <h2>Preço</h2>
              <p>Valor cobrado por hora. Você pode alterar quando quiser.</p>
            </div>
          </div>
          <div className="pn-campo fq-preco">
            <label htmlFor="fq-preco">Preço por hora *</label>
            <div className="fq-preco-campo">
              <span aria-hidden="true">R$</span>
              <input
                id="fq-preco"
                name="preco"
                inputMode="numeric"
                value={form.preco}
                onChange={atualizar}
                placeholder="0,00"
                aria-invalid={!!erros.preco}
              />
            </div>
            {erros.preco && <p className="pn-erro">{erros.preco}</p>}
          </div>
          {editando && precoNovo > 0 && precoNovo !== precoAntigo && (
            <p className="fq-preco-mudanca" role="status">
              {formatarPreco(precoAntigo, 2)} <ArrowRight size={14} aria-hidden="true" /> <strong>{formatarPreco(precoNovo, 2)}</strong>
              <span>O novo preço vale para reservas feitas a partir de agora.</span>
            </p>
          )}
        </section>

        {/* ===== Características ===== */}
        <section className="pn-card">
          <div className="pn-card-topo">
            <h2>Características</h2>
          </div>
          <div className="pn-form">
            <fieldset className="pn-campo">
              <legend>Cobertura</legend>
              <div className="fq-opcoes">
                {[
                  ["descoberta", "Descoberta", "Ao ar livre"],
                  ["coberta", "Coberta", "Joga mesmo com chuva"],
                ].map(([valor, titulo, texto]) => (
                  <label key={valor} className={`fq-opcao ${form.cobertura === valor ? "marcada" : ""}`}>
                    <input type="radio" name="cobertura" value={valor} checked={form.cobertura === valor} onChange={atualizar} />
                    <strong>{titulo}</strong>
                    <span>{texto}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="pn-campo fq-capacidade">
              <label htmlFor="fq-capacidade">Capacidade (jogadores)</label>
              <input
                id="fq-capacidade"
                name="capacidade"
                inputMode="numeric"
                value={form.capacidade}
                onChange={atualizar}
                placeholder="Ex.: 14"
                aria-invalid={!!erros.capacidade}
              />
              {erros.capacidade && <p className="pn-erro">{erros.capacidade}</p>}
            </div>

            <fieldset className="pn-campo">
              <legend>Comodidades</legend>
              <div className="pn-chips">
                {comodidadesDisponiveis.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="pn-chip"
                    aria-pressed={form.comodidades.includes(c)}
                    onClick={() => alternarComodidade(c)}
                  >
                    {form.comodidades.includes(c) && <Check size={14} aria-hidden="true" />}
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* ===== Foto ===== */}
        <section className="pn-card">
          <div className="pn-card-topo">
            <div>
              <h2>Foto de capa</h2>
              <p>Escolha uma das sugestões ou envie a sua (até 1 MB).</p>
            </div>
          </div>
          <div className="fq-fotos" role="radiogroup" aria-label="Foto de capa">
            {fotosSugeridas.map((foto, i) => (
              <button
                key={foto}
                type="button"
                role="radio"
                aria-checked={form.imagem === foto}
                aria-label={`Foto sugerida ${i + 1}`}
                className="fq-foto"
                onClick={() => setForm((f) => ({ ...f, imagem: foto }))}
              >
                <img src={foto} alt="" loading="lazy" />
              </button>
            ))}
            <label className="fq-foto fq-foto-enviar">
              {form.imagem?.startsWith("data:") ? (
                <img src={form.imagem} alt="" />
              ) : (
                <>
                  <ImagePlus size={22} aria-hidden="true" />
                  <span>Enviar</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={enviarFoto} aria-label="Enviar foto de capa" />
            </label>
          </div>
          {erros.imagem && <p className="pn-erro">{erros.imagem}</p>}
        </section>
      </div>

      {/* ===== Lateral: prévia e salvar ===== */}
      <aside className="fq-lateral">
        <section className="pn-card">
          <div className="pn-card-topo">
            <h2>Situação</h2>
          </div>
          <div className="fq-status" role="radiogroup" aria-label="Situação da quadra">
            {Object.entries(statusQuadra).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={form.status === valor}
                className="fq-status-opcao"
                onClick={() => setForm((f) => ({ ...f, status: valor }))}
              >
                {texto}
              </button>
            ))}
          </div>
          <p className={`fq-status-ajuda ${Status.classe}`}>
            <Status.icone size={15} aria-hidden="true" /> {Status.texto}
          </p>
        </section>

        <section className="pn-card fq-previa" aria-label="Prévia para os jogadores">
          <span className="fq-previa-rotulo">Prévia para os jogadores</span>
          <div className="fq-previa-card">
            <div className="fq-previa-foto">
              {form.imagem && <img src={form.imagem} alt="" />}
              {form.modalidade && <span>{form.modalidade}</span>}
            </div>
            <div className="fq-previa-corpo">
              <strong>{form.nome.trim() || "Nome da quadra"}</strong>
              <small>
                {[form.cobertura === "coberta" ? "Coberta" : "Descoberta", form.piso, form.capacidade && `${form.capacidade} jogadores`]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
              <p>
                <strong>{precoNovo ? formatarPreco(precoNovo) : "R$ —"}</strong>/hora
              </p>
            </div>
          </div>
        </section>

        <div className="fq-botoes">
          <button type="submit" className="pn-botao" disabled={salvando}>
            {salvando ? (
              <>
                <LoaderCircle size={17} className="fq-girando" aria-hidden="true" /> Salvando...
              </>
            ) : editando ? (
              "Salvar alterações"
            ) : (
              "Cadastrar quadra"
            )}
          </button>
          <Link to="/empresa/quadras" className="pn-botao pn-botao-contorno">
            Cancelar
          </Link>
        </div>
      </aside>
    </form>
  );
}
