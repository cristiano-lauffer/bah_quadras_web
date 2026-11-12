import { Bell, CalendarDays, Heart, LayoutDashboard, Search, Settings, User } from "lucide-react";
import PainelLayout from "./PainelLayout.jsx";
import { usuarioDemo } from "../data/usuario.js";
import { iniciais } from "../utils/formatadores.js";
import { contarNaoLidas } from "../services/notificacoesUsuarioService.js";
import { useSessao } from "../hooks/useSessao.js";

const linkPerfil = (secao) => (secao ? `/usuario/perfil?secao=${secao}` : "/usuario/perfil");

/**
 * Painel da área do jogador, com o menu já configurado.
 * - proximasReservas: número exibido ao lado de "Reservas" (opcional)
 * - perfil: substitui nome/foto do usuário de demonstração (opcional)
 */
export default function UsuarioLayout({ proximasReservas, perfil, ...props }) {
  // Nome e e-mail de quem entrou (sem login, mostra o usuário de demonstração).
  const sessao = useSessao();
  const conta = sessao?.tipo === "usuario" ? sessao : { nome: usuarioDemo.nome, email: usuarioDemo.email };
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
      perfil={perfil ?? { nome: conta.nome, subtitulo: conta.email, avatar: iniciais(conta.nome) }}
      {...props}
    />
  );
}
