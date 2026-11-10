import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LayoutGrid,
  PencilLine,
  Wallet,
} from "lucide-react";
import PainelLayout from "./PainelLayout.jsx";
import { empresaDemo } from "../data/empresa.js";

const menuEmpresa = [
  { separador: "Gestão" },
  { texto: "Dashboard", icone: LayoutDashboard, to: "/empresa/dashboard" },
  { texto: "Reservas", icone: CalendarDays, emBreve: true },
  { texto: "Minhas quadras", icone: LayoutGrid, to: "/empresa/quadras", prefixo: "/empresa/quadras" },
  { texto: "Financeiro", icone: Wallet, emBreve: true },
  { separador: "Empresa" },
  { texto: "Perfil da empresa", icone: Building2, to: "/empresa/perfil" },
  { texto: "Editar perfil", icone: PencilLine, to: "/empresa/editar" },
];

/** Painel da área da empresa, com o menu já configurado. */
export default function EmpresaLayout(props) {
  return (
    <PainelLayout
      variante="empresa"
      rotulo="Empresa"
      menu={menuEmpresa}
      perfil={{ nome: empresaDemo.nome, subtitulo: empresaDemo.responsavel, avatar: empresaDemo.logo }}
      {...props}
    />
  );
}
