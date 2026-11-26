import { Building2, LayoutDashboard, Plus, Search } from "lucide-react";
import PainelLayout from "./PainelLayout.jsx";
import { useSessao } from "../hooks/useSessao.js";
import { iniciais } from "../utils/formatadores.js";

/** Painel do administrador do Bah Quadras, com o menu já configurado. */
export default function AdminLayout(props) {
  const sessao = useSessao();
  const menu = [
    { separador: "Administração" },
    { texto: "Visão geral", icone: LayoutDashboard, to: "/admin" },
    { texto: "Empresas", icone: Building2, to: "/admin/empresas" },
    { texto: "Cadastrar empresa", icone: Plus, to: "/admin/empresas/nova" },
    { separador: "Site" },
    { texto: "Ver quadras", icone: Search, to: "/" },
  ];
  return (
    <PainelLayout
      variante="empresa"
      rotulo="Administração"
      menu={menu}
      perfil={{ nome: sessao?.nome ?? "Admin", subtitulo: sessao?.email ?? "", avatar: iniciais(sessao?.nome ?? "Admin") }}
      {...props}
    />
  );
}
