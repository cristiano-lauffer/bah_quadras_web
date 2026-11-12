import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  MessageSquarePlus,
  Navigation,
  SearchX,
  Star,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useDados } from "../hooks/useDados.js";
import { buscarQuadraPublica } from "../services/catalogoService.js";
import { avaliacoesDaQuadra } from "../services/avaliacoesService.js";
import { buscarVinculoPublico, gradePadrao } from "../services/quadrasService.js";
import { horariosOcupados } from "../services/reservasService.js";
import {
  cobraPorBateria,
  corDoNome,
  formatarNota,
  formatarPreco,
  iniciais,
  isoComDias,
  semAvaliacoes,
  tempoRelativo,
  unidadePreco,
  foto,
} from "../utils/formatadores.js";
import "../css/DetalhesQuadra.css";
import { useTitulo } from "../hooks/useTitulo.js";
import { linkWhatsApp } from "../utils/agenda.js";
import Esqueleto from "../components/Esqueleto.jsx";

export default function DetalhesQuadra() {
  const { id } = useParams();
  // Catálogo: quadras de demonstração + as cadastradas pela empresa.
  const quadra = buscarQuadraPublica(id);
  useTitulo(quadra ? quadra.nome : "Quadra não encontrada");

  return (
    <div className="public-page dq">
      <Header />
      <main className="dq-container">
        {quadra ? (
          <Conteudo key={quadra.id} quadra={quadra} />
        ) : (
          <div className="dq-nao-encontrada">
            <SearchX size={44} aria-hidden="true" />
            <h1>Quadra não encontrada</h1>
            <p>O link pode estar incorreto ou a quadra saiu do ar.</p>
            <Link to="/#quadras" className="dq-botao">Ver quadras disponíveis</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Conteudo({ quadra }) {
  const [fotoAtual, setFotoAtual] = useState(0);
  const hoje = isoComDias(0);

  const { dados: vinculo, carregando } = useDados(() => buscarVinculoPublico(quadra.id), [quadra.id]);
  const { dados: ocupados } = useDados(() => horariosOcupados(quadra.id, hoje), [quadra.id, hoje]);

  const preco = vinculo?.preco ?? quadra.preco;
  const situacao = vinculo?.status ?? "ativa";
  const grade = vinculo?.horarios ?? gradePadrao();
  const horaAgora = new Date().getHours();
  const livresHoje = (grade[new Date().getDay()] ?? []).filter(
    (h) => Number(h.slice(0, 2)) > horaAgora && !ocupados?.includes(h)
  );

  const buscaMapa = encodeURIComponent(quadra.mapa ?? quadra.endereco);

  const avaliacoes = avaliacoesDaQuadra(quadra.id)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3);

  return (
    <>
      <Link to="/#quadras" className="dq-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para as quadras
      </Link>

      {/* ===== Galeria ===== */}
      <section className="dq-galeria" aria-label="Fotos">
        <img className="dq-galeria-principal" {...foto(quadra.imagens[fotoAtual], 1100)} alt={`${quadra.nome}, foto ${fotoAtual + 1}`} />
        <div className="dq-galeria-miniaturas">
          {quadra.imagens.map((img, i) => (
            <button
              key={img}
              type="button"
              className="dq-miniatura"
              aria-pressed={fotoAtual === i}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setFotoAtual(i)}
            >
              <img {...foto(img, 220)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      <div className="dq-layout">
        <div className="dq-principal">
          {/* ===== Título ===== */}
          <header className="dq-titulo">
            <span className="dq-tag">{quadra.modalidade}</span>
            <h1>{quadra.nome}</h1>
            <p>
              {semAvaliacoes(quadra) ? (
                <span className="dq-nova">Nova no Bah Quadras</span>
              ) : (
                <a href="#avaliacoes" className="dq-nota">
                  <Star size={16} aria-hidden="true" />
                  <strong>{formatarNota(quadra.avaliacao)}</strong>
                  <span>({quadra.quantidadeAvaliacoes} avaliações)</span>
                </a>
              )}
              <span>
                <MapPin size={16} aria-hidden="true" /> {quadra.endereco}
              </span>
            </p>
          </header>

          <section className="dq-secao">
            <h2>{cobraPorBateria(quadra) ? "Sobre o kartódromo" : "Sobre a quadra"}</h2>
            <p>{quadra.descricao}</p>
          </section>

          <section className="dq-secao">
            <h2>Estrutura</h2>
            {quadra.estrutura.length ? (
              <ul className="dq-estrutura">
                {quadra.estrutura.map((item) => (
                  <li key={item}>
                    <Check size={16} aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dq-suave">Informações sobre a estrutura em breve.</p>
            )}
          </section>

          {/* ===== Localização ===== */}
          <section className="dq-secao" aria-labelledby="dq-mapa-titulo">
            <h2 id="dq-mapa-titulo">Localização</h2>
            <p className="dq-endereco">
              <MapPin size={17} aria-hidden="true" /> {quadra.endereco}
            </p>
            <div className="dq-mapa">
              <iframe
                title={`Mapa com a localização de ${quadra.nome}`}
                src={`https://www.google.com/maps?q=${buscaMapa}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="dq-mapa-acoes">
              <a
                className="dq-botao"
                href={`https://www.google.com/maps/dir/?api=1&destination=${buscaMapa}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation size={17} aria-hidden="true" /> Como chegar
              </a>
              <a
                className="dq-botao dq-botao-contorno"
                href={`https://www.google.com/maps/search/?api=1&query=${buscaMapa}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={17} aria-hidden="true" /> Abrir no Google Maps
              </a>
            </div>
          </section>

          <section className="dq-secao" id="avaliacoes">
            <div className="dq-secao-topo">
              <h2>Avaliações</h2>
              <Link to={`/avaliacoes/${quadra.id}`} className="dq-link">
                Ver todas <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {avaliacoes.length ? (
              <ul className="dq-avaliacoes">
                {avaliacoes.map((a) => (
                  <li key={a.id}>
                    <div className="dq-avaliacao-topo">
                      <span className="dq-avatar" style={{ background: corDoNome(a.nome) }} aria-hidden="true">
                        {iniciais(a.nome)}
                      </span>
                      <div>
                        <strong>{a.nome}</strong>
                        <span className="dq-estrelas" role="img" aria-label={`${a.nota} de 5 estrelas`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={13} className={n <= a.nota ? "on" : ""} aria-hidden="true" />
                          ))}
                        </span>
                      </div>
                      <time dateTime={a.data}>{tempoRelativo(a.data)}</time>
                    </div>
                    <p>{a.texto}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dq-suave">Ainda não há avaliações para esta quadra.</p>
            )}

            <Link to={`/avaliacoes/${quadra.id}?escrever=1`} className="dq-botao dq-botao-contorno">
              <MessageSquarePlus size={18} aria-hidden="true" /> Jogou aqui? Avalie
            </Link>
          </section>
        </div>

        {/* ===== Reserva ===== */}
        <aside className="dq-reserva" aria-label="Reservar">
          <p className="dq-preco">
            <strong>{formatarPreco(preco)}</strong> <span>/ {unidadePreco(quadra)}</span>
          </p>

          {carregando ? (
            <Esqueleto tipo="botoes" quantidade={6} rotulo="Carregando horários..." />
          ) : situacao !== "ativa" ? (
            <p className="dq-indisponivel">
              <CircleAlert size={17} aria-hidden="true" />
              {situacao === "manutencao" ? "Quadra em manutenção no momento." : "Quadra indisponível para reservas."}
            </p>
          ) : (
            <>
              <div className="dq-hoje">
                <span>
                  <Clock size={15} aria-hidden="true" /> Livres hoje
                </span>
                {livresHoje.length ? (
                  <div className="dq-horarios">
                    {livresHoje.slice(0, 6).map((h) => (
                      <Link key={h} to={`/agendamento/${quadra.id}?data=${hoje}&hora=${h}`} className="dq-horario">
                        {h}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="dq-suave">Sem horários livres hoje. Veja os próximos dias.</p>
                )}
              </div>

              <Link to={`/agendamento/${quadra.id}`} className="dq-botao">
                <CalendarCheck size={18} aria-hidden="true" /> Ver todos os horários
              </Link>
            </>
          )}

          <small className="dq-suave">Cancelamento grátis até 24h antes.</small>

          <a
            className="dq-compartilhar"
            href={linkWhatsApp(
              `Olha essa quadra no Bah Quadras: ${quadra.nome} (${quadra.modalidade}) em ${quadra.cidade}, ${formatarPreco(preco)}/${unidadePreco(quadra)}.
${window.location.origin}/quadra/${quadra.id}`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} aria-hidden="true" /> Compartilhar no WhatsApp
          </a>
        </aside>
      </div>
    </>
  );
}
