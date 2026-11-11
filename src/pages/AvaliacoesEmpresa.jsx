import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  LoaderCircle,
  MessageSquareReply,
  MessagesSquare,
  PencilLine,
  Star,
  Trash2,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import Esqueleto from "../components/Esqueleto.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { buscarQuadraPublica } from "../services/catalogoService.js";
import { rotulosNota } from "../data/avaliacoes.js";
import { empresaAtual } from "../services/empresaService.js";
import { apagarResposta, listarAvaliacoesDaEmpresa, responderAvaliacao } from "../services/respostasService.js";
import { corDoNome, formatarData, formatarNota, iniciais, tempoRelativo } from "../utils/formatadores.js";
import "../css/AvaliacoesEmpresa.css";

const LIMITE = 500;
const sugestoes = [
  "Obrigado pela avaliação! Esperamos você no próximo jogo.",
  "Que bom que gostou! Volte sempre.",
  "Obrigado pelo retorno, vamos melhorar esse ponto.",
];

function Estrelas({ nota }) {
  return (
    <span className="ae-estrelas" role="img" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= nota ? "on" : ""} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function AvaliacoesEmpresa() {
  const { dados, carregando, recarregar } = useDados(listarAvaliacoesDaEmpresa);
  const [filtro, setFiltro] = useState("sem-resposta");
  const [editando, setEditando] = useState(null); // id da avaliação com o formulário aberto
  const [toast, setToast] = useState("");

  const lista = dados ?? [];
  const semResposta = lista.filter((a) => !a.resposta);
  const respondidas = lista.filter((a) => a.resposta);
  const media = lista.length ? lista.reduce((s, a) => s + a.nota, 0) / lista.length : 0;
  const taxa = lista.length ? Math.round((respondidas.length / lista.length) * 100) : 0;

  const filtros = [
    { id: "sem-resposta", texto: "Sem resposta", qtd: semResposta.length },
    { id: "respondidas", texto: "Respondidas", qtd: respondidas.length },
    { id: "todas", texto: "Todas", qtd: lista.length },
  ];
  const visiveis = filtro === "sem-resposta" ? semResposta : filtro === "respondidas" ? respondidas : lista;

  async function aoSalvar(id, texto, eraEdicao) {
    await responderAvaliacao(id, texto);
    setEditando(null);
    recarregar();
    setToast(eraEdicao ? "Resposta atualizada." : "Resposta publicada! Ela já aparece na página da quadra.");
  }

  async function aoApagar(id) {
    await apagarResposta(id);
    recarregar();
    setToast("Resposta apagada.");
  }

  return (
    <EmpresaLayout
      titulo="Avaliações"
      subtitulo="Responda os jogadores: isso aumenta a confiança de quem ainda não conhece seu espaço"
      acoes={
        <Link to="/avaliacoes/arena-sport" className="pn-botao pn-botao-contorno">
          <ExternalLink size={17} aria-hidden="true" /> Ver página pública
        </Link>
      }
    >
      <div className="pn-pilha">
        {carregando && !dados ? (
          <Esqueleto tipo="kpis" quantidade={4} rotulo="Carregando avaliações..." />
        ) : (
          <section className="pn-kpis" aria-label="Resumo das avaliações">
            <article className="pn-kpi">
              <div className="pn-kpi-topo">Nota média<span className="pn-kpi-icone" aria-hidden="true"><Star size={18} /></span></div>
              <strong>{lista.length ? formatarNota(media) : "–"}</strong>
              <small>de 5 estrelas</small>
            </article>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">Avaliações<span className="pn-kpi-icone" aria-hidden="true"><MessagesSquare size={18} /></span></div>
              <strong>{lista.length}</strong>
              <small>no total</small>
            </article>
            <article className="pn-kpi">
              <div className="pn-kpi-topo">Respondidas<span className="pn-kpi-icone" aria-hidden="true"><MessageSquareReply size={18} /></span></div>
              <strong>{taxa}%</strong>
              <div className="pn-progresso" aria-hidden="true"><span style={{ width: `${taxa}%` }} /></div>
            </article>
            <article className={`pn-kpi ${semResposta.length ? "ae-kpi-alerta" : ""}`}>
              <div className="pn-kpi-topo">Aguardando resposta<span className="pn-kpi-icone" aria-hidden="true"><PencilLine size={18} /></span></div>
              <strong>{semResposta.length}</strong>
              <small>{semResposta.length ? "responda quando puder" : "tudo em dia"}</small>
            </article>
          </section>
        )}

        <div className="pn-chips" role="group" aria-label="Filtrar avaliações">
          {filtros.map((f) => (
            <button key={f.id} type="button" className="pn-chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.texto} <small className="ae-contagem">{f.qtd}</small>
            </button>
          ))}
        </div>

        {carregando && !dados ? (
          <Esqueleto tipo="lista" quantidade={4} rotulo="" />
        ) : visiveis.length === 0 ? (
          <div className="pn-vazio">
            <MessageSquareReply size={40} aria-hidden="true" />
            <h3>{filtro === "sem-resposta" ? "Nenhuma avaliação esperando resposta" : "Nada por aqui"}</h3>
            <p>{filtro === "sem-resposta" ? "Você respondeu todos os jogadores. 👏" : "Tente outro filtro."}</p>
          </div>
        ) : (
          <ul className="ae-lista">
            {visiveis.map((a) => (
              <li key={a.id} className="pn-card ae-card">
                <div className="ae-topo">
                  <span className="pn-avatar" style={{ background: corDoNome(a.nome) }} aria-hidden="true">
                    {iniciais(a.nome)}
                  </span>
                  <div className="ae-autor">
                    <strong>{a.nome}</strong>
                    <span>
                      <Estrelas nota={a.nota} /> {rotulosNota[a.nota]} · {buscarQuadraPublica(a.quadraId)?.nome}
                    </span>
                  </div>
                  <time dateTime={a.data} title={formatarData(a.data)}>{tempoRelativo(a.data)}</time>
                </div>

                <p className="ae-texto">{a.texto}</p>
                {a.aspectos.length > 0 && (
                  <div className="ae-aspectos">
                    {a.aspectos.map((asp) => <span key={asp}>{asp}</span>)}
                  </div>
                )}

                {editando === a.id ? (
                  <FormResposta
                    inicial={a.resposta?.texto ?? ""}
                    onCancelar={() => setEditando(null)}
                    onSalvar={(texto) => aoSalvar(a.id, texto, Boolean(a.resposta))}
                  />
                ) : a.resposta ? (
                  <div className="ae-resposta">
                    <div className="ae-resposta-topo">
                      <strong>Resposta de {empresaAtual().nome}</strong>
                      <time dateTime={a.resposta.data}>{tempoRelativo(a.resposta.data)}</time>
                    </div>
                    <p>{a.resposta.texto}</p>
                    <div className="ae-resposta-acoes">
                      <button type="button" className="ae-acao" onClick={() => setEditando(a.id)}>
                        <PencilLine size={15} aria-hidden="true" /> Editar
                      </button>
                      <button type="button" className="ae-acao perigo" onClick={() => aoApagar(a.id)}>
                        <Trash2 size={15} aria-hidden="true" /> Apagar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="pn-botao pn-botao-contorno ae-responder" onClick={() => setEditando(a.id)}>
                    <MessageSquareReply size={17} aria-hidden="true" /> Responder
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </EmpresaLayout>
  );
}

function FormResposta({ inicial, onSalvar, onCancelar }) {
  const [texto, setTexto] = useState(inicial);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (texto.trim().length < 10) {
      setErro("Escreva pelo menos 10 caracteres.");
      return;
    }
    setSalvando(true);
    await onSalvar(texto);
  }

  return (
    <form className="ae-form" onSubmit={enviar} noValidate>
      <label htmlFor="ae-texto" className="ae-form-rotulo">Sua resposta (pública)</label>
      {!inicial && (
        <div className="ae-sugestoes" aria-label="Sugestões de resposta">
          {sugestoes.map((s) => (
            <button key={s} type="button" className="pn-chip" onClick={() => setTexto(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <textarea
        id="ae-texto"
        rows={3}
        maxLength={LIMITE}
        value={texto}
        autoFocus
        onChange={(e) => {
          setTexto(e.target.value);
          if (erro) setErro("");
        }}
        placeholder="Agradeça e, se for o caso, conte o que vai melhorar."
        aria-invalid={Boolean(erro)}
      />
      <div className="ae-form-rodape">
        {erro ? <p className="pn-erro">{erro}</p> : <span />}
        <small>{texto.length}/{LIMITE}</small>
      </div>
      <div className="ae-form-acoes">
        <button type="button" className="pn-botao pn-botao-contorno" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="pn-botao" disabled={salvando}>
          {salvando ? <><LoaderCircle size={16} className="ae-girando" aria-hidden="true" /> Publicando...</> : "Publicar resposta"}
        </button>
      </div>
    </form>
  );
}
