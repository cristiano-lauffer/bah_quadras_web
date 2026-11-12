import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  MessageSquarePlus,
  PencilLine,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { listarRespostas } from "../services/respostasService.js";
import { empresaAtual } from "../services/empresaService.js";
import Estrelas from "../components/avaliacoes/Estrelas.jsx";
import FormAvaliacao from "../components/avaliacoes/FormAvaliacao.jsx";
import ResumoAvaliacoes from "../components/avaliacoes/ResumoAvaliacoes.jsx";
import { buscarQuadraPublica, quadrasPublicas } from "../services/catalogoService.js";
import { aspectosAvaliacao, rotulosNota } from "../data/avaliacoes.js";
import { apagarAvaliacao, avaliacoesDaQuadra, publicarAvaliacao } from "../services/avaliacoesService.js";
import { sessaoAtual } from "../services/sessaoService.js";
import {
  corDoNome,
  formatarData,
  iniciais,
  tempoRelativo,
  foto,
} from "../utils/formatadores.js";
import "../css/Avaliacoes.css";
import { useTitulo } from "../hooks/useTitulo.js";

const POR_PAGINA = 5;

const ordenacoes = {
  recentes: { texto: "Mais recentes", fn: (a, b) => b.data.localeCompare(a.data) },
  uteis: { texto: "Mais úteis", fn: (a, b) => b.util - a.util },
  maior: { texto: "Maior nota", fn: (a, b) => b.nota - a.nota },
  menor: { texto: "Menor nota", fn: (a, b) => a.nota - b.nota },
};

// A "key" faz a página reiniciar os filtros quando o usuário troca de quadra.
export default function AvaliacoesPagina() {
  const { id } = useParams();
  return <Avaliacoes key={id ?? "padrao"} id={id} />;
}

