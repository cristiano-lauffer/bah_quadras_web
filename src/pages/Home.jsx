import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchX } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import HomeHero from "../components/home/HomeHero.jsx";
import HomeNumeros from "../components/home/HomeNumeros.jsx";
import HomeEsportes from "../components/home/HomeEsportes.jsx";
import HomeFiltros from "../components/home/HomeFiltros.jsx";
import CardQuadra from "../components/home/CardQuadra.jsx";
import HomeComoFunciona from "../components/home/HomeComoFunciona.jsx";
import HomeDepoimentos from "../components/home/HomeDepoimentos.jsx";
import HomeCtaEmpresa from "../components/home/HomeCtaEmpresa.jsx";
import { avaliacoes } from "../data/avaliacoes.js";
import { useTitulo } from "../hooks/useTitulo.js";
import { useDados } from "../hooks/useDados.js";
import { alternarFavorito, listarFavoritos } from "../services/favoritosService.js";
import {
  disponiveisParaReserva,
  listarQuadrasPublicas,
  modalidadesDe,
  quadrasPublicas,
} from "../services/catalogoService.js";
import { normalizar, semAvaliacoes } from "../utils/formatadores.js";
import { cidadesDe, faixasPreco, ordenacoes } from "../utils/filtrosQuadras.js";
import "../css/Home.css";

function irParaQuadras() {
  document.getElementById("quadras")?.scrollIntoView({ behavior: "smooth" });
}

const CARDS_NO_CELULAR = 8;

