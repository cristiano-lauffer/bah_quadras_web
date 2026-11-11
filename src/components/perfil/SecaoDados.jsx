import { useState } from "react";
import { CalendarDays, Camera, MapPin, PencilLine } from "lucide-react";
import { modalidadesDe, quadrasPublicas } from "../../services/catalogoService.js";
import { formatarData } from "../../utils/formatadores.js";
import { emailValido, mascaraTelefone, telefoneValido } from "../../utils/mascaras.js";

const camposDados = [
  { name: "nome", rotulo: "Nome completo", autoComplete: "name" },
  { name: "email", rotulo: "E-mail", type: "email", autoComplete: "email" },
  { name: "telefone", rotulo: "Celular", type: "tel", autoComplete: "tel", inputMode: "numeric" },
  { name: "cidade", rotulo: "Cidade", autoComplete: "address-level2" },
];

export default function SecaoDados({ usuario, avatar, onFoto, onSalvar }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(usuario);
  const [erros, setErros] = useState({});

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "telefone" ? mascaraTelefone(value) : value }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function alternarEsporte(m) {
    setForm((f) => ({
      ...f,
      esportes: f.esportes.includes(m) ? f.esportes.filter((x) => x !== m) : [...f.esportes, m],
    }));
  }

  function salvar(e) {
    e.preventDefault();
    const novos = {};
    if (form.nome.trim().split(/\s+/).length < 2) novos.nome = "Informe nome e sobrenome.";
    if (!emailValido(form.email)) novos.email = "Digite um e-mail válido.";
    if (!telefoneValido(form.telefone)) novos.telefone = "Digite um telefone com DDD.";
    if (!form.cidade.trim()) novos.cidade = "Informe sua cidade.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    onSalvar({ ...form, nome: form.nome.trim() });
    setEditando(false);
  }

  function cancelar() {
    setForm(usuario);
    setErros({});
    setEditando(false);
  }

  return (
    <div className="pn-pilha">
      <section className="pn-card pu-identidade">
        <div className="pu-avatar-grande">
          <span className="pn-avatar">{avatar}</span>
          <label className="pu-avatar-botao" title="Trocar foto">
            <Camera size={16} aria-hidden="true" />
            <span className="pn-sr">Trocar foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onFoto(e.target.files[0])}
            />
          </label>
        </div>
        <div>
          <h2>{usuario.nome}</h2>
          <p>
            <span><MapPin size={15} aria-hidden="true" /> {usuario.cidade}</span>
            <span>
              <CalendarDays size={15} aria-hidden="true" /> Membro desde{" "}
              {formatarData(usuario.membroDesde, { month: "long", year: "numeric" })}
            </span>
          </p>
        </div>
      </section>

      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>Informações pessoais</h2>
            <p>Esses dados aparecem nas suas reservas e ajudam as quadras a falar com você.</p>
          </div>
          {!editando && (
            <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setEditando(true)}>
              <PencilLine size={17} aria-hidden="true" /> Editar
            </button>
          )}
        </div>

        {editando ? (
          <form className="pn-form" onSubmit={salvar} noValidate>
            <div className="pn-form-grade">
              {camposDados.map(({ name, rotulo, ...resto }) => (
                <div key={name} className="pn-campo">
                  <label htmlFor={`pu-${name}`}>{rotulo}</label>
                  <input
                    id={`pu-${name}`}
                    name={name}
                    value={form[name]}
                    onChange={atualizar}
                    aria-invalid={!!erros[name]}
                    {...resto}
                  />
                  {erros[name] && <p className="pn-erro">{erros[name]}</p>}
                </div>
              ))}
            </div>

            <fieldset className="pn-campo">
              <legend>Esportes favoritos</legend>
              <div className="pn-chips">
                {modalidadesDe(quadrasPublicas()).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="pn-chip"
                    aria-pressed={form.esportes.includes(m)}
                    onClick={() => alternarEsporte(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="pn-form-acoes">
              <button type="button" className="pn-botao pn-botao-contorno" onClick={cancelar}>
                Cancelar
              </button>
              <button type="submit" className="pn-botao">
                Salvar alterações
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="pu-dados">
              {camposDados.map(({ name, rotulo }) => (
                <div key={name}>
                  <dt>{rotulo}</dt>
                  <dd>{usuario[name]}</dd>
                </div>
              ))}
            </dl>
            <div className="pu-dados-esportes">
              <span>Esportes favoritos</span>
              <ul className="pn-chips pu-lista-limpa">
                {usuario.esportes.length ? (
                  usuario.esportes.map((m) => (
                    <li key={m} className="pn-chip marcado">{m}</li>
                  ))
                ) : (
                  <li className="pn-texto-suave">Nenhum selecionado</li>
                )}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
