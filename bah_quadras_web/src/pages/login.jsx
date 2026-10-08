import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tela, setTela] = useState('login');
  const { login, cadastrar } = useAuth();
  const navigate = useNavigate();

  // Campos do login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Campos do cadastro
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroEmail, setCadastroEmail] = useState('');
  const [cadastroSenha, setCadastroSenha] = useState('');
  const [cadastroConfirmar, setCadastroConfirmar] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const usuario = await login(loginEmail, loginSenha);
      // Redireciona pelo papel do usuário
      if (usuario.papel === 'empresa' || usuario.papel === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');

    if (cadastroSenha !== cadastroConfirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (cadastroSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      await cadastrar(cadastroNome, cadastroEmail, cadastroSenha);
      // Após cadastrar, já faz login automaticamente
      await login(cadastroEmail, cadastroSenha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function trocarTela(novaTela) {
    setTela(novaTela);
    setErro('');
  }

  return (
    <div className="container">
      <div className="card">
        <h1>BAH QUADRAS</h1>

        {erro && (
          <p style={{ color: 'red', marginBottom: '8px', fontSize: '14px' }}>
            {erro}
          </p>
        )}

        {tela === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2>Entrar</h2>

            <input
              type="email"
              placeholder="E-mail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              required
            />

            <button type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

            <p>
              Ainda não tem uma conta?
              <span onClick={() => trocarTela('cadastro')}> Cadastre-se</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCadastro}>
            <h2>Cadastro</h2>

            <input
              type="text"
              placeholder="Nome"
              value={cadastroNome}
              onChange={(e) => setCadastroNome(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="E-mail"
              value={cadastroEmail}
              onChange={(e) => setCadastroEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={cadastroSenha}
              onChange={(e) => setCadastroSenha(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirmar senha"
              value={cadastroConfirmar}
              onChange={(e) => setCadastroConfirmar(e.target.value)}
              required
            />

            <button type="submit" disabled={carregando}>
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>

            <p>
              Já possui uma conta?
              <span onClick={() => trocarTela('login')}> Entrar</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
