import { CalendarCheck, Search, Trophy } from "lucide-react";

const passos = [
  { icone: Search, titulo: "Encontre", texto: "Busque por esporte, nome ou bairro e compare preços e avaliações." },
  { icone: CalendarCheck, titulo: "Reserve", texto: "Escolha a data e um horário livre. A confirmação chega na hora." },
  { icone: Trophy, titulo: "Jogue", texto: "Chame a galera e aproveite. A quadra já está garantida." },
];

/** Seção "Como funciona" (âncora #sobre do menu). */
export default function HomeComoFunciona() {
  return (
    <section className="home-secao home-secao-clara" id="sobre">
      <div className="home-container">
        <header className="home-secao-topo home-secao-topo-centro">
          <div>
            <span className="home-eyebrow">Como funciona</span>
            <h2>Do sofá para a quadra em 3 passos</h2>
            <p>Sem ligação, sem planilha, sem grupo de WhatsApp perdido.</p>
          </div>
        </header>

        <ol className="home-passos">
          {passos.map(({ icone: Icone, titulo, texto }, i) => (
            <li key={titulo} className="home-passo">
              <span className="home-passo-icone" aria-hidden="true">
                <Icone size={26} />
                <span className="home-passo-numero">{i + 1}</span>
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
