import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarDays, CircleCheck, CircleX, Clock, Heart, MapPin, Star, Trophy } from "lucide-react";
import { quadrasPublicas } from "../../services/catalogoService.js";
import { fimDaReserva } from "../../services/reservasService.js";
import { formatarData, formatarPreco, paraData, tempoRelativo } from "../../utils/formatadores.js";
import { GradeFavoritas } from "./SecaoFavoritas.jsx";

const horaFim = fimDaReserva;
const linkPerfil = (secao) => `/usuario/perfil?secao=${secao}`;
const mesCurto = (iso) => paraData(iso).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

export default function SecaoInicio({ usuario, favoritos, resumo, onRemoverFavorito }) {
  const { proximas, concluidas, horasJogadas } = resumo;
  const proxima = proximas[0];
  const listaFavoritas = quadrasPublicas().filter((q) => favoritos.includes(q.id)).slice(0, 3);

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
