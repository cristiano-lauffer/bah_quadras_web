import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarCheck, CircleCheck, Eye, EyeOff, Info, LoaderCircle, Lock, LogOut, Mail } from "lucide-react";
import AuthLayout, { Campo } from "../layouts/AuthLayout.jsx";
import { emailValido } from "../utils/mascaras.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { useSessao } from "../hooks/useSessao.js";
import { entrar as entrarNaConta, inicioDaConta, sair } from "../services/sessaoService.js";

// Só aceita voltar para páginas do próprio site (evita redirecionar para fora).
const destinoSeguro = (de) => (typeof de === "string" && de.startsWith("/") && !de.startsWith("//") && de !== "/login" ? de : null);

export default function Login() {
  useTitulo("Entrar");
  const location = useLocation();
  const navigate = useNavigate();
  const sessao = useSessao();
  const vemDeReserva = ["reservar", "remarcar"].includes(location.state?.motivo);
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
      // Volta para onde a pessoa estava, se for uma página do tipo de conta dela
      // (jogador não volta para /empresa e a empresa não volta para /usuario nem para reservas).
      const de = destinoSeguro(location.state?.de);
      const daEmpresa = de?.startsWith("/empresa") || de === "/perfil";
      const podeVoltar = de && (nova.tipo === "empresa" ? daEmpresa : !daEmpresa);
      const destino = podeVoltar ? de : inicioDaConta(nova);
      navigate(destino, { replace: true });
    } catch (erro) {
      setEnviando(false);
      setAviso(erro.message);
    }
  }

  return (
    <AuthLayout
      topo={
        <>
          <span>Ainda não tem conta?</span>
          <Link
            to={vemDeReserva ? "/cadastro/usuario" : "/cadastro"}
            state={vemDeReserva ? location.state : undefined}
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
            <button type="button" className="auth-botao auth-botao-contorno" onClick={() => sair()}>
              <LogOut size={16} aria-hidden="true" /> Sair
            </button>
          </div>
        </div>
      )}

      {(location.state?.motivo === "reservar" || location.state?.motivo === "remarcar") && (
        <p className="auth-aviso auth-motivo" role="status">
          <CalendarCheck size={18} aria-hidden="true" />
          <span>
            Entre na sua conta para {location.state.motivo === "remarcar" ? "remarcar" : "confirmar"} sua reserva
            {location.state.quadra ? <> na <strong>{location.state.quadra}</strong></> : null}. O horário que você escolheu
            fica guardado.
          </span>
        </p>
      )}
      {["favoritar", "avaliar"].includes(location.state?.motivo) && (
        <p className="auth-aviso auth-motivo" role="status">
          <Lock size={18} aria-hidden="true" />
          <span>
            Entre com sua conta de jogador para{" "}
            {location.state.motivo === "avaliar" ? "avaliar quadras" : "salvar quadras nas favoritas"}.
          </span>
        </p>
      )}
      {(location.state?.motivo === "area" || location.state?.motivo === "outra-conta") && (
        <p className="auth-aviso auth-motivo" role="status">
          <Lock size={18} aria-hidden="true" />
          <span>
            {location.state.area === "empresa"
              ? "O painel da empresa é só para empresas parceiras."
              : location.state.area === "admin"
                ? "Esta página é só para a administração do Bah Quadras."
                : "Esta página é da área do jogador."}{" "}
            {location.state.motivo === "outra-conta"
              ? "Você está conectado com outra conta: entre com a conta certa para continuar."
              : "Entre na sua conta para continuar."}
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

      <p className="auth-nota">
        Tem uma quadra e quer anunciar?{" "}
        <Link to="/cadastro/empresa" className="auth-link-forte">
          Fale com a gente
        </Link>
      </p>
    </AuthLayout>
  );
}
