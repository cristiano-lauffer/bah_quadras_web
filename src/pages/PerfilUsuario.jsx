import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import Toast from "../components/Toast.jsx";
import SecaoInicio from "../components/perfil/SecaoInicio.jsx";
import SecaoFavoritas from "../components/perfil/SecaoFavoritas.jsx";
import SecaoDados from "../components/perfil/SecaoDados.jsx";
import SecaoConfiguracoes from "../components/perfil/SecaoConfiguracoes.jsx";
import { useDados } from "../hooks/useDados.js";
import { carregarDadosDoUsuario, dadosDoUsuario, salvarDadosDoUsuario, salvarFoto } from "../services/usuarioService.js";
import { listarQuadrasPublicas } from "../services/catalogoService.js";
import { lerArquivo } from "../services/uploadService.js";
import { listarReservas, separarReservas } from "../services/reservasService.js";
import { listarFavoritos, removerFavorito as removerFavoritoSalvo } from "../services/favoritosService.js";
import { iniciais } from "../utils/formatadores.js";
import "../css/PerfilUsuario.css";

// As reservas ficam na página própria (/usuario/reservas).
const secoes = {
  inicio: "Início",
  favoritas: "Quadras favoritas",
  dados: "Meus dados",
  configuracoes: "Configurações",
};


export default function PerfilUsuario() {
  const [searchParams] = useSearchParams();
  const secao = secoes[searchParams.get("secao")] ? searchParams.get("secao") : "inicio";

  const { dados: listaReservas } = useDados(listarReservas);
  const resumo = separarReservas(listaReservas ?? []);

  // Dados da conta (API). Até chegar, mostra o que a sessão já sabe (nome e e-mail).
  const { dados: usuarioCarregado } = useDados(carregarDadosDoUsuario);
  const [editado, setEditado] = useState(null);
  const usuario = editado ?? usuarioCarregado ?? dadosDoUsuario();
  // Favoritos salvos (os mesmos do coração nos cards da Home) e o catálogo para mostrar as quadras.
  const { dados: favoritosSalvos, recarregar: recarregarFavoritos } = useDados(listarFavoritos);
  useDados(listarQuadrasPublicas);
  const favoritos = favoritosSalvos ?? [];
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [toast, setToast] = useState("");

  const primeiroNome = usuario.nome.split(" ")[0];
  const avatar = usuario.foto ? <img src={usuario.foto} alt="" /> : iniciais(usuario.nome);

  async function removerFavorito(id) {
    await removerFavoritoSalvo(id);
    recarregarFavoritos();
    setToast("Quadra removida dos favoritos.");
  }

  return (
    <UsuarioLayout
      proximasReservas={resumo.proximas.length}
      perfil={{ nome: usuario.nome, subtitulo: usuario.email, avatar }}
      titulo={secao === "inicio" ? `Olá, ${primeiroNome}!` : secoes[secao]}
      tituloAba={secao === "inicio" ? "Minha área" : secoes[secao]}
      subtitulo={secao === "inicio" ? "Bom te ver por aqui. Bora marcar o próximo jogo?" : undefined}
      acoes={
        <Link to="/#quadras" className="pn-botao">
          <Plus size={18} aria-hidden="true" /> Nova reserva
        </Link>
      }
    >
      {secao === "inicio" && (
        <SecaoInicio usuario={usuario} favoritos={favoritos} resumo={resumo} onRemoverFavorito={removerFavorito} />
      )}
      {secao === "favoritas" && <SecaoFavoritas favoritos={favoritos} onRemover={removerFavorito} />}
      {secao === "dados" && (
        <SecaoDados
          key={usuarioCarregado ? "carregado" : "inicial"}
          usuario={usuario}
          avatar={avatar}
          enviandoFoto={enviandoFoto}
          onFoto={async (arquivo) => {
            if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) return setToast("Use uma foto JPG, PNG ou WebP.");
            if (arquivo.size > 5 * 1024 * 1024) return setToast("A foto precisa ter até 5 MB.");
            setEnviandoFoto(true);
            try {
              setEditado(await salvarFoto(await lerArquivo(arquivo)));
              setToast("Foto de perfil atualizada!");
            } catch (erro) {
              setToast(erro.message);
            } finally {
              setEnviandoFoto(false);
            }
          }}
          onSalvar={async (dados) => {
            try {
              setEditado(await salvarDadosDoUsuario(dados));
              setToast("Seus dados foram salvos!");
              return true;
            } catch (erro) {
              setToast(erro.message);
              return false;
            }
          }}
        />
      )}
      {secao === "configuracoes" && <SecaoConfiguracoes key={usuarioCarregado ? "carregado" : "inicial"} onAviso={setToast} />}

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </UsuarioLayout>
  );
}
