// Canais de contato comercial do Bah Quadras.
// TODO: substituir pelos dados reais da equipe antes de publicar.
export const CONTATO = {
  // Somente números, com DDI (55) + DDD. Ex.: 5551999999999
  whatsapp: "5551999999999",
  whatsappFormatado: "(51) 99999-9999",
  email: "contato@bahquadras.com.br",
  horario: "Seg. a sex., das 9h às 18h",
};

export const linkWhatsApp = (texto = "") =>
  `https://wa.me/${CONTATO.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

export const linkEmail = (assunto = "", corpo = "") =>
  `mailto:${CONTATO.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
