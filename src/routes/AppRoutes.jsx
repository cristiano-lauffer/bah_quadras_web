import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import CadastroUsuario from "../pages/CadastroUsuario";
import CadastroEmpresa from "../pages/CadastroEmpresa";
import PerfilEmpresa from "../pages/PerfilEmpresa";
import EditarPerfilEmpresa from "../pages/EditarPerfilEmpresa";
import PerfilUsuario from "../pages/PerfilUsuario";
import Quadras from "../pages/Quadras";
import Avaliacoes from "../pages/Avaliacoes";
import Agendamento from "../pages/Agendamento";
import NotFound from "../pages/NotFound";
import MinhasReservas from "../pages/MinhasReservas";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route
          path="/cadastro/usuario"
          element={<CadastroUsuario />}
        />

        <Route
          path="/cadastro/empresa"
          element={<CadastroEmpresa />}
        />

        <Route
          path="/empresa/perfil"
          element={<PerfilEmpresa />}
        />

        <Route
          path="/empresa/editar"
          element={<EditarPerfilEmpresa />}
        />

        <Route 
          path="/avaliacoes" element={<Avaliacoes />} 
        />

        <Route 
          path="/agendamento" element={<Agendamento />} 
        />

        <Route 
          path="/agendamento/:id" element={<Agendamento />} 
        />

        <Route
          path="/empresa/quadras"
          element={<Quadras />}
        />

        <Route
          path="/usuario/reservas"
          element={<MinhasReservas />}
        />

        <Route
          path="/perfil"
          element={<Navigate to="/empresa/perfil" replace />}
        />

        <Route path="/usuario/perfil" element={<PerfilUsuario />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

  );
}