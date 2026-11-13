import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessao } from "../hooks/useSessao.js";
import { acabouDeSair } from "../services/sessaoService.js";

/**
 * Protege as áreas logadas. Uso nas rotas:
 *   <Route element={<RotaProtegida tipo="empresa" />}> ...rotas da empresa... </Route>
 *
 * - Sem login: vai para o Login e, depois de entrar, volta para a página pedida.
 * - Logado com o outro tipo de conta (ex.: jogador abrindo /empresa): vai para o
 *   Login com um aviso explicando que a área é de outro tipo de conta.
 *
 * Importante: isso só melhora a navegação. A segurança de verdade fica no backend,
 * que deve recusar qualquer chamada sem um token válido do tipo certo.
 */
export default function RotaProtegida({ tipo }) {
  const sessao = useSessao();
  const { pathname, search } = useLocation();

  if (sessao?.tipo === tipo) return <Outlet />;

  // Clicou em "Sair": vai para o Login com o aviso de saída (e sem voltar para cá depois).
  if (!sessao && acabouDeSair(`${pathname}${search}`)) {
    return <Navigate to="/login" replace state={{ aviso: "Você saiu da sua conta. Até a próxima partida!" }} />;
  }

  return (
    <Navigate
      to="/login"
      replace
      state={{ de: `${pathname}${search}`, motivo: sessao ? "outra-conta" : "area", area: tipo }}
    />
  );
}
