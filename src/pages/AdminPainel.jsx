import { Link } from "react-router-dom";
import { Building2, CalendarCheck, LayoutGrid, Plus, Users, Wallet } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Esqueleto from "../components/Esqueleto.jsx";
import { useDados } from "../hooks/useDados.js";
import { resumoDoSistema } from "../services/adminService.js";
import { formatarPreco } from "../utils/formatadores.js";
import "../css/Admin.css";

/** Visão geral do admin (/admin): números do sistema inteiro. */
export default function AdminPainel() {
  const { dados: resumo, carregando, erro } = useDados(resumoDoSistema);

  const numeros = resumo
    ? [
        { icone: Building2, valor: resumo.empresas, texto: "Empresas", detalhe: `${resumo.empresas_ativas} ativas` },
        { icone: LayoutGrid, valor: resumo.quadras, texto: "Quadras no site", detalhe: "ativas ou em manutenção" },
        { icone: Users, valor: resumo.jogadores, texto: "Jogadores", detalhe: "contas de jogador" },
        { icone: CalendarCheck, valor: resumo.reservas_futuras, texto: "Reservas futuras", detalhe: "de hoje em diante" },
        { icone: CalendarCheck, valor: resumo.reservas_30_dias, texto: "Reservas em 30 dias", detalhe: "jogos realizados" },
        { icone: Wallet, valor: formatarPreco(Number(resumo.movimento_30_dias)), texto: "Movimento em 30 dias", detalhe: "valor das reservas" },
      ]
    : [];

  return (
    <AdminLayout
      titulo="Visão geral"
      subtitulo="Números de todo o Bah Quadras"
      acoes={
        <Link to="/admin/empresas/nova" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Cadastrar empresa
        </Link>
      }
    >
      {carregando ? (
        <Esqueleto tipo="lista" quantidade={3} rotulo="Carregando números..." />
      ) : erro ? (
        <p className="pn-erro" role="alert">{erro.message}</p>
      ) : (
        <div className="pn-pilha">
          <ul className="ad-numeros">
            {numeros.map(({ icone: Icone, valor, texto, detalhe }) => (
              <li key={texto} className="pn-card">
                <Icone size={20} aria-hidden="true" />
                <strong>{valor}</strong>
                <span>{texto}</span>
                <small>{detalhe}</small>
              </li>
            ))}
          </ul>
          <section className="pn-card">
            <div className="pn-card-topo">
              <div>
                <h2>Empresas parceiras</h2>
                <p>Cadastre, edite, desative ou gere um link de senha para o responsável.</p>
              </div>
              <Link to="/admin/empresas" className="pn-botao pn-botao-contorno">Ver empresas</Link>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
