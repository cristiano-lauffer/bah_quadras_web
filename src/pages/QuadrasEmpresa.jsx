import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CircleCheck,
  CirclePause,
  Clock,
  LayoutGrid,
  PencilLine,
  Plus,
  Power,
  Wallet,
  Wrench,
} from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import { alterarStatus, listarQuadras, statusQuadra, totalHorariosSemana } from "../services/quadrasService.js";
import { formatarPreco, foto } from "../utils/formatadores.js";
import "../css/QuadrasEmpresa.css";
import Esqueleto from "../components/Esqueleto.jsx";

const filtros = [
  { valor: "todas", texto: "Todas" },
  { valor: "ativa", texto: "Ativas" },
  { valor: "manutencao", texto: "Em manutenção" },
  { valor: "inativa", texto: "Desativadas" },
];

const visualStatus = {
  ativa: { classe: "ok", icone: CircleCheck },
  manutencao: { classe: "alerta", icone: Wrench },
  inativa: { classe: "neutro", icone: CirclePause },
};

export default function QuadrasEmpresa() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dados: quadras, carregando, recarregar } = useDados(listarQuadras);
  const [filtro, setFiltro] = useState("todas");
  const [confirmando, setConfirmando] = useState(null);
  const [processando, setProcessando] = useState(null);
  const [toast, setToast] = useState(location.state?.aviso ?? "");

  const lista = quadras ?? [];
  const visiveis = lista.filter((q) => filtro === "todas" || q.status === filtro);
  const ativas = lista.filter((q) => q.status === "ativa");
  const precoMedio = ativas.length ? ativas.reduce((s, q) => s + q.preco, 0) / ativas.length : 0;

  async function mudarStatus(quadra, novoStatus) {
    setConfirmando(null);
    setProcessando(quadra.id);
    await alterarStatus(quadra.id, novoStatus);
    setProcessando(null);
    recarregar();
    setToast(
      novoStatus === "inativa"
        ? `${quadra.nome} foi desativada e não aparece mais para reserva.`
        : `${quadra.nome} está ativa novamente.`
    );
  }

  function fecharToast() {
    setToast("");
    // Limpa o aviso vindo de outra página para não reaparecer ao voltar.
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }

  return (
    <EmpresaLayout
      titulo="Minhas quadras"
      subtitulo="Cadastre, edite e defina os horários das suas quadras"
      acoes={
        <Link to="/empresa/quadras/nova" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Nova quadra
        </Link>
      }
    >
      <div className="pn-pilha">
        <section className="pn-kpis" aria-label="Resumo">
          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Quadras cadastradas
              <span className="pn-kpi-icone" aria-hidden="true"><LayoutGrid size={18} /></span>
            </div>
            <strong>{lista.length}</strong>
          </article>
          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Disponíveis para reserva
              <span className="pn-kpi-icone" aria-hidden="true"><CircleCheck size={18} /></span>
            </div>
            <strong>{ativas.length}</strong>
          </article>
          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Horários abertos por semana
              <span className="pn-kpi-icone" aria-hidden="true"><Clock size={18} /></span>
            </div>
            <strong>{ativas.reduce((s, q) => s + totalHorariosSemana(q.horarios), 0)}</strong>
          </article>
          <article className="pn-kpi">
            <div className="pn-kpi-topo">
              Preço médio por hora
              <span className="pn-kpi-icone" aria-hidden="true"><Wallet size={18} /></span>
            </div>
            <strong>{formatarPreco(precoMedio)}</strong>
          </article>
        </section>

        <div className="pn-chips" role="group" aria-label="Filtrar por situação">
          {filtros.map((f) => (
            <button
              key={f.valor}
              type="button"
              className="pn-chip"
              aria-pressed={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
            >
              {f.texto}
              <small className="qe-contagem">
                {f.valor === "todas" ? lista.length : lista.filter((q) => q.status === f.valor).length}
              </small>
            </button>
          ))}
        </div>

        {carregando && !quadras ? (
          <Esqueleto tipo="cards" quantidade={4} rotulo="Carregando quadras..." />
        ) : visiveis.length === 0 ? (
          <div className="pn-vazio">
            <LayoutGrid size={40} aria-hidden="true" />
            <h3>{lista.length ? "Nenhuma quadra nesta situação" : "Você ainda não cadastrou quadras"}</h3>
            <p>
              {lista.length
                ? "Escolha outro filtro para ver as demais quadras."
                : "Cadastre sua primeira quadra para começar a receber reservas."}
            </p>
            {!lista.length && (
              <Link to="/empresa/quadras/nova" className="pn-botao">
                <Plus size={18} aria-hidden="true" /> Cadastrar quadra
              </Link>
            )}
          </div>
        ) : (
          <ul className="qe-grade">
            {visiveis.map((q) => {
              const visual = visualStatus[q.status];
              const horas = totalHorariosSemana(q.horarios);
              return (
                <li key={q.id} className={`qe-card ${q.status !== "ativa" ? "apagada" : ""}`}>
                  <div className="qe-foto">
                    {q.imagem ? <img {...foto(q.imagem, 420)} alt="" loading="lazy" /> : <LayoutGrid size={36} aria-hidden="true" />}
                    <span className={`pn-status ${visual.classe} qe-foto-status`}>
                      <visual.icone size={13} aria-hidden="true" />
                      {statusQuadra[q.status]}
                    </span>
                  </div>

                  <div className="qe-corpo">
                    <span className="qe-modalidade">{q.modalidade}</span>
                    <h2>{q.nome}</h2>

                    <dl className="qe-info">
                      <div>
                        <dt>Preço</dt>
                        <dd>{formatarPreco(q.preco)}/h</dd>
                      </div>
                      <div>
                        <dt>Horários</dt>
                        <dd>{horas}/semana</dd>
                      </div>
                      <div>
                        <dt>Ocupação</dt>
                        <dd>{q.status === "ativa" ? `${q.ocupacao}%` : "—"}</dd>
                      </div>
                    </dl>

                    <div className="qe-acoes">
                      <Link to={`/empresa/quadras/${q.id}/editar`} className="pn-botao pn-botao-contorno">
                        <PencilLine size={16} aria-hidden="true" /> Editar
                      </Link>
                      <Link to={`/empresa/quadras/${q.id}/horarios`} className="pn-botao pn-botao-contorno">
                        <Clock size={16} aria-hidden="true" /> Horários
                      </Link>
                    </div>

                    {confirmando === q.id ? (
                      <div className="qe-confirmar" role="alert">
                        <p>Desativar esta quadra? Ela deixa de aparecer para os jogadores. Reservas já feitas continuam valendo.</p>
                        <div>
                          <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setConfirmando(null)}>
                            Cancelar
                          </button>
                          <button type="button" className="pn-botao pn-botao-perigo" onClick={() => mudarStatus(q, "inativa")}>
                            Desativar
                          </button>
                        </div>
                      </div>
                    ) : q.status === "inativa" ? (
                      <button
                        type="button"
                        className="qe-status-botao reativar"
                        disabled={processando === q.id}
                        onClick={() => mudarStatus(q, "ativa")}
                      >
                        <Power size={15} aria-hidden="true" />
                        {processando === q.id ? "Reativando..." : "Reativar quadra"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="qe-status-botao"
                        disabled={processando === q.id}
                        onClick={() => setConfirmando(q.id)}
                      >
                        <Power size={15} aria-hidden="true" />
                        {processando === q.id ? "Desativando..." : "Desativar quadra"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Toast mensagem={toast} onFechar={fecharToast} />
    </EmpresaLayout>
  );
}
