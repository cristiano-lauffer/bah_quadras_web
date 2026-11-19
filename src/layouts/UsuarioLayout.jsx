import { Bell, CalendarDays, Heart, LayoutDashboard, Search, Settings, User } from "lucide-react";
import PainelLayout from "./PainelLayout.jsx";
import { iniciais } from "../utils/formatadores.js";
import { carregarNotificacoes, contarNaoLidas } from "../services/notificacoesUsuarioService.js";
import { useSessao } from "../hooks/useSessao.js";
import { useDados } from "../hooks/useDados.js";

const linkPerfil = (secao) => (secao ? `/usuario/perfil?secao=${secao}` : "/usuario/perfil");

/**
 * Painel da área do jogador, com o menu já configurado.
 * - proximasReservas: número exibido ao lado de "Reservas" (opcional)
 * - perfil: substitui nome/foto da conta logada (opcional)
 * As rotas que usam este layout ficam atrás da RotaProtegida (só jogador logado).
 */
export default function UsuarioLayout({ proximasReservas, perfil, ...props }) {
  const sessao = useSessao();
  const conta = sessao ?? { nome: "", email: "" };
  // Contador de notificações: carrega da API e redesenha o menu quando chega.
  useDados(() => (sessao?.tipo === "usuario" ? carregarNotificacoes() : Promise.resolve(null)), [sessao?.id]);
  const avatar = conta.foto ? <img src={conta.foto} alt="" /> : iniciais(conta.nome || "?");
  const menu = [
    { separador: "Minha conta" },
    { texto: "Início", icone: LayoutDashboard, to: linkPerfil() },
    { texto: "Reservas", icone: CalendarDays, to: "/usuario/reservas", badge: proximasReservas },
    { texto: "Notificações", icone: Bell, to: "/usuario/notificacoes", badge: contarNaoLidas() },
    { texto: "Favoritas", icone: Heart, to: linkPerfil("favoritas") },
    { texto: "Meus dados", icone: User, to: linkPerfil("dados") },
    { texto: "Configurações", icone: Settings, to: linkPerfil("configuracoes") },
    { separador: "Explorar" },
    { texto: "Encontrar quadras", icone: Search, to: "/" },
  ];

  return (
    <PainelLayout
      variante="usuario"
      rotulo="Área do jogador"
      menu={menu}
      perfil={perfil ?? { nome: conta.nome, subtitulo: conta.email, avatar }}
      {...props}
    />
  );
}
