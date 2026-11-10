import { Link } from "react-router-dom";
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleCheck,
  Circle,
  Clock,
  CreditCard,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  PencilLine,
  Phone,
  Star,
  Wrench,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import { empresaDemo, quadrasEmpresa } from "../data/empresa.js";
import { buscarQuadraPorId } from "../data/quadras.js";
import { useDados } from "../hooks/useDados.js";
import { listarQuadras } from "../services/quadrasService.js";
import { formatarData, formatarNota, formatarPreco } from "../utils/formatadores.js";
import "../css/PerfilEmpresa.css";

const empresa = empresaDemo;
const quadraPublica = buscarQuadraPorId("arena-sport");
const { rua, numero, bairro, cidade, estado, cep } = empresa.endereco;
const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade}/${estado}`;

// Itens que deixam o perfil mais completo para os jogadores.
const checklist = [
  { texto: "Logo e foto de capa", feito: Boolean(empresa.logo && empresa.capa) },
  { texto: "Descrição da empresa", feito: empresa.descricao.length > 50 },
  { texto: "Pelo menos 4 fotos", feito: empresa.fotos.length >= 4 },
  { texto: "Horário de funcionamento", feito: empresa.horarios.length === 7 },
  { texto: "Redes sociais", feito: Boolean(empresa.instagram) },
  { texto: "CNPJ verificado", feito: empresa.verificada },
  { texto: "Vídeo do espaço", feito: false },
  { texto: "Responder às avaliações", feito: false },
];
const completude = Math.round((checklist.filter((c) => c.feito).length / checklist.length) * 100);

const paraMinutos = (h) => (h === "00:00" ? 24 * 60 : Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5)));

function situacaoAgora() {
  const agora = new Date();
  const hoje = empresa.horarios.find((h) => h.dia === agora.getDay());
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const aberto = hoje && minutos >= paraMinutos(hoje.abre) && minutos < paraMinutos(hoje.fecha);
  return { aberto, hoje };
}

export default function PerfilEmpresa() {
  // Só as quadras que os jogadores podem ver (desativadas ficam de fora).
  const { dados } = useDados(listarQuadras);
  const quadrasVisiveis = (dados ?? quadrasEmpresa).filter((q) => q.status !== "inativa");
  const { aberto, hoje } = situacaoAgora();

  return (
    <EmpresaLayout
      titulo="Perfil da empresa"
      subtitulo="É assim que os jogadores veem a sua empresa no Bah Quadras"
      acoes={
        <Link to="/empresa/editar" className="pn-botao">
          <PencilLine size={18} aria-hidden="true" /> Editar perfil
        </Link>
      }
    >
      <div className="pn-pilha">
        {/* ===== Capa ===== */}
        <section className="pe-capa" aria-label="Identificação">
          <img src={empresa.capa} alt="" className="pe-capa-imagem" />
          <div className="pe-capa-conteudo">
            <span className="pe-logo" aria-hidden="true">{empresa.logo}</span>
            <div className="pe-capa-texto">
              <h2>
                {empresa.nome}
                {empresa.verificada && (
                  <span className="pe-verificada" title="Empresa verificada">
                    <BadgeCheck size={22} aria-hidden="true" />
                    <span className="pn-sr">Empresa verificada</span>
                  </span>
                )}
              </h2>
              <p className="pe-slogan">{empresa.slogan}</p>
              <ul className="pe-meta">
                <li>
                  <Star size={15} aria-hidden="true" className="pe-estrela" />
                  <strong>{formatarNota(quadraPublica.avaliacao)}</strong>
                  <span>({quadraPublica.quantidadeAvaliacoes} avaliações)</span>
                </li>
                <li>
                  <MapPin size={15} aria-hidden="true" /> {bairro}, {cidade}/{estado}
                </li>
                <li>
                  <CalendarDays size={15} aria-hidden="true" /> No Bah Quadras desde{" "}
                  {formatarData(empresa.membroDesde, { month: "long", year: "numeric" })}
                </li>
              </ul>
            </div>
            <span className={`pn-status ${aberto ? "ok" : "neutro"} pe-aberto`}>
              <Clock size={13} aria-hidden="true" />
              {aberto ? `Aberto agora · até ${hoje.fecha}` : "Fechado agora"}
            </span>
          </div>
        </section>

        <div className="pn-grade">
          {/* ===== Coluna principal ===== */}
          <div className="pn-pilha">
            <section className="pn-card">
              <div className="pn-card-topo">
                <h2>Sobre a empresa</h2>
              </div>
              <p className="pe-descricao">{empresa.descricao}</p>

              <ul className="pe-galeria" aria-label="Fotos do espaço">
                {empresa.fotos.map((foto, i) => (
                  <li key={foto}>
                    <img src={foto} alt={`Foto ${i + 1} do espaço`} loading="lazy" />
                  </li>
                ))}
              </ul>
            </section>

            <section className="pn-card">
              <div className="pn-card-topo">
                <div>
                  <h2>Nossas quadras</h2>
                  <p>{quadrasVisiveis.length} quadras visíveis para os jogadores</p>
                </div>
                <Link to="/empresa/quadras" className="pn-link">
                  Gerenciar <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              <ul className="pe-quadras">
                {quadrasVisiveis.map((q) => (
                  <li key={q.id} className="pe-quadra">
                    <img src={q.imagem} alt="" loading="lazy" />
                    <div>
                      <span className="pe-quadra-modalidade">{q.modalidade}</span>
                      <strong>
                        {q.publicaId ? <Link to={`/quadra/${q.publicaId}`}>{q.nome}</Link> : q.nome}
                      </strong>
                      <span className="pe-quadra-rodape">
                        <span>{formatarPreco(q.preco)}/h</span>
                        {q.status === "ativa" ? (
                          <span className="pn-status ok">
                            <CircleCheck size={13} aria-hidden="true" /> Disponível
                          </span>
                        ) : (
                          <span className="pn-status alerta">
                            <Wrench size={13} aria-hidden="true" /> Manutenção
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pn-card">
              <div className="pn-card-topo">
                <h2>Comodidades</h2>
              </div>
              <ul className="pn-chips pe-lista-limpa">
                {empresa.comodidades.map((c) => (
                  <li key={c} className="pn-chip">
                    <Check size={14} aria-hidden="true" /> {c}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pn-card">
              <div className="pn-card-topo">
                <h2>Pagamento e cancelamento</h2>
              </div>
              <ul className="pn-chips pe-lista-limpa">
                {empresa.pagamentos.map((p) => (
                  <li key={p} className="pn-chip">
                    <CreditCard size={14} aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
              <p className="pe-politica">{empresa.politicaCancelamento}</p>
            </section>
          </div>

          {/* ===== Coluna lateral ===== */}
          <div className="pn-pilha">
            <section className="pn-card pe-completude">
              <div className="pn-card-topo">
                <div>
                  <h2>Seu perfil está {completude}% completo</h2>
                  <p>Perfis completos recebem mais reservas.</p>
                </div>
              </div>
              <div
                className="pn-progresso"
                role="progressbar"
                aria-valuenow={completude}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Completude do perfil"
              >
                <span style={{ width: `${completude}%` }} />
              </div>
              <ul className="pe-checklist">
                {checklist.map((c) => (
                  <li key={c.texto} className={c.feito ? "feito" : ""}>
                    {c.feito ? <CircleCheck size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                    {c.texto}
                    <span className="pn-sr">{c.feito ? "(concluído)" : "(pendente)"}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="pn-card">
              <div className="pn-card-topo">
                <h2>Contato</h2>
              </div>
              <ul className="pe-contatos">
                <li>
                  <Phone size={17} aria-hidden="true" />
                  <span><small>Telefone</small>{empresa.telefone}</span>
                </li>
                <li>
                  <MessageCircle size={17} aria-hidden="true" />
                  <span><small>WhatsApp</small>{empresa.whatsapp}</span>
                </li>
                <li>
                  <Mail size={17} aria-hidden="true" />
                  <span><small>E-mail</small>{empresa.email}</span>
                </li>
                <li>
                  <AtSign size={17} aria-hidden="true" />
                  <span><small>Instagram</small>{empresa.instagram}</span>
                </li>
                <li>
                  <Globe size={17} aria-hidden="true" />
                  <span><small>Site</small>{empresa.site}</span>
                </li>
                <li>
                  <MapPin size={17} aria-hidden="true" />
                  <span>
                    <small>Endereço</small>
                    {enderecoCompleto}
                    <br />
                    CEP {cep}
                    <a
                      className="pn-link pe-mapa"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no mapa <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </span>
                </li>
              </ul>
            </section>

            <section className="pn-card">
              <div className="pn-card-topo">
                <h2>Horário de funcionamento</h2>
              </div>
              <table className="pe-horarios">
                <tbody>
                  {empresa.horarios.map((h) => (
                    <tr key={h.dia} className={h.dia === hoje?.dia ? "hoje" : ""}>
                      <th scope="row">
                        {h.nome}
                        {h.dia === hoje?.dia && <span className="pe-hoje">Hoje</span>}
                      </th>
                      <td>
                        {h.abre} às {h.fecha}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="pn-card pe-privado">
              <div className="pn-card-topo">
                <div>
                  <h2>
                    <Lock size={17} aria-hidden="true" /> Dados cadastrais
                  </h2>
                  <p>Visível apenas para você.</p>
                </div>
              </div>
              <dl className="pe-dados">
                <div>
                  <dt>CNPJ</dt>
                  <dd>{empresa.cnpj}</dd>
                </div>
                <div>
                  <dt>Responsável</dt>
                  <dd>{empresa.responsavel}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </EmpresaLayout>
  );
}