export default function Home() {
  useTitulo("Encontre sua quadra");
  const { hash } = useLocation();

  // Catálogo: quadras de demonstração + as cadastradas pela empresa no painel.
  // A leitura imediata evita a lista "piscar" enquanto a versão assíncrona chega.
  const { dados: catalogoCarregado } = useDados(listarQuadrasPublicas);
  const catalogo = disponiveisParaReserva(catalogoCarregado ?? quadrasPublicas());

  const [busca, setBusca] = useState("");
  const [modalidadeEscolhida, setModalidade] = useState("todas");
  const [ordem, setOrdem] = useState("relevancia");
  const [cidadeEscolhida, setCidade] = useState("todas");
  const [faixaPreco, setFaixaPreco] = useState("qualquer");
  const [expandidaPara, setExpandidaPara] = useState(null);

  // Favoritos salvos (os mesmos da aba "Favoritas" do perfil do jogador).
  const { dados: favoritosSalvos } = useDados(listarFavoritos);
  const [favoritosLocais, setFavoritosLocais] = useState(null);
  const favoritos = new Set(favoritosLocais ?? favoritosSalvos ?? []);

  // Faz os links "/#quadras" e "/#sobre" do Header rolarem até a seção.
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  /* ---------- Dados derivados do catálogo ---------- */
  // Modalidades em ordem alfabética (iguais no menu da busca, no "Esporte" e nos blocos).
  const modalidades = modalidadesDe(catalogo).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const cidades = cidadesDe(catalogo);
  // Se a modalidade ou a cidade escolhida deixar de existir (ex.: a empresa desativou a
  // única quadra de vôlei), volta para "todas" em vez de mostrar a lista vazia.
  const modalidade = modalidadeEscolhida === "todas" || modalidades.includes(modalidadeEscolhida) ? modalidadeEscolhida : "todas";
  const cidade = cidadeEscolhida === "todas" || cidades.includes(cidadeEscolhida) ? cidadeEscolhida : "todas";
  // Para o menu "Esporte": cada modalidade com quantas opções tem.
  const opcoesModalidade = modalidades.map((nome) => ({
    nome,
    quantidade: catalogo.filter((q) => q.modalidade === nome).length,
  }));

  // No celular a lista começa com 8 quadras (o resto aparece no "Ver mais").
  // Mudar a busca ou um filtro volta a mostrar só as primeiras.
  const chaveFiltros = [busca, modalidade, cidade, faixaPreco, ordem].join("|");
  const expandida = expandidaPara === chaveFiltros;
  const avaliadas = catalogo.filter((q) => !semAvaliacoes(q));
  const totalAvaliacoes = avaliadas.reduce((soma, q) => soma + q.quantidadeAvaliacoes, 0);
  const mediaGeral = avaliadas.length ? avaliadas.reduce((soma, q) => soma + q.avaliacao, 0) / avaliadas.length : 0;
  const capas = Object.fromEntries(
    modalidades.map((m) => {
      const lista = catalogo.filter((q) => q.modalidade === m);
      return [m, { imagem: lista.find((q) => q.imagens[0])?.imagens[0], total: lista.length }];
    })
  );
  const depoimentos = avaliacoes
    .filter((a) => a.nota === 5)
    .sort((a, b) => b.util - a.util)
    .slice(0, 3)
    .map((a) => ({ ...a, quadra: catalogo.find((q) => q.id === a.quadraId) }));

  const termo = normalizar(busca);
  const resultado = catalogo
    .filter((q) => modalidade === "todas" || q.modalidade === modalidade)
    .filter((q) => cidade === "todas" || q.cidade === cidade)
    .filter((q) => faixasPreco[faixaPreco].aceita(q.preco))
    .filter((q) => [q.nome, q.modalidade, q.bairro, q.cidade].some((campo) => normalizar(campo).includes(termo)))
    .sort(ordenacoes[ordem].fn);

  const filtrosAtivos = [busca.trim(), modalidade !== "todas", cidade !== "todas", faixaPreco !== "qualquer"].filter(Boolean).length;

  function escolherModalidade(m) {
    setModalidade(m);
    irParaQuadras();
  }

  function trocarFavorito(id) {
    // Atualiza a tela na hora e salva em seguida.
    const atual = favoritosLocais ?? favoritosSalvos ?? [];
    setFavoritosLocais(atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]);
    alternarFavorito(id);
  }

  function limparFiltros() {
    setBusca("");
    setModalidade("todas");
    setCidade("todas");
    setFaixaPreco("qualquer");
    setOrdem("relevancia");
  }

  return (
    <div className="home">
      <Header />

      <main>
        <HomeHero
          busca={busca}
          onBusca={setBusca}
          modalidade={modalidade}
          onModalidade={setModalidade}
          modalidades={modalidades}
          onBuscar={irParaQuadras}
          depoimentos={depoimentos}
          mediaGeral={mediaGeral}
          totalAvaliacoes={totalAvaliacoes}
        />

        <HomeNumeros
          totalQuadras={catalogo.length}
          totalModalidades={modalidades.length}
          mediaGeral={mediaGeral}
          totalAvaliacoes={totalAvaliacoes}
        />

        <HomeEsportes modalidades={modalidades} capas={capas} modalidadeAtual={modalidade} onEscolher={escolherModalidade} />

        {/* ===== LISTA DE QUADRAS ===== */}
        <section className="home-secao" id="quadras">
          <div className="home-container">
            <header className="home-secao-topo">
              <div>
                <span className="home-eyebrow">Reserve agora</span>
                <h2>Quadras disponíveis</h2>
                <p>
                  {resultado.length} {resultado.length === 1 ? "quadra encontrada" : "quadras encontradas"}
                  {modalidade !== "todas" && ` · ${modalidade}`}
                  {cidade !== "todas" && ` · ${cidade}`}
                  {faixaPreco !== "qualquer" && ` · ${faixasPreco[faixaPreco].texto}`}
                </p>
              </div>

              <HomeFiltros
                modalidades={opcoesModalidade}
                modalidade={modalidade}
                onModalidade={setModalidade}
                cidades={cidades}
                cidade={cidade}
                onCidade={setCidade}
                faixaPreco={faixaPreco}
                onFaixaPreco={setFaixaPreco}
                ordem={ordem}
                onOrdem={setOrdem}
                filtrosAtivos={filtrosAtivos}
                onLimpar={limparFiltros}
              />
            </header>

            {resultado.length > 0 ? (
              <>
              <ul className={`home-grid ${expandida ? "expandida" : ""}`}>
                {resultado.map((q) => (
                  <li key={q.id}>
                    <CardQuadra quadra={q} favorito={favoritos.has(q.id)} onFavoritar={trocarFavorito} />
                  </li>
                ))}
              </ul>
              {resultado.length > CARDS_NO_CELULAR && !expandida && (
                <button type="button" className="home-ver-mais" onClick={() => setExpandidaPara(chaveFiltros)}>
                  Ver mais quadras ({resultado.length - CARDS_NO_CELULAR})
                </button>
              )}
              </>
            ) : (
              <div className="home-vazio">
                <SearchX size={40} aria-hidden="true" />
                <h3>Nenhuma quadra encontrada</h3>
                <p>Tente mudar a busca ou os filtros de cidade, preço e esporte.</p>
                <button type="button" className="home-botao" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </section>

        <HomeComoFunciona />
        <HomeDepoimentos depoimentos={depoimentos} />
        <HomeCtaEmpresa />
      </main>

      <Footer />
    </div>
  );
}
