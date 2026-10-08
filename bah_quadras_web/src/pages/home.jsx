import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      <h1>Bem-vindo, {usuario?.nome}!</h1>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}