function Avaliacoes({ id }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const quadra = id ? buscarQuadraPublica(id) : quadrasPublicas()[0];
  useTitulo(quadra ? `Avaliações · ${quadra.nome}` : "Avaliações");

  // Lista lida do serviço (de novo a cada avaliação publicada ou apagada).
  const [avaliacoesLidas, setAvaliacoesLidas] = useState(() => (quadra ? avaliacoesDaQuadra(quadra.id) : []));
  const recarregarLista = () => setAvaliacoesLidas(avaliacoesDaQuadra(quadra.id));
  const { dados: respostas } = useDados(listarRespostas);
  const [marcadasUteis, setMarcadasUteis] = useState(() => new Set());
  const [filtroNota, setFiltroNota] = useState(0);
  const [filtroAspecto, setFiltroAspecto] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [formAberto, setFormAberto] = useState(searchParams.get("escrever") === "1");
  const [toast, setToast] = useState("");
  const dialogRef = useRef(null);

  // "?escrever=1" abre o formulário direto (usado por "Avaliar quadra" em Minhas Reservas).
  useEffect(() => {
    if (searchParams.get("escrever")) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (formAberto && !dialog.open) dialog.showModal();
    if (!formAberto && dialog.open) dialog.close();
  }, [formAberto]);

  if (!quadra) {
    return (
      <div className="av">
        <Header />
        <main className="av-container av-nao-encontrada">
          <h1>Quadra não encontrada</h1>
          <p>Não encontramos avaliações para este endereço.</p>
          <Link to="/" className="av-botao">Voltar para o início</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const lista = avaliacoesLidas;
  const total = lista.length;
  const media = total ? lista.reduce((s, a) => s + a.nota, 0) / total : 0;
  const porNota = [5, 4, 3, 2, 1].map((n) => ({ nota: n, qtd: lista.filter((a) => a.nota === n).length }));
  const aspectosContagem = aspectosAvaliacao
    .map((asp) => ({ asp, qtd: lista.filter((a) => a.aspectos.includes(asp)).length }))
    .filter((x) => x.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd);

  const filtradas = lista
    .filter((a) => !filtroNota || a.nota === filtroNota)
    .filter((a) => !filtroAspecto || a.aspectos.includes(filtroAspecto))
    .sort(ordenacoes[ordem].fn);

  const temFiltro = filtroNota || filtroAspecto;

  function mudarFiltroNota(n) {
    setFiltroNota((atual) => (atual === n ? 0 : n));
    setVisiveis(POR_PAGINA);
  }

  function mudarFiltroAspecto(asp) {
    setFiltroAspecto((atual) => (atual === asp ? "" : asp));
    setVisiveis(POR_PAGINA);
  }

  function limparFiltros() {
    setFiltroNota(0);
    setFiltroAspecto("");
    setVisiveis(POR_PAGINA);
  }

  function alternarUtil(idAvaliacao) {
    setMarcadasUteis((atual) => {
      const novo = new Set(atual);
      if (novo.has(idAvaliacao)) novo.delete(idAvaliacao);
      else novo.add(idAvaliacao);
      return novo;
    });
  }

  async function publicar(dados) {
    await publicarAvaliacao({ quadraId: quadra.id, ...dados });
    recarregarLista();
    limparFiltros();
    setOrdem("recentes");
    setFormAberto(false);
    setToast("Obrigado! Sua avaliação foi publicada.");
  }

  async function apagar(id) {
    await apagarAvaliacao(id);
    recarregarLista();
    setToast("Sua avaliação foi apagada.");
  }

  return (
    <div className="av">
      <Header />

      <main className="av-container">
        <Link to={`/quadra/${quadra.id}`} className="av-voltar">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para a quadra
        </Link>

        {/* ===== Cabeçalho com a quadra ===== */}
        <header className="av-cabecalho">
          <img {...foto(quadra.imagens[0], 400)} alt="" className="av-cabecalho-foto" />
          <div className="av-cabecalho-info">
            <span className="av-tag">{quadra.modalidade}</span>
            <h1>Avaliações da {quadra.nome}</h1>
            <p>
              <MapPin size={15} aria-hidden="true" /> {quadra.bairro}, {quadra.cidade}
            </p>
          </div>
          <div className="av-cabecalho-acoes">
            <label className="av-trocar">
              <span>Ver outra quadra</span>
              <select value={quadra.id} onChange={(e) => navigate(`/avaliacoes/${e.target.value}`)}>
                {quadrasPublicas().map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.nome}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="av-botao" onClick={() => setFormAberto(true)}>
              <PencilLine size={18} aria-hidden="true" /> Escrever avaliação
            </button>
          </div>
        </header>

        <div className="av-layout">
          {/* ===== Resumo ===== */}
          <ResumoAvaliacoes
            total={total}
            media={media}
            porNota={porNota}
            aspectosContagem={aspectosContagem}
            filtroNota={filtroNota}
            filtroAspecto={filtroAspecto}
            onFiltroNota={mudarFiltroNota}
            onFiltroAspecto={mudarFiltroAspecto}
            onAvaliar={() => setFormAberto(true)}
          />

          {/* ===== Lista ===== */}
          <section className="av-lista-secao" aria-labelledby="av-lista-titulo">
            <div className="av-barra-ferramentas">
              <div>
                <h2 id="av-lista-titulo">Comentários dos jogadores</h2>
                <p>
                  Mostrando {Math.min(visiveis, filtradas.length)} de {filtradas.length}
                </p>
              </div>
              <label className="av-ordenar">
                Ordenar
                <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                  {Object.entries(ordenacoes).map(([valor, { texto }]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {temFiltro && (
              <div className="av-filtros-ativos">
                {filtroNota > 0 && (
                  <button type="button" onClick={() => mudarFiltroNota(filtroNota)}>
                    {filtroNota} estrelas <X size={14} aria-label="remover filtro" />
                  </button>
                )}
                {filtroAspecto && (
                  <button type="button" onClick={() => mudarFiltroAspecto(filtroAspecto)}>
                    {filtroAspecto} <X size={14} aria-label="remover filtro" />
                  </button>
                )}
                <button type="button" className="av-limpar" onClick={limparFiltros}>
                  Limpar tudo
                </button>
              </div>
            )}

            {filtradas.length > 0 ? (
              <ul className="av-lista">
                {filtradas.slice(0, visiveis).map((a) => {
                  const marcada = marcadasUteis.has(a.id);
                  return (
                    <li key={a.id} className={`av-card ${a.propria ? "propria" : ""}`}>
                      <div className="av-card-topo">
                        <span className="av-avatar" style={{ background: corDoNome(a.nome) }} aria-hidden="true">
                          {iniciais(a.nome)}
                        </span>
                        <div className="av-card-autor">
                          <strong>{a.nome}</strong>
                          {a.propria ? (
                            <span className="av-selo av-selo-voce">Sua avaliação</span>
                          ) : (
                            <span className="av-selo">
                              <BadgeCheck size={14} aria-hidden="true" /> Jogou aqui
                            </span>
                          )}
                        </div>
                        <time dateTime={a.data} title={formatarData(a.data)}>
                          {tempoRelativo(a.data)}
                        </time>
                      </div>

                      <div className="av-card-nota">
                        <Estrelas valor={a.nota} />
                        <span>{rotulosNota[a.nota]}</span>
                      </div>

                      <p className="av-card-texto">{a.texto}</p>

                      {respostas?.[a.id] && (
                        <div className="av-resposta">
                          <div className="av-resposta-topo">
                            <strong>Resposta de {empresaAtual().nome}</strong>
                            <time dateTime={respostas[a.id].data}>{tempoRelativo(respostas[a.id].data)}</time>
                          </div>
                          <p>{respostas[a.id].texto}</p>
                        </div>
                      )}

                      <div className="av-card-rodape">
                        <div className="av-card-aspectos">
                          {a.aspectos.map((asp) => (
                            <span key={asp}>{asp}</span>
                          ))}
                        </div>
                        {a.propria && (
                          <button type="button" className="av-util av-apagar" onClick={() => apagar(a.id)}>
                            <Trash2 size={15} aria-hidden="true" /> Apagar
                          </button>
                        )}
                        {!a.propria && (
                          <button
                            type="button"
                            className="av-util"
                            aria-pressed={marcada}
                            onClick={() => alternarUtil(a.id)}
                          >
                            <ThumbsUp size={15} aria-hidden="true" /> Útil ({a.util + (marcada ? 1 : 0)})
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="av-vazio">
                <MessageSquarePlus size={40} aria-hidden="true" />
                {total === 0 ? (
                  <>
                    <h3>Ainda não há avaliações</h3>
                    <p>Seja o primeiro a contar como foi jogar na {quadra.nome}.</p>
                    <button type="button" className="av-botao" onClick={() => setFormAberto(true)}>
                      Escrever avaliação
                    </button>
                  </>
                ) : (
                  <>
                    <h3>Nenhuma avaliação com esses filtros</h3>
                    <p>Tente remover algum filtro para ver mais comentários.</p>
                    <button type="button" className="av-botao av-botao-contorno" onClick={limparFiltros}>
                      Limpar filtros
                    </button>
                  </>
                )}
              </div>
            )}

            {visiveis < filtradas.length && (
              <button
                type="button"
                className="av-botao av-botao-contorno av-mais"
                onClick={() => setVisiveis((v) => v + POR_PAGINA)}
              >
                Carregar mais avaliações
              </button>
            )}
          </section>
        </div>
      </main>

      {/* ===== Modal do formulário ===== */}
      <dialog
        ref={dialogRef}
        className="av-modal"
        aria-labelledby="av-form-titulo"
        onClose={() => setFormAberto(false)}
        onClick={(e) => e.target === e.currentTarget && setFormAberto(false)}
      >
        {formAberto && (
          <FormAvaliacao
            quadra={quadra}
            nomeInicial={sessaoAtual()?.tipo === "usuario" ? sessaoAtual().nome : ""}
            onEnviar={publicar}
            onCancelar={() => setFormAberto(false)}
          />
        )}
      </dialog>

      <Toast mensagem={toast} onFechar={() => setToast("")} />
      <Footer />
    </div>
  );
}
