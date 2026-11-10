import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Camera,
  CircleCheck,
  CircleX,
  Clock,
  Heart,
  MapPin,
  PencilLine,
  Plus,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { modalidades, quadras } from "../data/quadras.js";
import { usuarioDemo } from "../data/usuario.js";
import { fimDaReserva, listarReservas, separarReservas } from "../services/reservasService.js";
import {
  formatarData,
  formatarNota,
  formatarPreco,
  iniciais,
  paraData,
  semAvaliacoes,
  tempoRelativo,
} from "../utils/formatadores.js";
import { emailValido, mascaraTelefone, telefoneValido } from "../utils/mascaras.js";
import "../css/PerfilUsuario.css";

// As reservas ficam na página própria (/usuario/reservas).
const secoes = {
  inicio: "Início",
  favoritas: "Quadras favoritas",
  dados: "Meus dados",
  configuracoes: "Configurações",
};

const horaFim = fimDaReserva;
const linkPerfil = (secao) => `/usuario/perfil?secao=${secao}`;
const mesCurto = (iso) => paraData(iso).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

export default function PerfilUsuario() {
  const [searchParams] = useSearchParams();
  const secao = secoes[searchParams.get("secao")] ? searchParams.get("secao") : "inicio";

  const { dados: listaReservas } = useDados(listarReservas);
  const resumo = separarReservas(listaReservas ?? []);

  const [usuario, setUsuario] = useState(usuarioDemo);
  const [favoritos, setFavoritos] = useState(usuarioDemo.favoritos);
  const [foto, setFoto] = useState("");
  const [toast, setToast] = useState("");

  // Libera a URL temporária da foto quando ela muda ou a página fecha.
  useEffect(() => () => foto && URL.revokeObjectURL(foto), [foto]);

  const primeiroNome = usuario.nome.split(" ")[0];
  const avatar = foto ? <img src={foto} alt="" /> : iniciais(usuario.nome);

  function removerFavorito(id) {
    setFavoritos((atual) => atual.filter((f) => f !== id));
    setToast("Quadra removida dos favoritos.");
  }

  return (
    <UsuarioLayout
      proximasReservas={resumo.proximas.length}
      perfil={{ nome: usuario.nome, subtitulo: usuario.email, avatar }}
      titulo={secao === "inicio" ? `Olá, ${primeiroNome}!` : secoes[secao]}
      subtitulo={secao === "inicio" ? "Bom te ver por aqui. Bora marcar o próximo jogo?" : undefined}
      acoes={
        <Link to="/#quadras" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Nova reserva
        </Link>
      }
    >
      {secao === "inicio" && (
        <SecaoInicio usuario={usuario} favoritos={favoritos} resumo={resumo} onRemoverFavorito={removerFavorito} />
      )}
      {secao === "favoritas" && <SecaoFavoritas favoritos={favoritos} onRemover={removerFavorito} />}
      {secao === "dados" && (
        <SecaoDados
          usuario={usuario}
          avatar={avatar}
          onFoto={(arquivo) => {
            setFoto(URL.createObjectURL(arquivo));
            setToast("Foto atualizada nesta demonstração.");
          }}
          onSalvar={(dados) => {
            setUsuario(dados);
            setToast("Seus dados foram atualizados!");
          }}
        />
      )}
      {secao === "configuracoes" && <SecaoConfiguracoes onAviso={setToast} />}

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </UsuarioLayout>
  );
}

/* ================================================================
   INÍCIO
   ================================================================ */

