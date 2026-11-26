// =========================================================
// Envio de FOTOS para a API (POST /uploads).
// As telas leem o arquivo como data URL para mostrar a prévia; aqui ele é enviado
// e volta o endereço público, que é o que fica salvo na quadra, no perfil etc.
// =========================================================
import { api } from "./api.js";

export const ehDataUrl = (valor) => typeof valor === "string" && valor.startsWith("data:");

/** Envia a foto (data URL) e devolve o endereço dela. Endereços http(s) passam direto. */
export async function enviarFoto(valor) {
  if (!ehDataUrl(valor)) return valor;
  const { url } = await api("/uploads", { metodo: "POST", corpo: { arquivo: valor } });
  return url;
}

/** Lê um File como data URL (para prévia e envio). */
export function lerArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}
