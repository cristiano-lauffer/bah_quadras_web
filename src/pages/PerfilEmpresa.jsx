import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import Toast from "../components/Toast.jsx";
import { quadrasEmpresa } from "../data/empresa.js";
import { empresaAtual, obterEmpresa } from "../services/empresaService.js";
import { contarSemResposta, resumoAvaliacoesDaEmpresa } from "../services/respostasService.js";
import { useDados } from "../hooks/useDados.js";
import { idPublico, listarQuadras } from "../services/quadrasService.js";
import { formatarData, formatarNota, formatarPreco, foto as fotoTamanho } from "../utils/formatadores.js";
import "../css/PerfilEmpresa.css";

const paraMinutos = (h) => (h === "00:00" ? 24 * 60 : Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5)));

// Itens que deixam o perfil mais completo para os jogadores.
function montarChecklist(empresa) {
  return [
    { texto: "Logo e foto de capa", feito: Boolean(empresa.logo && empresa.capa) },
    { texto: "Descrição da empresa", feito: empresa.descricao.length > 50 },
    { texto: "Pelo menos 4 fotos", feito: empresa.fotos.length >= 4 },
    { texto: "Horário de funcionamento", feito: empresa.horarios.some((h) => h.abre) },
    { texto: "Redes sociais", feito: Boolean(empresa.instagram) },
    { texto: "CNPJ verificado", feito: empresa.verificada },
    { texto: "Vídeo do espaço", feito: false },
    { texto: "Responder às avaliações", feito: contarSemResposta() === 0 },
  ];
}

function situacaoAgora(empresa) {
  const agora = new Date();
  const hoje = empresa.horarios.find((h) => h.dia === agora.getDay());
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  const aberto = Boolean(hoje?.abre) && minutos >= paraMinutos(hoje.abre) && minutos < paraMinutos(hoje.fecha);
  return { aberto, hoje };
}

export default function PerfilEmpresa() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(location.state?.aviso ?? "");

  // Dados salvos pelo "Editar perfil" (os dados atuais evitam a tela "piscar").
  const { dados: empresaSalva } = useDados(obterEmpresa);
  const empresa = empresaSalva ?? empresaAtual();
  const { rua, numero, bairro, cidade, estado, cep } = empresa.endereco;
  const enderecoCompleto = `${rua}, ${numero}${bairro ? ` - ${bairro}` : ""}, ${cidade}/${estado}`;
  const checklist = montarChecklist(empresa);
  const completude = Math.round((checklist.filter((c) => c.feito).length / checklist.length) * 100);

  // Só as quadras que os jogadores podem ver (desativadas ficam de fora).
  const { dados } = useDados(listarQuadras);
  const quadrasVisiveis = (dados ?? quadrasEmpresa).filter((q) => q.status !== "inativa");
  const { aberto, hoje } = situacaoAgora(empresa);
  // Nota calculada a partir das avaliações de todas as quadras da empresa.
  const avaliacoes = resumoAvaliacoesDaEmpresa();

  function fecharToast() {
    setToast("");
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }

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
          <img {...fotoTamanho(empresa.capa, 1100)} alt="" className="pe-capa-imagem" />
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
                  {avaliacoes.total ? (
                    <Link to="/empresa/avaliacoes" className="pe-meta-link">
                      <strong>{formatarNota(avaliacoes.media)}</strong>
                      <span>
                        ({avaliacoes.total} {avaliacoes.total === 1 ? "avaliação" : "avaliações"})
                      </span>
                    </Link>
                  ) : (
                    <span>Ainda sem avaliações</span>
                  )}
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
                    <img {...fotoTamanho(foto, 260)} alt={`Foto ${i + 1} do espaço`} loading="lazy" />
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
                    <img {...fotoTamanho(q.imagem, 120)} alt="" loading="lazy" />
                    <div>
                      <span className="pe-quadra-modalidade">{q.modalidade}</span>
                      <strong>
                        <Link to={`/quadra/${idPublico(q)}`}>{q.nome}</Link>
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
                        {h.abre ? `${h.abre} às ${h.fecha}` : "Fechado"}
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
      <Toast mensagem={toast} onFechar={fecharToast} />
    </EmpresaLayout>
  );
}
