import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlarmClock,
  Bell,
  BellOff,
  CalendarCheck,
  CalendarX,
  CheckCheck,
  CircleAlert,
  Info,
  Settings,
  Star,
  Wallet,
} from "lucide-react";
import { useDados } from "../hooks/useDados.js";
import "../css/Notificacoes.css";
import Esqueleto from "./Esqueleto.jsx";

const tipos = {
  reserva: { icone: CalendarCheck, classe: "reserva" },
  cancelamento: { icone: CalendarX, classe: "cancelamento" },
  pagamento: { icone: CircleAlert, classe: "pagamento" },
  avaliacao: { icone: Star, classe: "avaliacao" },
  financeiro: { icone: Wallet, classe: "financeiro" },
  sistema: { icone: Info, classe: "sistema" },
  lembrete: { icone: AlarmClock, classe: "lembrete" },
};

function quandoFoi(iso) {
  const minutos = Math.round((Date.now() - new Date(iso)) / 60_000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}

/**
 * Tela de notificações usada pela empresa e pelo jogador.
 * - Layout: EmpresaLayout ou UsuarioLayout
 * - servico: { listarNotificacoes, marcarComoLida, marcarTodasComoLidas }
 * - ajustes: link opcional para as preferências de aviso
 */
export default function ListaNotificacoes({ Layout, servico, ajustes }) {
  const { listarNotificacoes, marcarComoLida, marcarTodasComoLidas } = servico;
  const { dados, carregando, recarregar } = useDados(listarNotificacoes);
  const [filtro, setFiltro] = useState("todas");

  const lista = dados ?? [];
  const naoLidas = lista.filter((n) => !n.lida).length;
  const visiveis = filtro === "nao-lidas" ? lista.filter((n) => !n.lida) : lista;

  async function lerTodas() {
    await marcarTodasComoLidas();
    recarregar();
  }

  return (
    <Layout
      titulo="Notificações"
      subtitulo={naoLidas ? `${naoLidas} ${naoLidas === 1 ? "não lida" : "não lidas"}` : "Tudo em dia"}
      acoes={
        <>
          {ajustes && (
            <Link to={ajustes} className="pn-botao pn-botao-contorno">
              <Settings size={17} aria-hidden="true" /> Preferências
            </Link>
          )}
          <button type="button" className="pn-botao pn-botao-contorno" onClick={lerTodas} disabled={!naoLidas}>
            <CheckCheck size={17} aria-hidden="true" /> Marcar todas como lidas
          </button>
        </>
      }
    >
      <div className="pn-pilha">
        <div className="pn-chips" role="group" aria-label="Filtrar notificações">
          <button type="button" className="pn-chip" aria-pressed={filtro === "todas"} onClick={() => setFiltro("todas")}>
            Todas
          </button>
          <button type="button" className="pn-chip" aria-pressed={filtro === "nao-lidas"} onClick={() => setFiltro("nao-lidas")}>
            Não lidas {naoLidas > 0 && <small className="no-contagem">{naoLidas}</small>}
          </button>
        </div>

        {carregando && !dados ? (
          <Esqueleto tipo="lista" quantidade={5} rotulo="Carregando notificações..." />
        ) : visiveis.length === 0 ? (
          <div className="pn-vazio">
            <BellOff size={40} aria-hidden="true" />
            <h3>Nenhuma notificação não lida</h3>
            <p>Você está em dia com tudo.</p>
          </div>
        ) : (
          <ul className="pn-card no-lista">
            {visiveis.map((n) => {
              const tipo = tipos[n.tipo] ?? { icone: Bell, classe: "sistema" };
              return (
                <li key={n.id} className={`no-item ${n.lida ? "" : "nao-lida"}`}>
                  <span className={`no-icone ${tipo.classe}`} aria-hidden="true">
                    <tipo.icone size={18} />
                  </span>
                  <div className="no-texto">
                    <strong>
                      {!n.lida && <span className="pn-sr">Não lida: </span>}
                      {n.titulo}
                    </strong>
                    <p>{n.texto}</p>
                    <time dateTime={n.quando}>{quandoFoi(n.quando)}</time>
                  </div>
                  <div className="no-acoes">
                    <Link to={n.link} className="pn-link" onClick={() => !n.lida && marcarComoLida(n.id)} aria-label={`Ver: ${n.titulo}`}>
                      Ver
                    </Link>
                    {!n.lida && (
                      <button
                        type="button"
                        className="no-marcar"
                        onClick={async () => {
                          await marcarComoLida(n.id);
                          recarregar();
                        }}
                        aria-label={`Marcar "${n.titulo}" como lida`}
                        title="Marcar como lida"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
