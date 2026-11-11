// =========================================================
// Serviço de RESERVAS RECEBIDAS PELA EMPRESA
//
// Hoje: reservas de exemplo geradas a partir da data de hoje, mais as reservas
// que o jogador faz pelo app nas quadras ligadas à empresa.
// Com o backend: troque o corpo das funções por chamadas à API, por exemplo:
//   export const listarReservasEmpresa = (filtros) => api.get("/empresa/reservas", { params: filtros });
// =========================================================
import { agendaHoje } from "../data/empresa.js";
import { usuarioDemo } from "../data/usuario.js";
import { isoComDias } from "../utils/formatadores.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { idPublico, listarQuadras } from "./quadrasService.js";
import { cancelarReserva as cancelarReservaJogador, listarReservas } from "./reservasService.js";

const CHAVE = "bahquadras:empresa:reservas";
const DIAS_PASSADOS = 40;
const DIAS_FUTUROS = 14;

export const formasPagamento = ["Pix", "Cartão", "Dinheiro"];

const clientes = [
  "Lucas Ferreira", "Mariana Costa", "Rafael Martins", "Camila Souza", "Bruno Almeida",
  "Fernanda Lima", "Diego Santos", "Juliana Pereira", "Gustavo Ribeiro", "Aline Barbosa",
  "Pelada de Quinta", "Time Amigos do Bairro", "Thiago Oliveira", "Patrícia Rocha", "Leonardo Dias",
];
const quadrasGeradas = [
  { id: "society-1", preco: 80 },
  { id: "society-2", preco: 90 },
  { id: "futsal", preco: 70 },
];

// Gerador de números "aleatórios" fixo: os mesmos dados toda vez que a página abre.
function sorteador(semente) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gerarReservas() {
  const aleatorio = sorteador(42);
  const lista = [];

  for (let d = -DIAS_PASSADOS; d <= DIAS_FUTUROS; d++) {
    if (d === 0) continue; // hoje vem da agenda do dashboard
    const data = isoComDias(d);
    for (const quadra of quadrasGeradas) {
      // ~23% dos horários ocupados: perto das ~160 reservas/mês mostradas no Dashboard.
      const horas = [8, 10, 14, 17, 18, 19, 20, 21].filter(() => aleatorio() < (d > 0 ? 0.25 : 0.23));
      for (const h of horas) {
        const duracao = aleatorio() < 0.2 ? 2 : 1;
        const cancelada = aleatorio() < 0.07;
        lista.push({
          id: `g-${data}-${quadra.id}-${h}`,
          data,
          hora: `${String(h).padStart(2, "0")}:00`,
          duracao,
          quadraId: quadra.id,
          cliente: clientes[Math.floor(aleatorio() * clientes.length)],
          valor: quadra.preco * duracao,
          pagamento: formasPagamento[Math.floor(aleatorio() * formasPagamento.length)],
          pago: d < 0 ? !cancelada : aleatorio() < 0.65,
          status: cancelada ? "cancelada" : d < 0 ? "concluida" : "confirmada",
          origem: aleatorio() < 0.75 ? "app" : "balcao",
        });
      }
    }
  }

  const hoje = isoComDias(0);
  for (const r of agendaHoje) {
    lista.push({ ...r, id: `hoje-${r.id}`, data: hoje, pagamento: "Pix", status: "confirmada", origem: "app" });
  }
  return lista;
}

const reservasGeradas = gerarReservas();
const lerAlteracoes = () => lerSalvo(CHAVE) ?? {};

/** Reservas do jogador (feitas pelo app) em quadras desta empresa. */
async function reservasDoApp() {
  const [doJogador, quadras] = await Promise.all([listarReservas(), listarQuadras()]);
  return doJogador.flatMap((r) => {
    const quadra = quadras.find((q) => idPublico(q) === r.quadraId);
    if (!quadra) return [];
    return [{
      id: `app-${r.id}`,
      idJogador: r.id,
      data: r.data,
      hora: r.hora,
      duracao: r.duracao,
      quadraId: quadra.id,
      cliente: usuarioDemo.nome,
      valor: r.valor,
      pagamento: r.pagamento ?? "Pix",
      pago: false,
      status: r.status,
      origem: "app",
    }];
  });
}

/* ---------------- Funções públicas ---------------- */

export async function listarReservasEmpresa() {
  const alteracoes = lerAlteracoes();
  const lista = [...reservasGeradas, ...(await reservasDoApp())].map((r) => ({ ...r, ...alteracoes[r.id] }));
  return responder(lista);
}

function alterar(id, mudanca) {
  const alteracoes = lerAlteracoes();
  salvar(CHAVE, { ...alteracoes, [id]: { ...alteracoes[id], ...mudanca } });
}

export function marcarComoPaga(id) {
  alterar(id, { pago: true });
  return responder({ id, pago: true }, 300);
}

export async function cancelarReservaEmpresa(reserva) {
  alterar(reserva.id, { status: "cancelada" });
  // Reserva feita pelo jogador no app: cancela também do lado dele.
  if (reserva.idJogador) await cancelarReservaJogador(reserva.idJogador);
  return responder({ id: reserva.id, status: "cancelada" }, 300);
}

/* ---------------- Ajudantes ---------------- */

export const inicioReserva = (r) => new Date(`${r.data}T${r.hora}:00`);
export const fimReserva = (r) => `${String(Number(r.hora.slice(0, 2)) + r.duracao).padStart(2, "0")}:00`;

/** Situação para exibir: confirmada, em andamento, concluída, cancelada. */
export function situacaoReserva(r, agora = new Date()) {
  if (r.status === "cancelada") return "cancelada";
  const inicio = inicioReserva(r);
  const fim = new Date(inicio.getTime() + r.duracao * 3_600_000);
  if (fim <= agora) return "concluida";
  if (inicio <= agora) return "andamento";
  return "confirmada";
}
