import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const opcoesNotificacao = [
  { id: "lembrete", titulo: "Lembrete antes do jogo", texto: "Receba um aviso no WhatsApp 2 horas antes da reserva." },
  { id: "confirmacao", titulo: "Confirmações por e-mail", texto: "Comprovante sempre que uma reserva for feita ou cancelada." },
  { id: "novidades", titulo: "Novidades e promoções", texto: "Quadras novas e horários com desconto perto de você." },
];

export default function SecaoConfiguracoes({ onAviso }) {
  const [notificacoes, setNotificacoes] = useState({ lembrete: true, confirmacao: true, novidades: false });
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });
  const [erroSenha, setErroSenha] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  function salvarSenha(e) {
    e.preventDefault();
    if (!senha.atual) return setErroSenha("Informe sua senha atual.");
    if (senha.nova.length < 8) return setErroSenha("A nova senha precisa ter pelo menos 8 caracteres.");
    if (senha.nova !== senha.confirmar) return setErroSenha("As senhas não coincidem.");
    setErroSenha("");
    setSenha({ atual: "", nova: "", confirmar: "" });
    setAlterandoSenha(false);
    onAviso("Senha alterada (demonstração).");
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
                onClick={() => setNotificacoes((n) => ({ ...n, [id]: !n[id] }))}
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
              <button type="submit" className="pn-botao">
                Salvar nova senha
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
              <button
                type="button"
                className="pn-botao pn-botao-perigo"
                onClick={() => {
                  setConfirmandoExclusao(false);
                  onAviso("Demonstração: nenhuma conta foi excluída.");
                }}
              >
                Sim, excluir
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
