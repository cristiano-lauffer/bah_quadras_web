// =========================================================
// Serviço de NOTIFICAÇÕES DO JOGADOR
//
// Hoje: os avisos são montados a partir das reservas do jogador
// (confirmada, lembrete do jogo, cancelada, "como foi o jogo?").
// O que foi lido fica salvo no navegador.
// Com o backend: troque por chamadas à API (ou por notificações em tempo real).
// Tem as mesmas funções do notificacoesService (empresa), então as duas
// telas usam o mesmo componente <ListaNotificacoes />.
// =========================================================
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { fimDaReserva, inicioDaReserva, reservasAtuais } from "./reservasService.js";
import { descreverDuracao, diasAte, formatarData } from "../utils/formatadores.js";
import { jaAvaliou } from "./avaliacoesService.js";

const CHAVE = "bahquadras:usuario:notificacoes-lidas";
const HORA = 3_600_000;
const DIA = 24 * HORA;

const quandoDia = (r) => formatarData(r.data, { weekday: "short", day: "2-digit", month: "2-digit" });
const antesDeAgora = (data, agora, folga) => new Date(Math.min(data.getTime(), agora.getTime() - folga));

function gerar() {
  const agora = new Date();
  const hoje8h = new Date(agora);
  hoje8h.setHours(8, 0, 0, 0);
  const lista = [];

  reservasAtuais().forEach((r, i) => {
    const inicio = inicioDaReserva(r);
    const quando = `${quandoDia(r)} às ${r.hora}`;
    const futura = inicio > agora;

    if (r.status === "cancelada") {
      lista.push({
        id: `cancelada-${r.id}`,
        tipo: "cancelamento",
        titulo: "Reserva cancelada",
        texto: `Sua reserva em ${r.quadra} (${quando}) foi cancelada.`,
        quando: r.canceladaEm ?? antesDeAgora(new Date(inicio - DIA), agora, HORA).toISOString(),
        link: "/usuario/reservas",
      });
      return;
    }

    // Reserva confirmada (todas as que não foram canceladas um dia foram confirmadas).
    lista.push({
      id: `confirmada-${r.id}`,
      tipo: "reserva",
      titulo: "Reserva confirmada",
      texto: `${r.quadra} · ${quando} (${descreverDuracao(r)}). Pagamento no local.`,
      quando: r.criadaEm ?? antesDeAgora(new Date(inicio - 4 * DIA), agora, (i + 1) * HORA).toISOString(),
      link: "/usuario/reservas",
    });

    // Reserva remarcada.
    if (r.remarcadaEm && r.anterior) {
      lista.push({
        id: `remarcada-${r.id}-${r.remarcadaEm}`,
        tipo: "reserva",
        titulo: "Reserva remarcada",
        texto: `${r.quadra}: de ${formatarData(r.anterior.data, { day: "2-digit", month: "2-digit" })} às ${r.anterior.hora} para ${quando}.`,
        quando: r.remarcadaEm,
        link: "/usuario/reservas",
      });
    }

    // Lembrete para jogos de hoje até daqui a 2 dias.
    const dias = diasAte(r.data);
    if (futura && dias <= 2) {
      const quandoTexto = dias === 0 ? "hoje" : dias === 1 ? "amanhã" : "depois de amanhã";
      lista.push({
        id: `lembrete-${r.id}-${r.data}-${dias}`,
        tipo: "lembrete",
        titulo: `Seu jogo é ${quandoTexto}!`,
        texto: `${r.quadra}, às ${r.hora}. Chegue uns minutinhos antes${r.endereco ? ` · ${r.endereco}` : ""}.`,
        quando: antesDeAgora(hoje8h, agora, 60_000).toISOString(),
        link: "/usuario/reservas",
      });
    }

    // Jogo dos últimos 30 dias: convite para avaliar.
    // (some quando o jogador já avaliou a quadra)
    if (!futura && dias >= -30 && !jaAvaliou(r.quadraId)) {
      const [h, m] = fimDaReserva(r).split(":");
      const fim = new Date(inicio);
      fim.setHours(Number(h), Number(m), 0, 0);
      lista.push({
        id: `avaliar-${r.id}`,
        tipo: "avaliacao",
        titulo: "Como foi o jogo?",
        texto: `Conte para a galera o que achou de ${r.quadra}. Leva menos de um minuto.`,
        quando: antesDeAgora(fim, agora, 60_000).toISOString(),
        link: `/avaliacoes/${r.quadraId}?escrever=1`,
      });
    }
  });

  lista.push({
    id: "boas-vindas",
    tipo: "sistema",
    titulo: "Bem-vindo ao Bah Quadras!",
    texto: "Favorite as quadras que você mais gosta para encontrá-las rápido no seu perfil.",
    quando: new Date(agora - 45 * DIA).toISOString(),
    link: "/usuario/perfil?secao=favoritas",
  });

  return lista.sort((a, b) => b.quando.localeCompare(a.quando));
}

// Avisos com mais de 7 dias já contam como lidos.
const lidas = () => lerSalvo(CHAVE) ?? [];
const estaLida = (n, jaLidas) => jaLidas.includes(n.id) || Date.now() - new Date(n.quando) > 7 * DIA;

export function listarNotificacoes() {
  const jaLidas = lidas();
  return responder(gerar().map((n) => ({ ...n, lida: estaLida(n, jaLidas) })));
}

/** Quantidade de não lidas (leitura imediata, usada no menu). */
export function contarNaoLidas() {
  const jaLidas = lidas();
  return gerar().filter((n) => !estaLida(n, jaLidas)).length;
}

export function marcarComoLida(id) {
  salvar(CHAVE, [...new Set([...lidas(), id])]);
  return responder({ id, lida: true }, 100);
}

export function marcarTodasComoLidas() {
  salvar(CHAVE, [...new Set([...lidas(), ...gerar().map((n) => n.id)])]);
  return responder(true, 200);
}
