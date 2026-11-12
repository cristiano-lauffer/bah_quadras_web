import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import ListaNotificacoes from "../components/ListaNotificacoes.jsx";
import * as servico from "../services/notificacoesService.js";

/** Notificações da empresa (/empresa/notificacoes). */
export default function Notificacoes() {
  return <ListaNotificacoes Layout={EmpresaLayout} servico={servico} />;
}
