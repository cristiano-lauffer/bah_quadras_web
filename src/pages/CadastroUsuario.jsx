import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import AuthLayout, { Campo } from "../layouts/AuthLayout.jsx";
import { emailValido, forcaSenha, mascaraTelefone, telefoneValido } from "../utils/mascaras.js";
import { useTitulo } from "../hooks/useTitulo.js";

const niveisSenha = ["", "Fraca", "Razoável", "Boa", "Forte"];

export default function CadastroUsuario() {
  useTitulo("Criar conta de jogador");
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
  const forca = forcaSenha(form.senha);

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

  function cadastrar(e) {
    e.preventDefault();
    if (!validar()) return;

    // TODO: enviar os dados para o backend.
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setConcluido(true);
    }, 900);
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
            Esta é uma demonstração: os dados ainda não foram salvos no servidor. Quando o backend
            estiver conectado, você já poderá entrar com <strong>{form.email}</strong>.
          </p>
          <Link to="/" className="auth-botao">
            Encontrar quadras <ArrowRight size={18} aria-hidden="true" />
          </Link>
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

        {form.senha && (
          <div className={`auth-forca nivel-${forca}`} aria-live="polite">
            <div className="auth-forca-barras">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= forca ? "ativa" : ""} />
              ))}
            </div>
            <small>Senha {niveisSenha[forca].toLowerCase()}</small>
          </div>
        )}

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
            <span>Li e aceito os Termos de Uso e a Política de Privacidade.</span>
          </label>
          {erros.termos && (
            <p className="auth-erro" role="alert">
              {erros.termos}
            </p>
          )}
        </div>

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
