// =========================================================
// Serviço de RESERVAS DO JOGADOR
//
// Hoje: as reservas de exemplo (data/reservas.js) + as que o jogador cria
// ou cancela, guardadas no navegador.
// Com o backend: troque o corpo das funções por chamadas à API.
// =========================================================
import { reservas as reservasExemplo } from "../data/reservas.js";
import { lerSalvo, responder, salvar } from "./armazenamento.js";
import { somarMinutos } from "../utils/formatadores.js";

const CHAVE = "bahquadras:usuario:reservas";

// Guardamos só o que mudou: reservas novas e ids cancelados.
// Assim as reservas de exemplo continuam com datas relativas a hoje.
const lerAlteracoes = () => lerSalvo(CHAVE) ?? { criadas: [], canceladas: [] };

function montarLista() {
  const { criadas, canceladas } = lerAlteracoes();
  return [...reservasExemplo, ...criadas].map((r) =>
    canceladas.includes(r.id) ? { ...r, status: "cancelada" } : r
  );
}

/* ---------------- Funções públicas ---------------- */

export function listarReservas() {
  return responder(montarLista());
}

export function criarReserva(dados) {
  const alteracoes = lerAlteracoes();
  const nova = { ...dados, id: Date.now(), status: "confirmada", criadaEm: new Date().toISOString() };
  salvar(CHAVE, { ...alteracoes, criadas: [...alteracoes.criadas, nova] });
  return responder(nova, 600);
}

export function cancelarReserva(id) {
  const alteracoes = lerAlteracoes();
  salvar(CHAVE, { ...alteracoes, canceladas: [...new Set([...alteracoes.canceladas, id])] });
  return responder({ id, status: "cancelada" }, 400);
}

/**
 * Horários já ocupados de uma quadra em uma data.
 * Junta as reservas do jogador com algumas reservas "de outras pessoas"
 * geradas de forma fixa para a demonstração ficar realista.
 */
export function horariosOcupados(quadraId, data) {
  const doJogador = montarLista()
    .filter((r) => r.quadraId === quadraId && r.data === data && r.status === "confirmada")
    .flatMap((r) =>
      Array.from({ length: r.duracao }, (_, i) => `${String(Number(r.hora.slice(0, 2)) + i).padStart(2, "0")}:00`)
    );

  let semente = 0;
  for (const c of `${quadraId}${data}`) semente = (semente * 31 + c.charCodeAt(0)) % 9973;
  const deOutros = ["08:00", "10:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00"].filter(
    (_, i) => (semente >> i) % 3 === 0
  );

  return responder([...new Set([...doJogador, ...deOutros])], 150);
}

/* ---------------- Ajudantes de exibição ---------------- */

export const inicioDaReserva = (r) => new Date(`${r.data}T${r.hora}:00`);
export const fimDaReserva = (r) =>
  r.baterias
    ? somarMinutos(r.hora, r.baterias * (r.minutosBateria ?? 15))
    : `${String(Number(r.hora.slice(0, 2)) + r.duracao).padStart(2, "0")}:00`;

/** Separa a lista em próximas, histórico e números do jogador. */
export function separarReservas(lista) {
  const agora = new Date();
  const proximas = lista
    .filter((r) => r.status === "confirmada" && inicioDaReserva(r) >= agora)
    .sort((a, b) => inicioDaReserva(a) - inicioDaReserva(b));
  const historico = lista
    .filter((r) => !proximas.includes(r))
    .map((r) => (r.status === "confirmada" ? { ...r, status: "concluida" } : r))
    .sort((a, b) => inicioDaReserva(b) - inicioDaReserva(a));
  const concluidas = historico.filter((r) => r.status === "concluida");
  const horasJogadas = concluidas.reduce((soma, r) => soma + r.duracao, 0);
  return { proximas, historico, concluidas, horasJogadas };
}
