import {
  Bell,
  MessageSquareReply,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LayoutGrid,
  PencilLine,
  Wallet,
} from "lucide-react";
import PainelLayout from "./PainelLayout.jsx";
import { empresaAtual, obterEmpresa } from "../services/empresaService.js";
import { carregarNotificacoes, contarNaoLidas } from "../services/notificacoesService.js";
import { contarSemResposta } from "../services/respostasService.js";
import { listarQuadras } from "../services/quadrasService.js";
import { useDados } from "../hooks/useDados.js";
import { useSessao } from "../hooks/useSessao.js";

/** Painel da área da empresa, com o menu já configurado. */
export default function EmpresaLayout(props) {
  const sessao = useSessao();
  // Perfil, quadras e avisos da empresa: carregam da API e redesenham o menu quando chegam.
  useDados(
    () => (sessao?.tipo === "empresa" ? Promise.all([obterEmpresa(), listarQuadras(), carregarNotificacoes()]) : Promise.resolve(null)),
    [sessao?.id]
  );
  const empresa = empresaAtual();

  const menu = [
    { separador: "Gestão" },
    { texto: "Dashboard", icone: LayoutDashboard, to: "/empresa/dashboard" },
    { texto: "Reservas", icone: CalendarDays, to: "/empresa/reservas" },
    { texto: "Minhas quadras", icone: LayoutGrid, to: "/empresa/quadras", prefixo: "/empresa/quadras" },
    { texto: "Financeiro", icone: Wallet, to: "/empresa/financeiro" },
    { texto: "Avaliações", icone: MessageSquareReply, to: "/empresa/avaliacoes", badge: contarSemResposta() },
    { texto: "Notificações", icone: Bell, to: "/empresa/notificacoes", badge: contarNaoLidas() },
    { separador: "Empresa" },
    { texto: "Perfil da empresa", icone: Building2, to: "/empresa/perfil" },
    { texto: "Editar perfil", icone: PencilLine, to: "/empresa/editar" },
  ];

  return (
    <PainelLayout
      variante="empresa"
      rotulo="Empresa"
      menu={menu}
      perfil={{ nome: empresa.nome, subtitulo: empresa.responsavel, avatar: empresa.logo }}
      {...props}
    />
  );
}
