import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, Eraser, LoaderCircle, MousePointerClick, PencilLine, RotateCcw, SearchX, Store } from "lucide-react";
import EmpresaLayout from "../layouts/EmpresaLayout.jsx";
import Toast from "../components/Toast.jsx";
import { useDados } from "../hooks/useDados.js";
import {
  buscarQuadra,
  diasDaSemana,
  gradePadrao,
  horasDoDia,
  listarQuadras,
  salvarHorarios,
  totalHorariosSemana,
} from "../services/quadrasService.js";
import "../css/HorariosQuadra.css";
import Esqueleto from "../components/Esqueleto.jsx";

const ordenar = (lista) => [...lista].sort();
const mesmaGrade = (a, b) =>
  diasDaSemana.every(({ dia }) => (a?.[dia] ?? []).join() === (b?.[dia] ?? []).join());
const fimDoHorario = (hora) => `${String(Number(hora.slice(0, 2)) + 1).padStart(2, "0")}:00`;

// US5 - Empresa define horários disponíveis por quadra
export default function HorariosQuadra() {
  const { id } = useParams();
  const { dados: quadra, carregando, erro } = useDados(() => buscarQuadra(id), [id]);
  const { dados: todas } = useDados(listarQuadras);

  return (
    <EmpresaLayout
      titulo="Horários disponíveis"
      subtitulo={quadra ? `${quadra.nome} · ${quadra.modalidade}` : "Defina quando cada quadra pode ser reservada"}
      acoes={
        quadra && (
          <Link to={`/empresa/quadras/${id}/editar`} className="pn-botao pn-botao-contorno">
            <PencilLine size={17} aria-hidden="true" /> Editar quadra
          </Link>
        )
      }
    >
      {carregando ? (
        <Esqueleto tipo="botoes" quantidade={28} rotulo="Carregando horários..." />
      ) : erro ? (
        <div className="pn-vazio">
          <SearchX size={40} aria-hidden="true" />
          <h3>Quadra não encontrada</h3>
          <p>Ela pode ter sido removida ou o endereço está incorreto.</p>
          <Link to="/empresa/quadras" className="pn-botao">Voltar para Minhas quadras</Link>
        </div>
      ) : (
        <EditorHorarios key={quadra.id} quadra={quadra} todas={todas ?? []} />
      )}
    </EmpresaLayout>
  );
}

