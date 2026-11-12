import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarCheck, CircleCheck, Eye, EyeOff, Info, LoaderCircle, Lock, LogOut, Mail, UserRound } from "lucide-react";
import AuthLayout, { Campo } from "../layouts/AuthLayout.jsx";
import { emailValido } from "../utils/mascaras.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { useSessao } from "../hooks/useSessao.js";
import { contasDemo, entrar as entrarNaConta, inicioDaConta, sair } from "../services/sessaoService.js";

// Só aceita voltar para páginas do próprio site (evita redirecionar para fora).
const destinoSeguro = (de) => (typeof de === "string" && de.startsWith("/") && !de.startsWith("//") && de !== "/login" ? de : null);

export default function Login() {
  useTitulo("Entrar");
  const location = useLocation();
  const navigate = useNavigate();
  const sessao = useSessao();
  // Vindo da troca de senha: mostra o aviso e já preenche o e-mail.
  const [form, setForm] = useState({ email: location.state?.email ?? "", senha: "", lembrar: false });
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sucesso, setSucesso] = useState(location.state?.aviso ?? "");

  function atualizar(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function validar() {
    const novos = {};
    if (!form.email.trim()) novos.email = "Informe seu e-mail.";
    else if (!emailValido(form.email)) novos.email = "Digite um e-mail válido.";
    if (!form.senha) novos.senha = "Informe sua senha.";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function entrar(e) {
    e.preventDefault();
    setAviso("");
    setSucesso("");
    if (!validar()) return;

    setEnviando(true);
    try {
      const nova = await entrarNaConta(form.email, form.senha, form.lembrar);
      // Volta para onde a pessoa estava (ex.: o agendamento). A empresa vai sempre para o painel.
      const de = destinoSeguro(location.state?.de);
      const destino = nova.tipo === "usuario" && de && !de.startsWith("/empresa") ? de : inicioDaConta(nova);
      navigate(destino, { replace: true });
    } catch (erro) {
      setEnviando(false);
      setAviso(erro.message);
    }
  }

  function preencher(email) {
    setForm((f) => ({ ...f, email, senha: f.senha || "demo1234" }));
    setErros({});
  }

  return (
    <AuthLayout
      topo={
        <>
          <span>Ainda não tem conta?</span>
          <Link
            to={location.state?.motivo ? "/cadastro/usuario" : "/cadastro"}
            state={location.state?.motivo ? location.state : undefined}
            className="auth-link-forte"
          >
            Criar conta
          </Link>
        </>
      }
    >
      {sessao && !enviando && (
        <div className="auth-logado" role="status">
          <span className="auth-logado-avatar" aria-hidden="true">{sessao.avatar}</span>
          <div>
            <strong>Você já está conectado</strong>
            <span>como {sessao.nome}</span>
          </div>
          <div className="auth-logado-acoes">
            <Link to={inicioDaConta(sessao)} className="auth-botao">
              {sessao.tipo === "empresa" ? "Ir para o painel" : "Ir para minha área"} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button type="button" className="auth-botao auth-botao-contorno" onClick={sair}>
              <LogOut size={16} aria-hidden="true" /> Sair
            </button>
          </div>
        </div>
      )}

      {location.state?.motivo && (
        <p className="auth-aviso auth-motivo" role="status">
          <CalendarCheck size={18} aria-hidden="true" />
          <span>
            Entre na sua conta para {location.state.motivo === "remarcar" ? "remarcar" : "confirmar"} sua reserva
            {location.state.quadra ? <> na <strong>{location.state.quadra}</strong></> : null}. O horário que você escolheu
            fica guardado.
          </span>
        </p>
      )}

      <header className="auth-cabecalho">
        <h2>Bem-vindo de volta!</h2>
        <p>Entre na sua conta para reservar sua próxima partida.</p>
      </header>

      <form className="auth-form" onSubmit={entrar} noValidate>
        <Campo id="login-email" rotulo="E-mail" icone={Mail} erro={erros.email}>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            value={form.email}
            onChange={atualizar}
            aria-invalid={!!erros.email}
            aria-describedby={erros.email ? "login-email-erro" : undefined}
          />
        </Campo>

        <Campo
          id="login-senha"
          rotulo="Senha"
          icone={Lock}
          erro={erros.senha}
          acao={
            <Link
              to={form.email && emailValido(form.email) ? `/recuperar-senha?email=${encodeURIComponent(form.email)}` : "/recuperar-senha"}
              className="auth-link"
            >
              Esqueci minha senha
            </Link>
          }
        >
          <input
            id="login-senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={form.senha}
            onChange={atualizar}
            aria-invalid={!!erros.senha}
            aria-describedby={erros.senha ? "login-senha-erro" : undefined}
          />
          <button
            type="button"
            className="auth-input-botao"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={mostrarSenha}
          >
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </Campo>

        <label className="auth-checkbox">
          <input type="checkbox" name="lembrar" checked={form.lembrar} onChange={atualizar} />
          <span>Manter conectado</span>
        </label>

        {sucesso && (
          <p className="auth-aviso auth-aviso-ok" role="status">
            <CircleCheck size={18} aria-hidden="true" />
            {sucesso}
          </p>
        )}

        {aviso && (
          <p className="auth-aviso" role="status">
            <Info size={18} aria-hidden="true" />
            {aviso}
          </p>
        )}

        <button type="submit" className="auth-botao" disabled={enviando}>
          {enviando ? (
            <>
              <LoaderCircle size={18} className="auth-girando" aria-hidden="true" /> Entrando...
            </>
          ) : (
            <>
              Entrar <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="auth-separador">
        <span>ou</span>
      </div>

      <button
        type="button"
        className="auth-botao auth-botao-contorno"
        onClick={() => setAviso("O login com Google será implementado em breve.")}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.16 13.22l7.98 6.19C13.03 13.72 18.1 9.5 24 9.5Z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.78 46.98 24.55Z" />
          <path fill="#FBBC05" d="M10.14 28.59A14.4 14.4 0 0 1 9.36 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.58-6.19Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-5.9 0-10.97-4.22-12.86-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z" />
        </svg>
        Continuar com Google
      </button>

      <div className="auth-demo">
        <p>
          <UserRound size={16} aria-hidden="true" /> <strong>Demonstração:</strong> qualquer e-mail e senha entram como
          jogador. Ou use uma das contas:
        </p>
        <div>
          {Object.values(contasDemo).map((c) => (
            <button key={c.email} type="button" onClick={() => preencher(c.email)}>
              <span>{c.rotulo}</span>
              {c.email}
            </button>
          ))}
        </div>
      </div>

      <p className="auth-nota">
        Tem uma quadra e quer anunciar?{" "}
        <Link to="/cadastro/empresa" className="auth-link-forte">
          Fale com a gente
        </Link>
      </p>
    </AuthLayout>
  );
}
