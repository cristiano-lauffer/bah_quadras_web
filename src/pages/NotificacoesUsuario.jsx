import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import ListaNotificacoes from "../components/ListaNotificacoes.jsx";
import * as servico from "../services/notificacoesUsuarioService.js";

/** Notificações do jogador (/usuario/notificacoes): reservas, lembretes e convites para avaliar. */
export default function NotificacoesUsuario() {
  return (
    <ListaNotificacoes Layout={UsuarioLayout} servico={servico} ajustes="/usuario/perfil?secao=configuracoes" />
  );
}