function SecaoInicio({ usuario, favoritos, resumo, onRemoverFavorito }) {
  const { proximas, concluidas, horasJogadas } = resumo;
  const proxima = proximas[0];
  const listaFavoritas = quadras.filter((q) => favoritos.includes(q.id)).slice(0, 3);

  const estatisticas = [
    { icone: CalendarCheck, valor: proximas.length, rotulo: "Próximas reservas" },
    { icone: Trophy, valor: concluidas.length, rotulo: "Jogos realizados" },
    { icone: Clock, valor: `${horasJogadas}h`, rotulo: "Horas em quadra" },
    { icone: Heart, valor: favoritos.length, rotulo: "Quadras favoritas" },
  ];

  return (
    <div className="pn-pilha">
      {proxima ? (
        <CardProximaPartida reserva={proxima} />
      ) : (
        <div className="pn-vazio">
          <CalendarDays size={40} aria-hidden="true" />
          <h3>Nenhuma partida marcada</h3>
          <p>Encontre uma quadra e garanta seu próximo jogo.</p>
          <Link to="/#quadras" className="pn-botao">Encontrar quadras</Link>
        </div>
      )}

      <section className="pn-kpis" aria-label="Seus números">
        {estatisticas.map(({ icone: Icone, valor, rotulo }) => (
          <article key={rotulo} className="pn-kpi">
            <div className="pn-kpi-topo">
              {rotulo}
              <span className="pn-kpi-icone" aria-hidden="true"><Icone size={18} /></span>
            </div>
            <strong>{valor}</strong>
          </article>
        ))}
      </section>

      <div className="pn-grade">
        <section className="pn-card">
          <div className="pn-card-topo">
            <div>
              <h2>Agenda</h2>
              <p>Suas próximas reservas</p>
            </div>
            <Link to={"/usuario/reservas"} className="pn-link">
              Ver todas <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {proximas.length ? (
            <ul className="pu-lista">
              {proximas.map((r) => (
                <LinhaReserva key={r.id} reserva={r} />
              ))}
            </ul>
          ) : (
            <p className="pn-texto-suave">Nenhuma reserva futura.</p>
          )}
        </section>

        <div className="pn-pilha">
          <section className="pn-card">
            <div className="pn-card-topo">
              <div>
                <h2>Avalie onde jogou</h2>
                <p>Sua opinião ajuda outros jogadores.</p>
              </div>
            </div>
            {concluidas.length ? (
              <ul className="pu-pendentes">
                {concluidas.map((r) => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.quadra}</strong>
                      <span>{tempoRelativo(r.data)}</span>
                    </div>
                    <Link to={`/avaliacoes/${r.quadraId}?escrever=1`} className="pn-botao pn-botao-contorno">
                      <Star size={15} aria-hidden="true" /> Avaliar
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pn-texto-suave">Nada para avaliar por enquanto.</p>
            )}
          </section>

          <section className="pn-card">
            <div className="pn-card-topo">
              <h2>Seus esportes</h2>
              <Link to={linkPerfil("dados")} className="pn-link">Editar</Link>
            </div>
            <ul className="pn-chips pu-lista-limpa">
              {usuario.esportes.map((m) => (
                <li key={m} className="pn-chip marcado">{m}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>Suas favoritas</h2>
            <p>Atalho para as quadras que você mais curte</p>
          </div>
          <Link to={linkPerfil("favoritas")} className="pn-link">
            Ver todas <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {listaFavoritas.length ? (
          <GradeFavoritas lista={listaFavoritas} onRemover={onRemoverFavorito} />
        ) : (
          <p className="pn-texto-suave">Toque no coração das quadras para guardá-las aqui.</p>
        )}
      </section>
    </div>
  );
}

function CardProximaPartida({ reserva: r }) {
  const data = paraData(r.data);
  return (
    <article className="pu-proxima">
      <div className="pu-proxima-data" aria-hidden="true">
        <span>{mesCurto(r.data)}</span>
        <strong>{data.getDate()}</strong>
        <span>{data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
      </div>
      <div className="pu-proxima-info">
        <span className="pu-proxima-quando">Sua próxima partida é {tempoRelativo(r.data)}</span>
        <h2>{r.quadra}</h2>
        <p>
          <span><Trophy size={15} aria-hidden="true" /> {r.modalidade}</span>
          <span><Clock size={15} aria-hidden="true" /> {r.hora} às {horaFim(r)}</span>
          <span><MapPin size={15} aria-hidden="true" /> {r.endereco}</span>
        </p>
      </div>
      <div className="pu-proxima-acoes">
        <strong>{formatarPreco(r.valor, 2)}</strong>
        <Link to={`/quadra/${r.quadraId}`} className="pn-botao pn-botao-claro">
          Ver quadra
        </Link>
      </div>
    </article>
  );
}

const statusReserva = {
  confirmada: { texto: "Confirmada", classe: "ok", icone: CircleCheck },
  concluida: { texto: "Concluída", classe: "info", icone: Trophy },
  cancelada: { texto: "Cancelada", classe: "erro", icone: CircleX },
};

function LinhaReserva({ reserva: r, comAvaliar = false }) {
  const status = statusReserva[r.status];
  return (
    <li className="pu-reserva">
      <div className="pu-reserva-data" aria-hidden="true">
        <strong>{paraData(r.data).getDate()}</strong>
        <span>{mesCurto(r.data)}</span>
      </div>
      <div className="pu-reserva-info">
        <strong>{r.quadra}</strong>
        <span>
          {formatarData(r.data, { weekday: "short", day: "2-digit", month: "short" })} · {r.hora} às {horaFim(r)}
        </span>
      </div>
      <span className={`pn-status ${status.classe}`}>
        <status.icone size={13} aria-hidden="true" />
        {status.texto}
      </span>
      <div className="pu-reserva-acao">
        {comAvaliar && r.status === "concluida" ? (
          <Link to={`/avaliacoes/${r.quadraId}?escrever=1`} className="pn-link">
            <Star size={15} aria-hidden="true" /> Avaliar
          </Link>
        ) : (
          <span className="pn-texto-suave">{formatarPreco(r.valor)}</span>
        )}
      </div>
    </li>
  );
}

/* ================================================================
   FAVORITAS
   ================================================================ */

function GradeFavoritas({ lista, onRemover }) {
  return (
    <ul className="pu-favoritas">
      {lista.map((q) => (
        <li key={q.id} className="pu-favorita">
          <img src={q.imagens[0]} alt="" loading="lazy" />
          <button
            type="button"
            className="pu-favorita-remover"
            onClick={() => onRemover(q.id)}
            aria-label={`Remover ${q.nome} dos favoritos`}
          >
            <Heart size={17} />
          </button>
          <div className="pu-favorita-corpo">
            <span className="pu-favorita-tag">{q.modalidade}</span>
            <h3>
              <Link to={`/quadra/${q.id}`}>{q.nome}</Link>
            </h3>
            <p>
              <span>
                {semAvaliacoes(q) ? "Nova" : <><Star size={14} aria-hidden="true" /> {formatarNota(q.avaliacao)}</>}
              </span>
              <span>{q.bairro}</span>
              <strong>{formatarPreco(q.preco)}/h</strong>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SecaoFavoritas({ favoritos, onRemover }) {
  const lista = quadras.filter((q) => favoritos.includes(q.id));

  if (!lista.length) {
    return (
      <div className="pn-vazio">
        <Heart size={40} aria-hidden="true" />
        <h3>Nenhuma quadra favorita</h3>
        <p>Toque no coração das quadras para guardar as suas preferidas aqui.</p>
        <Link to="/#quadras" className="pn-botao">Explorar quadras</Link>
      </div>
    );
  }

  return <GradeFavoritas lista={lista} onRemover={onRemover} />;
}

/* ================================================================
   MEUS DADOS
   ================================================================ */

const camposDados = [
  { name: "nome", rotulo: "Nome completo", autoComplete: "name" },
  { name: "email", rotulo: "E-mail", type: "email", autoComplete: "email" },
  { name: "telefone", rotulo: "Celular", type: "tel", autoComplete: "tel", inputMode: "numeric" },
  { name: "cidade", rotulo: "Cidade", autoComplete: "address-level2" },
];

function SecaoDados({ usuario, avatar, onFoto, onSalvar }) {
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
                {modalidades.map((m) => (
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

/* ================================================================
   CONFIGURAÇÕES
   ================================================================ */

const opcoesNotificacao = [
  { id: "lembrete", titulo: "Lembrete antes do jogo", texto: "Receba um aviso no WhatsApp 2 horas antes da reserva." },
  { id: "confirmacao", titulo: "Confirmações por e-mail", texto: "Comprovante sempre que uma reserva for feita ou cancelada." },
  { id: "novidades", titulo: "Novidades e promoções", texto: "Quadras novas e horários com desconto perto de você." },
];

function SecaoConfiguracoes({ onAviso }) {
  const [notificacoes, setNotificacoes] = useState({ lembrete: true, confirmacao: true, novidades: false });
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });
  const [erroSenha, setErroSenha] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function salvarSenha(e) {
    e.preventDefault();
    if (!senha.atual) return setErroSenha("Informe sua senha atual.");
    if (senha.nova.length < 8) return setErroSenha("A nova senha precisa ter pelo menos 8 caracteres.");
    if (senha.nova !== senha.confirmar) return setErroSenha("As senhas não coincidem.");
    setErroSenha("");
    setSenha({ atual: "", nova: "", confirmar: "" });
    setAlterandoSenha(false);
    onAviso("Senha alterada (demonstração).");
  }

  return (
    <div className="pn-pilha">
      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>Notificações</h2>
            <p>Escolha como quer ser avisado sobre suas reservas.</p>
          </div>
        </div>
        <ul className="pu-opcoes">
          {opcoesNotificacao.map(({ id, titulo, texto }) => (
            <li key={id}>
              <div>
                <strong id={`notif-${id}`}>{titulo}</strong>
                <p>{texto}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificacoes[id]}
                aria-labelledby={`notif-${id}`}
                className="pn-switch"
                onClick={() => setNotificacoes((n) => ({ ...n, [id]: !n[id] }))}
              >
                <span />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>
              <ShieldCheck size={19} aria-hidden="true" /> Senha e segurança
            </h2>
            <p>Recomendamos trocar a senha periodicamente.</p>
          </div>
          {!alterandoSenha && (
            <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setAlterandoSenha(true)}>
              Alterar senha
            </button>
          )}
        </div>

        {alterandoSenha && (
          <form className="pn-form" onSubmit={salvarSenha} noValidate>
            <div className="pn-form-grade pu-grade-3">
              {[
                ["atual", "Senha atual", "current-password"],
                ["nova", "Nova senha", "new-password"],
                ["confirmar", "Confirmar nova senha", "new-password"],
              ].map(([campo, rotulo, auto]) => (
                <div key={campo} className="pn-campo">
                  <label htmlFor={`senha-${campo}`}>{rotulo}</label>
                  <input
                    id={`senha-${campo}`}
                    type="password"
                    autoComplete={auto}
                    value={senha[campo]}
                    onChange={(e) => setSenha((s) => ({ ...s, [campo]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {erroSenha && <p className="pn-erro" role="alert">{erroSenha}</p>}
            <div className="pn-form-acoes">
              <button
                type="button"
                className="pn-botao pn-botao-contorno"
                onClick={() => {
                  setAlterandoSenha(false);
                  setErroSenha("");
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="pn-botao">
                Salvar nova senha
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="pn-card pu-perigo">
        <div className="pn-card-topo">
          <div>
            <h2>Excluir conta</h2>
            <p>Suas reservas futuras serão canceladas e seus dados apagados. Não dá para desfazer.</p>
          </div>
          {!confirmandoExclusao ? (
            <button type="button" className="pn-botao pn-botao-perigo" onClick={() => setConfirmandoExclusao(true)}>
              Excluir conta
            </button>
          ) : (
            <div className="pu-perigo-confirmar" role="alert">
              <span>Tem certeza?</span>
              <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setConfirmandoExclusao(false)}>
                Não
              </button>
              <button
                type="button"
                className="pn-botao pn-botao-perigo"
                onClick={() => {
                  setConfirmandoExclusao(false);
                  onAviso("Demonstração: nenhuma conta foi excluída.");
                }}
              >
                Sim, excluir
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
