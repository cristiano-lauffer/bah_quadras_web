import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, PencilLine, Plus, Search } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Esqueleto from "../components/Esqueleto.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { atualizarEmpresa, listarEmpresas } from "../services/adminService.js";
import { mascaraCnpj } from "../utils/mascaras.js";
import { normalizar } from "../utils/formatadores.js";
import "../css/Admin.css";

/** Lista de empresas do admin (/admin/empresas). */
export default function AdminEmpresas() {
  const { dados, carregando, erro, recarregar } = useDados(listarEmpresas);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [salvando, setSalvando] = useState(null);
  const [toast, setToast] = useState("");

  const termo = normalizar(busca);
  const lista = (dados ?? [])
    .filter((e) => filtro === "todas" || (filtro === "ativas" ? e.ativo : !e.ativo))
    .filter((e) => !termo || [e.nome, e.cidade ?? "", e.responsavel?.email ?? ""].some((c) => normalizar(c).includes(termo)));

  async function alternarAtivo(e) {
    setSalvando(e.id);
    try {
      await atualizarEmpresa(e.id, { ativo: !e.ativo });
      setToast(e.ativo ? `${e.nome} desativada: saiu do site e o responsável não entra mais.` : `${e.nome} reativada.`);
      recarregar();
    } catch (falha) {
      setToast(falha.message);
    } finally {
      setSalvando(null);
    }
  }

  return (
    <AdminLayout
      titulo="Empresas"
      subtitulo="Empresas parceiras do Bah Quadras"
      acoes={
        <Link to="/admin/empresas/nova" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Cadastrar empresa
        </Link>
      }
    >
      <div className="pn-pilha">
        <section className="pn-card ad-filtros" aria-label="Filtros">
          <label className="ad-busca">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por nome, cidade ou e-mail"
              aria-label="Buscar empresa"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
          <div className="pn-chips" role="group" aria-label="Situação">
            {[["todas", "Todas"], ["ativas", "Ativas"], ["inativas", "Desativadas"]].map(([id, texto]) => (
              <button key={id} type="button" className="pn-chip" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
                {texto}
              </button>
            ))}
          </div>
        </section>

        {carregando && !dados ? (
          <Esqueleto tipo="lista" quantidade={5} rotulo="Carregando empresas..." />
        ) : erro ? (
          <p className="pn-erro" role="alert">{erro.message}</p>
        ) : lista.length === 0 ? (
          <div className="pn-vazio">
            <Building2 size={40} aria-hidden="true" />
            <h3>Nenhuma empresa encontrada</h3>
          </div>
        ) : (
          <ul className="ad-lista">
            {lista.map((e) => (
              <li key={e.id} className={`pn-card ad-empresa ${e.ativo ? "" : "inativa"}`}>
                <div className="ad-empresa-info">
                  <strong>{e.nome}</strong>
                  <span>
                    {[e.cidade, e.cnpj && mascaraCnpj(e.cnpj)].filter(Boolean).join(" · ") || "Sem cidade e CNPJ"}
                  </span>
                  <span>
                    {e.responsavel ? `${e.responsavel.nome} · ${e.responsavel.email}` : "Sem responsável com login"}
                  </span>
                </div>
                <div className="ad-empresa-numeros">
                  <span><strong>{e.quadras}</strong> quadras</span>
                  <span><strong>{e.reservas_30_dias}</strong> reservas em 30 dias</span>
                </div>
                <span className={`pn-status ${e.ativo ? "ok" : "erro"}`}>{e.ativo ? "Ativa" : "Desativada"}</span>
                <div className="ad-empresa-acoes">
                  <Link to={`/admin/empresas/${e.id}`} className="pn-botao pn-botao-contorno">
                    <PencilLine size={15} aria-hidden="true" /> Editar
                  </Link>
                  <button
                    type="button"
                    className={`pn-botao ${e.ativo ? "pn-botao-perigo" : ""}`}
                    disabled={salvando === e.id}
                    onClick={() => alternarAtivo(e)}
                  >
                    {e.ativo ? "Desativar" : "Reativar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </AdminLayout>
  );
}
