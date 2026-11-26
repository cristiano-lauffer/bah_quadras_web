import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { listarQuadrasPublicas } from "./services/catalogoService.js";

// Já busca as quadras das empresas na API: as páginas que leem o catálogo na hora
// (favoritas, minhas reservas, avaliações) encontram essas quadras sem esperar.
listarQuadrasPublicas();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);