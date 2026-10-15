import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../Home.css";

const quadras = [
  {
    id: 1,
    nome: "Arena Sport",
    modalidade: "Futebol society",
    preco: 80,
    avaliacao: "4,8",
    imagem:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 2,
    nome: "Quadra Center",
    modalidade: "Futsal",
    preco: 70,
    avaliacao: "4,6",
    imagem:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 3,
    nome: "Play Sports",
    modalidade: "Vôlei de areia",
    preco: 60,
    avaliacao: "4,7",
    imagem:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 4,
    nome: "Arena Basketball",
    modalidade: "Basquete",
    preco: 75,
    avaliacao: "4,9",
    imagem:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 5,
    nome: "Beach Arena",
    modalidade: "Beach Tennis",
    preco: 65,
    avaliacao: "4,8",
    imagem:
      "https://images.unsplash.com/photo-1600320254374-ce2d293c324e?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 6,
    nome: "Gol de Ouro",
    modalidade: "Futebol society",
    preco: 90,
    avaliacao: "4,5",
    imagem:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 7,
    nome: "Gol de Ouro",
    modalidade: "Futebol society",
    preco: 90,
    avaliacao: "4,5",
    imagem:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=85",
    },
    {
    id: 8,
    nome: "Gol de Ouro",
    modalidade: "Futebol society",
    preco: 90,
    avaliacao: "4,5",
    imagem:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: 9,
    nome: "Gol de Ouro",
    modalidade: "Futebol society",
    preco: 90,
    avaliacao: "4,5",
    imagem:
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=800&q=85",
  },
];

export default function Home() {
  const [busca, setBusca] = useState("");

  const quadrasFiltradas = quadras.filter((quadra) => {
    const pesquisa = busca.toLowerCase().trim();

    return (
      quadra.nome.toLowerCase().includes(pesquisa) ||
      quadra.modalidade.toLowerCase().includes(pesquisa)
    );
  });

  return (
    <div className="pagina-inicial">
      <Header />

      <main>
        {/* Banner principal */}
        <section className="banner">
          <div className="banner-conteudo">
            <span className="texto-destaque">
              BEM-VINDO AO BAH QUADRAS
            </span>

            <h1>Encontre a quadra ideal para você!</h1>

            <p>
              Descubra espaços esportivos, consulte opções e
              organize sua próxima partida. Tudo em um só lugar.
            </p>

            <form
              className="busca-quadras"
              onSubmit={(evento) => {
                evento.preventDefault();

                document
                  .getElementById("quadras")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Buscar por esporte ou nome da quadra"
                aria-label="Buscar quadras"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />

              <button type="submit">Buscar</button>
            </form>
          </div>
        </section>

        {/* Quadras em destaque */}
        <section className="secao-quadras" id="quadras">
          <div className="titulo-secao">
            <div>
              <h2>Quadras em destaque</h2>
              <p>Encontre o espaço ideal para sua próxima partida.</p>
            </div>

            <Link to="/login" className="link-secao">
              Ver todas →
            </Link>
          </div>

          {quadrasFiltradas.length > 0 ? (
            <div className="lista-quadras">
              {quadrasFiltradas.map((quadra) => (
                <article className="card-quadra" key={quadra.id}>
                  <Link
                    to="/login"
                    className="foto-quadra"
                    aria-label={`Ver ${quadra.nome}`}
                  >
                    <img
                      src={quadra.imagem}
                      alt={`Espaço esportivo: ${quadra.modalidade}`}
                      loading="lazy"
                    />
                  </Link>

                  <div className="dados-quadra">
                    <span className="modalidade">
                      {quadra.modalidade}
                    </span>

                    <h3>{quadra.nome}</h3>

                    <div className="informacoes-quadra">
                      <span className="avaliacao">
                        <span aria-hidden="true">★</span>{" "}
                        {quadra.avaliacao}
                      </span>

                      <strong>
                        {quadra.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        /h
                      </strong>
                    </div>

                    <Link to="/login" className="botao-detalhes">
                      Ver detalhes →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mensagem-vazia">
              <h3>Nenhuma quadra encontrada</h3>
              <p>
                Tente buscar por outro nome ou modalidade esportiva.
              </p>

              <button
                type="button"
                onClick={() => setBusca("")}
                className="botao-limpar"
              >
                Limpar busca
              </button>
            </div>
          )}
        </section>

        {/* Benefícios da plataforma */}
        <section className="secao-beneficios" id="sobre">
          <div className="titulo-secao">
            <div>
              <h2>O que você encontra aqui?</h2>
              <p>
                Tudo o que você precisa para organizar suas partidas.
              </p>
            </div>
          </div>

          <div className="lista-beneficios">
            <article className="card-beneficio">
              <div className="icone-beneficio" aria-hidden="true">
                ⚽
              </div>

              <h3>Encontre quadras</h3>

              <p>
                Explore espaços esportivos e encontre um lugar para jogar.
              </p>
            </article>

            <article className="card-beneficio">
              <div className="icone-beneficio" aria-hidden="true">
                📅
              </div>

              <h3>Faça reservas</h3>

              <p>
                Consulte horários e organize suas próximas partidas.
              </p>
            </article>

            <article className="card-beneficio">
              <div className="icone-beneficio" aria-hidden="true">
                🏢
              </div>

              <h3>Cadastre sua empresa</h3>

              <p>
                Divulgue suas quadras e gerencie seu espaço esportivo.
              </p>

              <Link to="/cadastro/empresa">
                Cadastrar empresa →
              </Link>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}