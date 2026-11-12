import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import RolarParaTopo from "../components/RolarParaTopo";
import CarregandoPagina from "../components/CarregandoPagina";
import LimiteDeErro from "../components/LimiteDeErro";

// A Home é a porta de entrada: carrega junto com o site.
// As demais páginas viram arquivos separados, baixados só quando abertas
// (quem visita só a Home não baixa, por exemplo, o painel da empresa).
const Login = lazy(() => import("../pages/Login"));
const RecuperarSenha = lazy(() => import("../pages/RecuperarSenha"));
const RedefinirSenha = lazy(() => import("../pages/RedefinirSenha"));
const Termos = lazy(() => import("../pages/Termos"));
const Privacidade = lazy(() => import("../pages/Privacidade"));
const Cadastro = lazy(() => import("../pages/Cadastro"));
const CadastroUsuario = lazy(() => import("../pages/CadastroUsuario"));
const CadastroEmpresa = lazy(() => import("../pages/CadastroEmpresa"));
const DetalhesQuadra = lazy(() => import("../pages/DetalhesQuadra"));
const Agendamento = lazy(() => import("../pages/Agendamento"));
const Avaliacoes = lazy(() => import("../pages/Avaliacoes"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Área do jogador
const PerfilUsuario = lazy(() => import("../pages/PerfilUsuario"));
const MinhasReservas = lazy(() => import("../pages/MinhasReservas"));
const NotificacoesUsuario = lazy(() => import("../pages/NotificacoesUsuario"));

// Área da empresa
const DashboardEmpresa = lazy(() => import("../pages/DashboardEmpresa"));
const ReservasEmpresa = lazy(() => import("../pages/ReservasEmpresa"));
const QuadrasEmpresa = lazy(() => import("../pages/QuadrasEmpresa"));
const CadastroQuadra = lazy(() => import("../pages/CadastroQuadra"));
const EditarQuadra = lazy(() => import("../pages/EditarQuadra"));
const HorariosQuadra = lazy(() => import("../pages/HorariosQuadra"));
const FinanceiroEmpresa = lazy(() => import("../pages/FinanceiroEmpresa"));
const AvaliacoesEmpresa = lazy(() => import("../pages/AvaliacoesEmpresa"));
const Notificacoes = lazy(() => import("../pages/Notificacoes"));
const PerfilEmpresa = lazy(() => import("../pages/PerfilEmpresa"));
const EditarPerfilEmpresa = lazy(() => import("../pages/EditarPerfilEmpresa"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RolarParaTopo />
      <Paginas />
    </BrowserRouter>
  );
}

// Se uma página quebrar ou não carregar, mostra uma tela com "Recarregar" em vez de
// ficar em branco. O key faz a proteção recomeçar a cada troca de página.
function Paginas() {
  const { pathname } = useLocation();
  return (
    <LimiteDeErro key={pathname}>
      <Suspense fallback={<CarregandoPagina />}>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cadastro/usuario" element={<CadastroUsuario />} />
          <Route path="/cadastro/empresa" element={<CadastroEmpresa />} />
          <Route path="/quadra/:id" element={<DetalhesQuadra />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/agendamento/:id" element={<Agendamento />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/avaliacoes/:id" element={<Avaliacoes />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />

          {/* Área do jogador */}
          <Route path="/usuario/perfil" element={<PerfilUsuario />} />
          <Route path="/usuario/reservas" element={<MinhasReservas />} />
          <Route path="/usuario/notificacoes" element={<NotificacoesUsuario />} />

          {/* Área da empresa */}
          <Route path="/empresa" element={<Navigate to="/empresa/dashboard" replace />} />
          <Route path="/empresa/dashboard" element={<DashboardEmpresa />} />
          <Route path="/empresa/reservas" element={<ReservasEmpresa />} />
          <Route path="/empresa/quadras" element={<QuadrasEmpresa />} />
          <Route path="/empresa/quadras/nova" element={<CadastroQuadra />} />
          <Route path="/empresa/quadras/:id/editar" element={<EditarQuadra />} />
          <Route path="/empresa/quadras/:id/horarios" element={<HorariosQuadra />} />
          <Route path="/empresa/financeiro" element={<FinanceiroEmpresa />} />
          <Route path="/empresa/avaliacoes" element={<AvaliacoesEmpresa />} />
          <Route path="/empresa/notificacoes" element={<Notificacoes />} />
          <Route path="/empresa/perfil" element={<PerfilEmpresa />} />
          <Route path="/empresa/editar" element={<EditarPerfilEmpresa />} />
          <Route path="/perfil" element={<Navigate to="/empresa/perfil" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LimiteDeErro>
  );
}
