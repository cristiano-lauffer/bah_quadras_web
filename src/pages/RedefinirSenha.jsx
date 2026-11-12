import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, LinkIcon, LoaderCircle, Lock } from "lucide-react";
import AuthLayout, { Campo, ForcaSenha } from "../layouts/AuthLayout.jsx";
import { redefinirSenha } from "../services/senhaService.js";
import { useTitulo } from "../hooks/useTitulo.js";

const regras = [
  { texto: "Pelo menos 8 caracteres", ok: (s) => s.length >= 8 },
  { texto: "Letras maiúsculas e minúsculas", ok: (s) => /[A-Z]/.test(s) && /[a-z]/.test(s) },
  { texto: "Pelo menos um número", ok: (s) => /\d/.test(s) },
];

const topo = (
  <>
    <span>Lembrou a senha?</span>
    <Link to="/login" className="auth-link-forte">
      Entrar
    </Link>
  </>
);

/** Passo 2: aberto pelo link do e-mail (/redefinir-senha?token=...). */
export default function RedefinirSenha() {
  useTitulo("Criar nova senha");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";

  const [form, setForm] = useState({ senha: "", confirmar: "" });
  const [erros, setErros] = useState({});
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!token) {
    return (
      <AuthLayout topo={topo}>
        <div className="auth-sucesso">
          <LinkIcon size={52} aria-hidden="true" />
          <h2>Link inválido</h2>
          <p>Este link de recuperação está incompleto ou expirou. Peça um novo para criar sua senha.</p>
          <Link to="/recuperar-senha" className="auth-botao rs-botao">
            Pedir novo link <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  function atualizar(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (erros[name] || erros.geral) setErros((atual) => ({ ...atual, [name]: "", geral: "" }));
  }

  async function salvar(e) {
    e.preventDefault();
    const novos = {};
    if (!regras.every((r) => r.ok(form.senha))) novos.senha = "A senha ainda não atende a todos os requisitos.";
    if (form.confirmar !== form.senha) novos.confirmar = "As senhas não coincidem.";
    setErros(novos);
    if (Object.keys(novos).length) return;

    setEnviando(true);
    try {
      await redefinirSenha(token, form.senha);
      navigate("/login", {
        replace: true,
        state: { aviso: "Senha alterada! Agora é só entrar com a nova senha.", email },
      });
    } catch (erro) {
      setEnviando(false);
      setErros({ geral: erro.message });
    }
  }

  return (
    <AuthLayout
      topo={topo}
      titulo="Senha nova,"
      destaque="jogo garantido."
      texto="Escolha uma senha forte e que você não use em outros sites."
    >
      <header className="auth-cabecalho">
        <h2>Criar nova senha</h2>
        <p>{email ? <>Para a conta <strong>{email}</strong>.</> : "Digite e confirme sua nova senha."}</p>
      </header>

      <form className="auth-form" onSubmit={salvar} noValidate>
        <Campo id="nova-senha" rotulo="Nova senha" icone={Lock} erro={erros.senha}>
          <input
            id="nova-senha"
            name="senha"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Crie uma senha"
            value={form.senha}
            onChange={atualizar}
            aria-invalid={!!erros.senha}
            aria-describedby="nova-senha-regras"
            autoFocus
          />
          <button
            type="button"
            className="auth-input-botao"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={mostrar}
          >
            {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </Campo>

        <ForcaSenha senha={form.senha} />

        <ul className="rs-regras" id="nova-senha-regras" aria-label="Requisitos da senha">
          {regras.map((r) => {
            const ok = r.ok(form.senha);
            return (
              <li key={r.texto} className={ok ? "ok" : ""}>
                <Check size={14} strokeWidth={3} aria-hidden="true" /> {r.texto}
                <span className="rs-sr">{ok ? " (atendido)" : " (pendente)"}</span>
              </li>
            );
          })}
        </ul>

        <Campo id="nova-confirmar" rotulo="Confirmar nova senha" icone={Lock} erro={erros.confirmar}>
          <input
            id="nova-confirmar"
            name="confirmar"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirmar}
            onChange={atualizar}
            aria-invalid={!!erros.confirmar}
          />
        </Campo>

        {erros.geral && (
          <p className="auth-erro" role="alert">
            {erros.geral} <Link to="/recuperar-senha" className="auth-link-forte">Pedir novo link</Link>
          </p>
        )}

        <button type="submit" className="auth-botao" disabled={enviando}>
          {enviando ? (
            <>
              <LoaderCircle size={18} className="auth-girando" aria-hidden="true" /> Salvando...
            </>
          ) : (
            <>
              Salvar nova senha <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
