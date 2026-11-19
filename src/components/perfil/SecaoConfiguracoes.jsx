import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { excluirConta, preferenciasDoUsuario, salvarPreferencias, trocarSenha } from "../../services/usuarioService.js";

const opcoesNotificacao = [
  { id: "lembrete", titulo: "Lembrete antes do jogo", texto: "Receba um aviso no WhatsApp 2 horas antes da reserva." },
  { id: "confirmacao", titulo: "Confirmações por e-mail", texto: "Comprovante sempre que uma reserva for feita ou cancelada." },
  { id: "novidades", titulo: "Novidades e promoções", texto: "Quadras novas e horários com desconto perto de você." },
];

export default function SecaoConfiguracoes({ onAviso }) {
  // Preferências salvas (continuam iguais depois de recarregar a página).
  const [notificacoes, setNotificacoes] = useState(preferenciasDoUsuario);

  const navigate = useNavigate();
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function alternar(id, titulo) {
    const anteriores = notificacoes;
    const novas = { ...notificacoes, [id]: !notificacoes[id] };
    setNotificacoes(novas);
    try {
      await salvarPreferencias(novas);
      onAviso(`${titulo}: ${novas[id] ? "ativado" : "desativado"}.`);
    } catch (erro) {
      setNotificacoes(anteriores);
      onAviso(erro.message);
    }
  }
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });
  const [erroSenha, setErroSenha] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  async function salvarSenha(e) {
    e.preventDefault();
    if (!senha.atual) return setErroSenha("Informe sua senha atual.");
    if (senha.nova.length < 8) return setErroSenha("A nova senha precisa ter pelo menos 8 caracteres.");
    if (senha.nova !== senha.confirmar) return setErroSenha("As senhas não coincidem.");
    setErroSenha("");
    setSalvandoSenha(true);
    try {
      await trocarSenha(senha.atual, senha.nova);
    } catch (erro) {
      setErroSenha(erro.message);
      return;
    } finally {
      setSalvandoSenha(false);
    }
    setSenha({ atual: "", nova: "", confirmar: "" });
    setAlterandoSenha(false);
    onAviso("Senha alterada!");
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await excluirConta();
      navigate("/", { replace: true });
    } catch (erro) {
      setExcluindo(false);
      setConfirmandoExclusao(false);
      onAviso(erro.message);
    }
  }

  return (
    <div className="pn-pilha">
      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>Notificações</h2>
            <p>Escolha como quer ser avisado sobre suas reservas.</p>
          </div>
        </div>
        <ul className="pu-opcoes">
          {opcoesNotificacao.map(({ id, titulo, texto }) => (
            <li key={id}>
              <div>
                <strong id={`notif-${id}`}>{titulo}</strong>
                <p>{texto}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificacoes[id]}
                aria-labelledby={`notif-${id}`}
                className="pn-switch"
                onClick={() => alternar(id, titulo)}
              >
                <span />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="pn-card">
        <div className="pn-card-topo">
          <div>
            <h2>
              <ShieldCheck size={19} aria-hidden="true" /> Senha e segurança
            </h2>
            <p>Recomendamos trocar a senha periodicamente.</p>
          </div>
          {!alterandoSenha && (
            <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setAlterandoSenha(true)}>
              Alterar senha
            </button>
          )}
        </div>

        {alterandoSenha && (
          <form className="pn-form" onSubmit={salvarSenha} noValidate>
            <div className="pn-form-grade pu-grade-3">
              {[
                ["atual", "Senha atual", "current-password"],
                ["nova", "Nova senha", "new-password"],
                ["confirmar", "Confirmar nova senha", "new-password"],
              ].map(([campo, rotulo, auto]) => (
                <div key={campo} className="pn-campo">
                  <label htmlFor={`senha-${campo}`}>{rotulo}</label>
                  <input
                    id={`senha-${campo}`}
                    type="password"
                    autoComplete={auto}
                    value={senha[campo]}
                    onChange={(e) => setSenha((s) => ({ ...s, [campo]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {erroSenha && <p className="pn-erro" role="alert">{erroSenha}</p>}
            <div className="pn-form-acoes">
              <button
                type="button"
                className="pn-botao pn-botao-contorno"
                onClick={() => {
                  setAlterandoSenha(false);
                  setErroSenha("");
                }}
              >
                Cancelar
              </button>
              <button type="submit" className="pn-botao" disabled={salvandoSenha}>
                {salvandoSenha ? "Salvando..." : "Salvar nova senha"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="pn-card pu-perigo">
        <div className="pn-card-topo">
          <div>
            <h2>Excluir conta</h2>
            <p>Suas reservas futuras serão canceladas e seus dados apagados. Não dá para desfazer.</p>
          </div>
          {!confirmandoExclusao ? (
            <button type="button" className="pn-botao pn-botao-perigo" onClick={() => setConfirmandoExclusao(true)}>
              Excluir conta
            </button>
          ) : (
            <div className="pu-perigo-confirmar" role="alert">
              <span>Tem certeza?</span>
              <button type="button" className="pn-botao pn-botao-contorno" onClick={() => setConfirmandoExclusao(false)}>
                Não
              </button>
              <button type="button" className="pn-botao pn-botao-perigo" disabled={excluindo} onClick={confirmarExclusao}>
                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