function EditorHorarios({ quadra, todas }) {
  const navigate = useNavigate();
  const [salva, setSalva] = useState(quadra.horarios ?? {});
  const [grade, setGrade] = useState(quadra.horarios ?? {});
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState("");
  const pintura = useRef(null); // true = abrindo, false = fechando, null = sem arrastar

  const alterado = !mesmaGrade(grade, salva);
  const total = totalHorariosSemana(grade);
  const estaAberto = (dia, hora) => (grade[dia] ?? []).includes(hora);

  // Termina o "arrastar" quando o botão do mouse/dedo é solto em qualquer lugar.
  useEffect(() => {
    const parar = () => (pintura.current = null);
    window.addEventListener("pointerup", parar);
    window.addEventListener("pointercancel", parar);
    return () => {
      window.removeEventListener("pointerup", parar);
      window.removeEventListener("pointercancel", parar);
    };
  }, []);

  // Avisa antes de fechar a aba com alterações não salvas.
  useEffect(() => {
    if (!alterado) return undefined;
    const avisar = (e) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  function definir(dia, hora, aberto) {
    setGrade((g) => {
      const atual = g[dia] ?? [];
      if (atual.includes(hora) === aberto) return g;
      return { ...g, [dia]: aberto ? ordenar([...atual, hora]) : atual.filter((h) => h !== hora) };
    });
  }

  function iniciarPintura(e, dia, hora) {
    e.currentTarget.releasePointerCapture?.(e.pointerId); // permite arrastar no celular
    pintura.current = !estaAberto(dia, hora);
    definir(dia, hora, pintura.current);
  }

  function continuarPintura(e) {
    if (pintura.current === null) return;
    const celula = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-celula]");
    if (celula) definir(Number(celula.dataset.dia), celula.dataset.hora, pintura.current);
  }

  // Teclado e leitores de tela geram um clique "virtual" (detail === 0).
  // O clique do mouse/dedo já foi tratado no pointerdown.
  function cliqueNaCelula(e, dia, hora) {
    if (e.detail === 0) definir(dia, hora, !estaAberto(dia, hora));
  }

  function alternarDia(dia) {
    const todosAbertos = horasDoDia.every((h) => estaAberto(dia, h));
    setGrade((g) => ({ ...g, [dia]: todosAbertos ? [] : [...horasDoDia] }));
  }

  function alternarHora(hora) {
    const todosAbertos = diasDaSemana.every(({ dia }) => estaAberto(dia, hora));
    setGrade((g) => {
      const nova = { ...g };
      for (const { dia } of diasDaSemana) {
        const atual = nova[dia] ?? [];
        nova[dia] = todosAbertos ? atual.filter((h) => h !== hora) : ordenar([...new Set([...atual, hora])]);
      }
      return nova;
    });
  }

  function copiarSegunda() {
    setGrade((g) => ({ ...g, 2: [...(g[1] ?? [])], 3: [...(g[1] ?? [])], 4: [...(g[1] ?? [])], 5: [...(g[1] ?? [])] }));
  }

  async function salvar() {
    setSalvando(true);
    await salvarHorarios(quadra.id, grade);
    setSalva(grade);
    setSalvando(false);
    setToast(`Horários salvos: ${total} horários por semana.`);
  }

  return (
    <div className="pn-pilha">
      <div className="hq-topo">
        <label className="hq-trocar">
          <span>Quadra</span>
          <select
            value={quadra.id}
            onChange={(e) => {
              if (!alterado || window.confirm("Há alterações não salvas. Trocar de quadra mesmo assim?"))
                navigate(`/empresa/quadras/${e.target.value}/horarios`);
            }}
          >
            {todas.map((q) => (
              <option key={q.id} value={q.id}>
                {q.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="hq-atalhos">
          <button type="button" className="pn-botao pn-botao-contorno" onClick={copiarSegunda}>
            <Copy size={16} aria-hidden="true" /> Copiar segunda para dias úteis
          </button>
          <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setGrade(gradePadrao())}>
            <Store size={16} aria-hidden="true" /> Usar horário de funcionamento
          </button>
          <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setGrade({})}>
            <Eraser size={16} aria-hidden="true" /> Fechar tudo
          </button>
        </div>
      </div>

      {quadra.status !== "ativa" && (
        <p className="hq-aviso">
          Esta quadra está <strong>{quadra.status === "inativa" ? "desativada" : "em manutenção"}</strong>. Os horários
          ficam salvos, mas só aparecem para os jogadores quando ela voltar a ficar ativa.
        </p>
      )}

      <section className="pn-card hq-card">
        <div className="pn-card-topo">
          <div>
            <h2>Grade semanal</h2>
            <p>
              <MousePointerClick size={14} aria-hidden="true" /> Clique ou arraste para abrir e fechar horários.
              Clique no dia ou na hora para alternar a coluna ou a linha inteira.
            </p>
          </div>
          <div className="hq-legenda" aria-hidden="true">
            <span><i className="aberto" /> Disponível</span>
            <span><i /> Fechado</span>
          </div>
        </div>

        <div className="hq-rolagem">
          <table className="hq-grade" onPointerMove={continuarPintura}>
            <caption className="pn-sr">Horários disponíveis por dia da semana. Cada célula é 1 hora.</caption>
            <thead>
              <tr>
                <th scope="col" className="hq-canto">Hora</th>
                {diasDaSemana.map(({ dia, curto, nome }) => (
                  <th key={dia} scope="col">
                    <button type="button" className="hq-cabecalho" onClick={() => alternarDia(dia)} title={`Alternar ${nome} inteiro`}>
                      {curto}
                      <small>{(grade[dia] ?? []).length}h</small>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horasDoDia.map((hora) => (
                <tr key={hora}>
                  <th scope="row">
                    <button type="button" className="hq-hora" onClick={() => alternarHora(hora)} title={`Alternar ${hora} em todos os dias`}>
                      {hora}
                    </button>
                  </th>
                  {diasDaSemana.map(({ dia, nome }) => {
                    const aberto = estaAberto(dia, hora);
                    return (
                      <td key={dia}>
                        <button
                          type="button"
                          className={`hq-celula ${aberto ? "aberto" : ""}`}
                          data-celula
                          data-dia={dia}
                          data-hora={hora}
                          aria-pressed={aberto}
                          aria-label={`${nome}, ${hora} às ${fimDoHorario(hora)}`}
                          onPointerDown={(e) => iniciarPintura(e, dia, hora)}
                          onClick={(e) => cliqueNaCelula(e, dia, hora)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Barra de salvar ===== */}
      <div className={`hq-barra ${alterado ? "visivel" : ""}`} role="region" aria-label="Salvar horários">
        <span>
          <strong>{total}</strong> horários por semana
          {alterado && <em> · alterações não salvas</em>}
        </span>
        <div>
          <button
            type="button"
            className="pn-botao pn-botao-contorno"
            disabled={!alterado || salvando}
            onClick={() => setGrade(salva)}
          >
            <RotateCcw size={16} aria-hidden="true" /> Descartar
          </button>
          <button type="button" className="pn-botao" disabled={!alterado || salvando} onClick={salvar}>
            {salvando ? (
              <>
                <LoaderCircle size={16} className="hq-girando" aria-hidden="true" /> Salvando...
              </>
            ) : (
              "Salvar horários"
            )}
          </button>
        </div>
      </div>

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </div>
  );
}
