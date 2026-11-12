import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info, LoaderCircle, Mail, MailCheck } from "lucide-react";
import AuthLayout, { Campo } from "../layouts/AuthLayout.jsx";
import { emailValido } from "../utils/mascaras.js";
import { solicitarRecuperacao } from "../services/senhaService.js";
import { useTitulo } from "../hooks/useTitulo.js";

const ESPERA_REENVIO = 30; // segundos

const topo = (
  <>
    <span>Lembrou a senha?</span>
    <Link to="/login" className="auth-link-forte">
      Entrar
    </Link>
  </>
);

const textoLateral = {
  titulo: "Acontece com",
  destaque: "todo mundo.",
  texto: "Em poucos passos você cria uma senha nova e volta a reservar suas quadras.",
  vantagens: ["Link seguro enviado por e-mail", "Válido por 30 minutos", "Sua conta e reservas continuam iguais"],
};

/** Passo 1: o jogador informa o e-mail e recebe um link para criar uma nova senha. */
export default function RecuperarSenha() {
  useTitulo("Recuperar senha");
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(null); // { email, token }
  const [segundos, setSegundos] = useState(0);
  const [reenviado, setReenviado] = useState(false);

  // Contagem regressiva para liberar o "Reenviar e-mail".
  useEffect(() => {
    if (segundos <= 0) return undefined;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  async function enviar(e) {
    e?.preventDefault();
    if (!email.trim()) return setErro("Informe seu e-mail.");
    if (!emailValido(email)) return setErro("Digite um e-mail válido.");
    setErro("");
    setEnviando(true);
    const resposta = await solicitarRecuperacao(email.trim());
    setEnviando(false);
    setReenviado(Boolean(enviado));
    setEnviado(resposta);
    setSegundos(ESPERA_REENVIO);
  }

  if (enviado) {
    return (
      <AuthLayout topo={topo} {...textoLateral}>
        <div className="auth-sucesso">
          <MailCheck size={56} aria-hidden="true" />
          <h2>Confira seu e-mail</h2>
          <p>
            Se existir uma conta com <strong>{enviado.email}</strong>, enviamos um link para criar uma nova
            senha. Ele vale por 30 minutos. Não achou? Olhe também a caixa de spam.
          </p>

          <p className="auth-aviso" role="status">
            <Info size={18} aria-hidden="true" />
            Demonstração: ainda não enviamos e-mails de verdade. Use o botão abaixo para abrir o link.
          </p>

          <Link
            to={`/redefinir-senha?token=${enviado.token}&email=${encodeURIComponent(enviado.email)}`}
            className="auth-botao rs-botao"
          >
            Abrir link do e-mail <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <div className="rs-reenviar">
            {reenviado && segundos > 0 && <span role="status">E-mail reenviado!</span>}
            <button type="button" className="auth-link" onClick={enviar} disabled={segundos > 0 || enviando}>
              {enviando ? "Reenviando..." : segundos > 0 ? `Reenviar e-mail em ${segundos}s` : "Reenviar e-mail"}
            </button>
            <button type="button" className="auth-link" onClick={() => setEnviado(null)}>
              Usar outro e-mail
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout topo={topo} {...textoLateral}>
      <Link to="/login" className="auth-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para o login
      </Link>

      <header className="auth-cabecalho">
        <h2>Esqueceu a senha?</h2>
        <p>Informe o e-mail da sua conta e enviaremos um link para você criar uma nova.</p>
      </header>

      <form className="auth-form" onSubmit={enviar} noValidate>
        <Campo id="rec-email" rotulo="E-mail" icone={Mail} erro={erro}>
          <input
            id="rec-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (erro) setErro("");
            }}
            aria-invalid={!!erro}
            aria-describedby={erro ? "rec-email-erro" : undefined}
            autoFocus
          />
        </Campo>

        <button type="submit" className="auth-botao" disabled={enviando}>
          {enviando ? (
            <>
              <LoaderCircle size={18} className="auth-girando" aria-hidden="true" /> Enviando...
            </>
          ) : (
            <>
              Enviar link <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="auth-nota">
        Não tem mais acesso a esse e-mail?{" "}
        <Link to="/cadastro/empresa" className="auth-link-forte">
          Fale com a gente
        </Link>
      </p>
    </AuthLayout>
  );
}
