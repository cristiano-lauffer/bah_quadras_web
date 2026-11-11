import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { quadras as quadrasFixas } from "../../data/quadras.js";
import { foto } from "../../utils/formatadores.js";

/** Chamada para donos de quadra no fim da Home. */
export default function HomeCtaEmpresa() {
  return (
    <section className="home-secao home-secao-sem-topo">
      <div className="home-container">
        <div className="home-cta">
          <div className="home-cta-texto">
            <span className="home-eyebrow">Para donos de quadra</span>
            <h2>Sua quadra cheia, sua agenda organizada.</h2>
            <p>
              Divulgue seu espaço para jogadores da região, receba reservas online e acompanhe tudo em
              um só painel.
            </p>
            <Link to="/cadastro/empresa" className="home-botao home-botao-claro">
              Falar com a equipe <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <img {...foto(quadrasFixas[3].imagens[0], 600)} alt="" className="home-cta-imagem" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
