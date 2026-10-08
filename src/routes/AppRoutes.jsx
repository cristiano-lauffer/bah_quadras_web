import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import CadastroUsuario from "../pages/cadastroUsuario";
import CadastroEmpresa from "../pages/cadastroEmpresa";
import PerfilEmpresa from "../pages/perfilEmpresa";
import EditarPerfilEmpresa from "../pages/editarPerfilEmpresa";
import NotFound from "../pages/NotFound";

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

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}