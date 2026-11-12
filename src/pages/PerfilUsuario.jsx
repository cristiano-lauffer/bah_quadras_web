import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import UsuarioLayout from "../layouts/UsuarioLayout.jsx";
import Toast from "../components/Toast.jsx";
import SecaoInicio from "../components/perfil/SecaoInicio.jsx";
import SecaoFavoritas from "../components/perfil/SecaoFavoritas.jsx";
import SecaoDados from "../components/perfil/SecaoDados.jsx";
import SecaoConfiguracoes from "../components/perfil/SecaoConfiguracoes.jsx";
import { useDados } from "../hooks/useDados.js";
import { dadosDoUsuario, salvarDadosDoUsuario } from "../services/usuarioService.js";
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

  // Dados salvos do jogador (ou o nome/e-mail de quem entrou, na primeira vez).
  const [usuario, setUsuario] = useState(dadosDoUsuario);
  // Favoritos salvos (os mesmos do coração nos cards da Home).
  const { dados: favoritosSalvos, recarregar: recarregarFavoritos } = useDados(listarFavoritos);
  const favoritos = favoritosSalvos ?? [];
  const [foto, setFoto] = useState("");
  const [toast, setToast] = useState("");

  // Libera a URL temporária da foto quando ela muda ou a página fecha.
  useEffect(() => () => foto && URL.revokeObjectURL(foto), [foto]);

  const primeiroNome = usuario.nome.split(" ")[0];
  const avatar = foto ? <img src={foto} alt="" /> : iniciais(usuario.nome);

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
          usuario={usuario}
          avatar={avatar}
          onFoto={(arquivo) => {
            setFoto(URL.createObjectURL(arquivo));
            setToast("Foto atualizada nesta demonstração.");
          }}
          onSalvar={async (dados) => {
            setUsuario(dados);
            await salvarDadosDoUsuario(dados);
            setToast("Seus dados foram salvos!");
          }}
        />
      )}
      {secao === "configuracoes" && <SecaoConfiguracoes onAviso={setToast} />}

      <Toast mensagem={toast} onFechar={() => setToast("")} />
    </UsuarioLayout>
  );
}
