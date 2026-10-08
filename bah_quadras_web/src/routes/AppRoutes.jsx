import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/home';
import Login from '../pages/login';
import NotFound from '../pages/NotFound';

// Rota privada — redireciona para /login se não estiver autenticado
function RotaPrivada({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  return usuario ? children : <Navigate to="/login" replace />;
}

// Rota pública — redireciona para / se já estiver logado
function RotaPublica({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  return !usuario ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública — qualquer um acessa */}
        <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />

        {/* Rota privada — só acessa logado */}
        <Route path="/" element={<RotaPrivada><Home /></RotaPrivada>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
