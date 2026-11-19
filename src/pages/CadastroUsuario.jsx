import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import AuthLayout, { Campo, ForcaSenha } from "../layouts/AuthLayout.jsx";
import { emailValido, mascaraTelefone, telefoneValido } from "../utils/mascaras.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { cadastrar as criarConta } from "../services/sessaoService.js";

export default function CadastroUsuario() {
  useTitulo("Criar conta de jogador");
  const location = useLocation();
  // Veio do agendamento (via Login): depois de criar a conta, volta para a reserva.
  const deReserva = typeof location.state?.de === "string" && location.state.de.startsWith("/agendamento/") ? location.state.de : null;
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
    termos: false,
  });
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [aviso, setAviso] = useState("");

  function atualizar(e) {
    const { name, value, type, checked } = e.target;
    const valor = type === "checkbox" ? checked : name === "telefone" ? mascaraTelefone(value) : value;
    setForm((f) => ({ ...f, [name]: valor }));
    if (erros[name]) setErros((atual) => ({ ...atual, [name]: "" }));
  }

  function validar() {
    const e = {};
    if (form.nome.trim().split(/\s+/).length < 2) e.nome = "Informe nome e sobrenome.";
    if (!emailValido(form.email)) e.email = "Digite um e-mail válido.";
    if (!telefoneValido(form.telefone)) e.telefone = "Digite um telefone com DDD.";
    if (form.senha.length < 8) e.senha = "A senha precisa ter pelo menos 8 caracteres.";
    if (form.confirmar !== form.senha) e.confirmar = "As senhas não coincidem.";
    if (!form.termos) e.termos = "Você precisa aceitar os termos para continuar.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function cadastrar(e) {
    e.preventDefault();
    setAviso("");
    if (!validar()) return;

    setEnviando(true);
    try {
      await criarConta(form); // cria a conta na API e já entra nela
      setConcluido(true);
    } catch (erro) {
      // E-mail repetido aparece no próprio campo; o resto, num aviso acima do botão.
      if (erro.status === 409) setErros((atual) => ({ ...atual, email: erro.message }));
      else setAviso(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  const topo = (
    <>
      <span>Já tem conta?</span>
      <Link to="/login" className="auth-link-forte">
        Entrar
      </Link>
    </>
  );

  if (concluido) {
    return (
      <AuthLayout topo={topo}>
        <div className="auth-sucesso">
          <CircleCheck size={56} aria-hidden="true" />
          <h2>Conta criada, {form.nome.split(" ")[0]}!</h2>
          <p>
            Sua conta foi criada e você já está conectado com <strong>{form.email}</strong>.
          </p>
          <div className="rs-reenviar cad-acoes">
            {deReserva ? (
              <Link to={deReserva} className="auth-botao">
                Continuar a reserva <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <Link to="/" className="auth-botao">
                Encontrar quadras <ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
            <Link to="/usuario/perfil" className="auth-botao auth-botao-contorno">
              Ir para minha área
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      topo={topo}
      titulo="Sua quadra favorita"
      destaque="a um clique."
      texto="Crie sua conta grátis e reserve horários sem precisar ligar para ninguém."
      vantagens={[
        "Cadastro grátis e rápido",
        "Acompanhe todas as suas reservas",
        "Avalie as quadras onde jogou",
      ]}
    >
      <Link to="/cadastro" className="auth-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar
      </Link>

      <header className="auth-cabecalho">
        <h2>Criar conta de jogador</h2>
        <p>Leva menos de um minuto.</p>
      </header>

      <form className="auth-form" onSubmit={cadastrar} noValidate>
        <Campo id="cad-nome" rotulo="Nome completo" icone={User} erro={erros.nome}>
          <input
            id="cad-nome"
            name="nome"
            autoComplete="name"
            placeholder="Seu nome e sobrenome"
            value={form.nome}
            onChange={atualizar}
            aria-invalid={!!erros.nome}
          />
        </Campo>

        <div className="auth-form-duas">
          <Campo id="cad-email" rotulo="E-mail" icone={Mail} erro={erros.email}>
            <input
              id="cad-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={form.email}
              onChange={atualizar}
              aria-invalid={!!erros.email}
            />
          </Campo>

          <Campo id="cad-telefone" rotulo="Celular" icone={Phone} erro={erros.telefone}>
            <input
              id="cad-telefone"
              name="telefone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(51) 99999-9999"
              value={form.telefone}
              onChange={atualizar}
              aria-invalid={!!erros.telefone}
            />
          </Campo>
        </div>

        <Campo id="cad-senha" rotulo="Senha" icone={Lock} erro={erros.senha}>
          <input
            id="cad-senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={form.senha}
            onChange={atualizar}
            aria-invalid={!!erros.senha}
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

        <ForcaSenha senha={form.senha} />

        <Campo id="cad-confirmar" rotulo="Confirmar senha" icone={Lock} erro={erros.confirmar}>
          <input
            id="cad-confirmar"
            name="confirmar"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirmar}
            onChange={atualizar}
            aria-invalid={!!erros.confirmar}
          />
        </Campo>

        <div>
          <label className="auth-checkbox">
            <input type="checkbox" name="termos" checked={form.termos} onChange={atualizar} />
            <span>
              Li e aceito os{" "}
              <Link to="/termos" target="_blank" className="auth-link-forte">Termos de Uso</Link> e a{" "}
              <Link to="/privacidade" target="_blank" className="auth-link-forte">Política de Privacidade</Link>.
            </span>
          </label>
          {erros.termos && (
            <p className="auth-erro" role="alert">
              {erros.termos}
            </p>
          )}
        </div>

        {aviso && (
          <p className="auth-aviso" role="alert">
            <Info size={18} aria-hidden="true" />
            {aviso}
          </p>
        )}

        <button type="submit" className="auth-botao" disabled={enviando}>
          {enviando ? (
            <>
              <LoaderCircle size={18} className="auth-girando" aria-hidden="true" /> Criando conta...
            </>
          ) : (
            <>
              Criar conta <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
