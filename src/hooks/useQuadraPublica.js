import { buscarQuadraPublica, carregarQuadraPublica } from "../services/catalogoService.js";
import { useDados } from "./useDados.js";

/**
 * Quadra do catálogo pelo id da URL (/quadra/:id, /agendamento/:id).
 * Usa a lista já carregada quando dá; senão, busca a quadra na API.
 *   const { quadra, carregando } = useQuadraPublica(id);
 */
export function useQuadraPublica(id) {
  const imediata = id ? buscarQuadraPublica(id) : null;
  const { dados, carregando, erro } = useDados(
    () => (imediata || !id ? Promise.resolve(imediata ?? null) : carregarQuadraPublica(id)),
    [id]
  );
  return { quadra: imediata ?? dados ?? null, carregando: !imediata && Boolean(id) && carregando, erro };
}
