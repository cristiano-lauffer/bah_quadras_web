// Adicionar reservas ao calendário e compartilhar no WhatsApp.
// Tudo acontece no navegador: nada é enviado para o servidor.

const doisDigitos = (n) => String(n).padStart(2, "0");

/** Date -> "20261112T220000Z" (formato de data dos calendários, em UTC). */
function paraUtc(data) {
  return (
    `${data.getUTCFullYear()}${doisDigitos(data.getUTCMonth() + 1)}${doisDigitos(data.getUTCDate())}` +
    `T${doisDigitos(data.getUTCHours())}${doisDigitos(data.getUTCMinutes())}00Z`
  );
}

// Textos dentro do .ics precisam de vírgula, ponto e vírgula e quebras de linha "escapados".
const escaparIcs = (texto = "") =>
  texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/**
 * Monta o evento de uma reserva.
 * - reserva: { data: "2026-11-12", hora: "19:00", duracao, baterias?, minutosBateria?, quadra, endereco, id }
 */
export function eventoDaReserva(reserva) {
  const inicio = new Date(`${reserva.data}T${reserva.hora}:00`);
  const minutos = reserva.baterias ? reserva.baterias * (reserva.minutosBateria ?? 15) : reserva.duracao * 60;
  const fim = new Date(inicio.getTime() + minutos * 60_000);
  return {
    id: `reserva-${reserva.id}@bahquadras`,
    titulo: `Jogo na ${reserva.quadra}`,
    descricao: `Reserva feita pelo Bah Quadras.${reserva.pagamento ? ` Pagamento: ${reserva.pagamento} no local.` : ""}`,
    local: reserva.endereco ?? "",
    inicio,
    fim,
  };
}

/** Conteúdo do arquivo .ics (abre no Google Agenda, Apple Calendário, Outlook...). */
export function gerarIcs(evento) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bah Quadras//Reservas//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${evento.id}`,
    `DTSTAMP:${paraUtc(new Date())}`,
    `DTSTART:${paraUtc(evento.inicio)}`,
    `DTEND:${paraUtc(evento.fim)}`,
    `SUMMARY:${escaparIcs(evento.titulo)}`,
    `DESCRIPTION:${escaparIcs(evento.descricao)}`,
    `LOCATION:${escaparIcs(evento.local)}`,
    // Lembrete 2 horas antes
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escaparIcs(evento.titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Baixa o arquivo .ics. No celular, abrir o arquivo oferece adicionar ao calendário. */
export function baixarIcs(evento, nomeArquivo = "reserva-bah-quadras.ics") {
  const blob = new Blob([gerarIcs(evento)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

/** Link que abre o Google Agenda já com o evento preenchido. */
export function linkGoogleAgenda(evento) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${paraUtc(evento.inicio)}/${paraUtc(evento.fim)}`,
    details: evento.descricao,
    location: evento.local,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Link do WhatsApp com uma mensagem pronta (a pessoa escolhe para quem enviar). */
export const linkWhatsApp = (mensagem) => `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
