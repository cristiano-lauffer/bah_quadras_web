import { LayoutGrid, Star, Trophy, Users } from "lucide-react";
import { formatarNota } from "../../utils/formatadores.js";

/** Faixa de números logo abaixo do topo da Home. */
export default function HomeNumeros({ totalQuadras, totalModalidades, mediaGeral, totalAvaliacoes }) {
  const itens = [
    { icone: LayoutGrid, rotulo: "Quadras parceiras", valor: totalQuadras },
    { icone: Trophy, rotulo: "Modalidades", valor: totalModalidades },
    { icone: Star, rotulo: "Avaliação média", valor: formatarNota(mediaGeral) },
    { icone: Users, rotulo: "Avaliações", valor: totalAvaliacoes },
  ];

  return (
    <div className="home-container">
      <dl className="home-stats">
        {itens.map(({ icone: Icone, rotulo, valor }) => (
          <div key={rotulo}>
            <span className="home-stats-icone" aria-hidden="true">
              <Icone size={20} />
            </span>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
