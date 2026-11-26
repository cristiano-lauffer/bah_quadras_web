import { useEffect, useRef, useState } from "react";
import { Ban, LoaderCircle, Store, X } from "lucide-react";
import { horasDoDia } from "../services/quadrasService.js";
import { criarBloqueio, criarReservaBalcao, formasPagamento } from "../services/reservasEmpresaService.js";
import { formatarPreco, isoComDias } from "../utils/formatadores.js";
import "../css/NovoHorario.css";

const fins = [...horasDoDia.slice(1), "24:00"];
const mais1h = (h) => `${String(Number(h.slice(0, 2)) + 1).padStart(2, "0")}:00`;

/**
 * Janela da agenda da empresa para tirar um horário do site:
 * - "Reserva presencial": cliente que ligou ou chegou no balcão (entra no faturamento);
 * - "Bloquear horário": manutenção, evento... (sem cliente e sem valor).
 * onConcluir(mensagem) é chamado depois de salvar.
 */
export default function NovoHorario({ aberto, quadras, onFechar, onConcluir }) {
  const dialogRef = useRef(null);
  const ativas = (quadras ?? []).filter((q) => q.status === "ativa");
  const [tipo, setTipo] = useState("reserva");
  const [form, setForm] = useState({
    quadraId: "", data: isoComDias(0), hora: "18:00", duracao: 1, fim: "20:00", cliente: "", pagamento: "Pix", motivo: "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  const quadraId = form.quadraId || ativas[0]?.id || "";
  const quadra = ativas.find((q) => q.id === quadraId);
  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    if (!quadraId) return setErro("Cadastre uma quadra ativa primeiro.");
    if (tipo === "reserva" && !form.cliente.trim()) return setErro("Informe o nome do cliente.");
    if (tipo === "bloqueio" && !form.motivo.trim()) return setErro("Informe o motivo do bloqueio.");
    if (tipo === "bloqueio" && form.fim <= form.hora) return setErro("O fim precisa ser depois do início.");
    setSalvando(true);
    try {
      if (tipo === "reserva") {
        await criarReservaBalcao({
          quadraId, cliente: form.cliente.trim(), data: form.data, hora: form.hora, duracao: Number(form.duracao), pagamento: form.pagamento,
        });
        onConcluir(`Reserva de ${form.cliente.trim()} registrada. O horário saiu do site.`);
      } else {
        await criarBloqueio({ quadraId, data: form.data, horaInicio: form.hora, horaFim: form.fim, motivo: form.motivo.trim() });
        onConcluir("Horário bloqueado. Ele não aparece mais para os jogadores.");
      }
      setForm((f) => ({ ...f, cliente: "", motivo: "" }));
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="nh-modal"
      aria-labelledby="nh-titulo"
      onClose={onFechar}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      {aberto && (
        <form className="nh" onSubmit={salvar} noValidate>
          <header className="nh-topo">
            <h2 id="nh-titulo">Novo horário na agenda</h2>
            <button type="button" className="nh-fechar" aria-label="Fechar" onClick={onFechar}>
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="pn-chips" role="radiogroup" aria-label="Tipo">
            <button type="button" role="radio" aria-checked={tipo === "reserva"} className="pn-chip" onClick={() => setTipo("reserva")}>
              <Store size={15} aria-hidden="true" /> Reserva presencial
            </button>
            <button type="button" role="radio" aria-checked={tipo === "bloqueio"} className="pn-chip" onClick={() => setTipo("bloqueio")}>
              <Ban size={15} aria-hidden="true" /> Bloquear horário
            </button>
          </div>
          <p className="nh-ajuda">
            {tipo === "reserva"
              ? "Para quem reservou por telefone ou no balcão. O horário sai do site e o valor entra no financeiro."
              : "Para manutenção, evento ou uso interno. O horário sai do site, sem cliente e sem valor."}
          </p>

          <div className="pn-form-grade">
            <div className="pn-campo">
              <label htmlFor="nh-quadra">Quadra</label>
              <select id="nh-quadra" value={quadraId} onChange={mudar("quadraId")}>
                {ativas.map((q) => (
                  <option key={q.id} value={q.id}>{q.nome}</option>
                ))}
              </select>
            </div>
            <div className="pn-campo">
              <label htmlFor="nh-data">Dia</label>
              <input id="nh-data" type="date" min={isoComDias(0)} value={form.data} onChange={mudar("data")} />
            </div>
            <div className="pn-campo">
              <label htmlFor="nh-hora">Início</label>
              <select
                id="nh-hora"
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value, fim: f.fim <= e.target.value ? mais1h(e.target.value) : f.fim }))}
              >
                {horasDoDia.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            {tipo === "reserva" ? (
              <div className="pn-campo">
                <label htmlFor="nh-duracao">Duração</label>
                <select id="nh-duracao" value={form.duracao} onChange={mudar("duracao")}>
                  {[1, 2, 3].map((n) => <option key={n} value={n}>{n}h</option>)}
                </select>
              </div>
            ) : (
              <div className="pn-campo">
                <label htmlFor="nh-fim">Fim</label>
                <select id="nh-fim" value={form.fim} onChange={mudar("fim")}>
                  {fins.filter((h) => h > form.hora).map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            )}
          </div>

          {tipo === "reserva" ? (
            <div className="pn-form-grade">
              <div className="pn-campo">
                <label htmlFor="nh-cliente">Nome do cliente</label>
                <input id="nh-cliente" maxLength={100} value={form.cliente} onChange={mudar("cliente")} placeholder="Ex.: Pelada de quinta" />
              </div>
              <div className="pn-campo">
                <label htmlFor="nh-pagamento">Forma de pagamento</label>
                <select id="nh-pagamento" value={form.pagamento} onChange={mudar("pagamento")}>
                  {formasPagamento.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="pn-campo">
              <label htmlFor="nh-motivo">Motivo</label>
              <input id="nh-motivo" maxLength={255} value={form.motivo} onChange={mudar("motivo")} placeholder="Ex.: Manutenção da grama" />
            </div>
          )}

          {tipo === "reserva" && quadra && (
            <p className="nh-ajuda">Valor: {formatarPreco(quadra.preco * Number(form.duracao))} ({formatarPreco(quadra.preco)}/hora)</p>
          )}
          {erro && <p className="pn-erro" role="alert">{erro}</p>}

          <div className="pn-form-acoes">
            <button type="button" className="pn-botao pn-botao-contorno" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="pn-botao" disabled={salvando}>
              {salvando && <LoaderCircle size={16} className="re-girando" aria-hidden="true" />}
              {tipo === "reserva" ? "Registrar reserva" : "Bloquear horário"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
