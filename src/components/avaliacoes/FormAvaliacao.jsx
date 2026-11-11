import { useState } from "react";
import { Star, X } from "lucide-react";
import { aspectosAvaliacao, rotulosNota } from "../../data/avaliacoes.js";

/** Formulário de nova avaliação (aberto no modal da página de Avaliações). */
export default function FormAvaliacao({ quadra, onEnviar, onCancelar }) {
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [nome, setNome] = useState("");
  const [aspectos, setAspectos] = useState([]);
  const [texto, setTexto] = useState("");
  const [erros, setErros] = useState({});
  const notaExibida = hover || nota;

  function alternarAspecto(asp) {
    setAspectos((atual) => (atual.includes(asp) ? atual.filter((x) => x !== asp) : [...atual, asp]));
  }

  function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!nota) novos.nota = "Escolha uma nota de 1 a 5.";
    if (!nome.trim()) novos.nome = "Informe seu nome.";
    if (texto.trim().length < 20) novos.texto = "Escreva pelo menos 20 caracteres.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    onEnviar({ nota, nome: nome.trim(), aspectos, texto: texto.trim() });
  }

  return (
    <form className="av-form" onSubmit={enviar} noValidate>
      <div className="av-form-topo">
        <div>
          <h2 id="av-form-titulo">Avaliar {quadra.nome}</h2>
          <p>Conte para outros jogadores como foi a sua experiência.</p>
        </div>
        <button type="button" className="av-fechar" onClick={onCancelar} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <fieldset className="av-campo">
        <legend>Sua nota</legend>
        <div className="av-seletor" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={n <= notaExibida ? "on" : ""}
              onClick={() => setNota(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"} - ${rotulosNota[n]}`}
              aria-pressed={nota === n}
            >
              <Star size={34} />
            </button>
          ))}
          <span className="av-seletor-rotulo">{notaExibida ? rotulosNota[notaExibida] : "Toque nas estrelas"}</span>
        </div>
        {erros.nota && <p className="av-erro">{erros.nota}</p>}
      </fieldset>

      <div className="av-campo">
        <label htmlFor="av-nome">Seu nome</label>
        <input
          id="av-nome"
          value={nome}
          maxLength={80}
          autoComplete="name"
          placeholder="Como quer aparecer"
          onChange={(e) => setNome(e.target.value)}
          aria-invalid={!!erros.nome}
        />
        {erros.nome && <p className="av-erro">{erros.nome}</p>}
      </div>

      <fieldset className="av-campo">
        <legend>
          O que se destacou? <small>(opcional)</small>
        </legend>
        <div className="av-aspectos-lista">
          {aspectosAvaliacao.map((asp) => (
            <button
              key={asp}
              type="button"
              className="av-aspecto"
              aria-pressed={aspectos.includes(asp)}
              onClick={() => alternarAspecto(asp)}
            >
              {asp}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="av-campo">
        <label htmlFor="av-texto">Comentário</label>
        <textarea
          id="av-texto"
          rows={4}
          maxLength={500}
          value={texto}
          placeholder="Como estava a quadra, o atendimento, a estrutura..."
          onChange={(e) => setTexto(e.target.value)}
          aria-invalid={!!erros.texto}
        />
        <div className="av-campo-rodape">
          {erros.texto ? <p className="av-erro">{erros.texto}</p> : <span />}
          <small>{texto.length}/500</small>
        </div>
      </div>

      <div className="av-form-acoes">
        <button type="button" className="av-botao av-botao-contorno" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="av-botao">
          Publicar avaliação
        </button>
      </div>
    </form>
  );
}
