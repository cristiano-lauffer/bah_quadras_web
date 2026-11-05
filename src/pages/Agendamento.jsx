import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Agendamento.css";


const quadras = {
  arena: { nome: "Arena Sport", tipo: "Futebol society", preco: 80, local: "Viamão, RS" },
  beach: { nome: "Beach Arena", tipo: "Beach tennis", preco: 65, local: "Porto Alegre, RS" },
  basketball: { nome: "Arena Basketball", tipo: "Basquete", preco: 75, local: "Porto Alegre, RS" },
};
const horarios = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const isoHoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const dataLegivel = v => v ? new Date(`${v}T12:00:00`).toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}) : "Selecione uma data";

export default function Agendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quadra = quadras[id] || quadras.arena;
  const hoje = useMemo(isoHoje, []);
  const [data,setData] = useState(hoje);
  const [hora,setHora] = useState("");
  const [duracao,setDuracao] = useState("1");
  const [etapa,setEtapa] = useState(1);
  const [confirmado,setConfirmado] = useState(false);
  const total = quadra.preco * Number(duracao);
  const fim = hora ? `${String((Number(hora.slice(0,2))+Number(duracao))%24).padStart(2,"0")}:00` : "";
  const dinheiro = valor => `R$ ${valor.toFixed(2).replace(".",",")}`;

  if (confirmado) return <div className="public-page"><Header/><main className="booking-page">
    <section className="booking-success"><div className="booking-success-icon">✓</div><span className="booking-eyebrow">DEMONSTRAÇÃO</span><h1>Agendamento realizado!</h1>
      <p>Esta confirmação é ilustrativa. Nenhuma reserva real foi enviada.</p>
      <div className="booking-confirmation"><h2>{quadra.nome}</h2><p>{dataLegivel(data)}</p><p>{hora} às {fim} · {duracao} {duracao === "1" ? "hora" : "horas"}</p><strong>{dinheiro(total)}</strong></div>
      <div className="booking-success-actions"><Link to="/" className="booking-button booking-primary">Voltar ao início</Link><button className="booking-button booking-secondary" onClick={() => navigate("/usuario/reservas")}>Minhas reservas</button></div>
    </section></main><Footer/></div>;

  const avancar = () => {
    if (etapa === 1 && (!data || data < hoje)) return;
    if (etapa === 2 && !hora) return;
    setEtapa(n => Math.min(3,n+1));
  };

  return <div className="public-page"><Header/><main className="booking-page"><div className="booking-container">
    <Link to="/" className="booking-back">← Voltar para as quadras</Link>
    <header className="booking-heading"><span className="booking-eyebrow">RESERVE SEU HORÁRIO</span><h1>Agendamento</h1><p>Escolha a data e o horário para jogar.</p></header>
    <div className="booking-steps">{[["1","Data"],["2","Horário"],["3","Confirmação"]].map(([n,label],i)=><div key={n} className={`booking-step ${etapa===i+1?"active":""} ${etapa>i+1?"done":""}`}><span>{etapa>i+1?"✓":n}</span><strong>{label}</strong></div>)}</div>
    <div className="booking-layout"><section className="booking-card">
      <div className="booking-court"><span className="booking-court-icon">🏟️</span><div><h2>{quadra.nome}</h2><p>{quadra.tipo} · {quadra.local}</p></div><strong>{dinheiro(quadra.preco)}<small>/hora</small></strong></div>
      <div className="booking-content">
        {etapa===1 && <><h2>1. Escolha a data</h2><p>Selecione o dia em que deseja reservar a quadra.</p><label htmlFor="booking-date">Data da reserva</label><input id="booking-date" type="date" min={hoje} value={data} onChange={e=>setData(e.target.value)}/><div className="booking-tip">ⓘ Os horários exibidos são exemplos e precisam ser conectados à disponibilidade real.</div></>}
        {etapa===2 && <><h2>2. Escolha o horário</h2><p>{dataLegivel(data)}</p><div className="booking-times">{horarios.map(h=><button type="button" key={h} className={hora===h?"selected":""} onClick={()=>setHora(h)}>{h}</button>)}</div><label htmlFor="booking-duration">Duração</label><select id="booking-duration" value={duracao} onChange={e=>setDuracao(e.target.value)}><option value="1">1 hora</option><option value="2">2 horas</option><option value="3">3 horas</option></select></>}
        {etapa===3 && <><h2>3. Confirme os dados</h2><p>Confira os detalhes antes de concluir.</p><dl className="booking-details"><div><dt>Quadra</dt><dd>{quadra.nome}</dd></div><div><dt>Modalidade</dt><dd>{quadra.tipo}</dd></div><div><dt>Data</dt><dd>{dataLegivel(data)}</dd></div><div><dt>Horário</dt><dd>{hora} às {fim}</dd></div><div><dt>Duração</dt><dd>{duracao} {duracao==="1"?"hora":"horas"}</dd></div><div className="booking-total"><dt>Total</dt><dd>{dinheiro(total)}</dd></div></dl><div className="booking-tip">Esta etapa simula uma reserva. Não realiza pagamento nem grava dados no servidor.</div></>}
      </div>
      <div className="booking-actions">{etapa>1?<button className="booking-button booking-secondary" onClick={()=>setEtapa(n=>n-1)}>Voltar</button>:<span/>}{etapa<3?<button className="booking-button booking-primary" disabled={(etapa===1&&(!data||data<hoje))||(etapa===2&&!hora)} onClick={avancar}>Próximo →</button>:<button className="booking-button booking-primary" onClick={()=>setConfirmado(true)}>Confirmar agendamento</button>}</div>
    </section>
    <aside className="booking-summary"><h2>Resumo da reserva</h2><strong className="booking-summary-name">{quadra.nome}</strong><div><span>Data</span><b>{data?new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR"):"—"}</b></div><div><span>Horário</span><b>{hora?`${hora} às ${fim}`:"A definir"}</b></div><div><span>Duração</span><b>{duracao} h</b></div><div><span>Valor por hora</span><b>{dinheiro(quadra.preco)}</b></div><div className="booking-summary-total"><span>Total estimado</span><strong>{dinheiro(total)}</strong></div><p>Valor ilustrativo. A disponibilidade e o preço precisam ser confirmados pelo sistema.</p></aside>
    </div></div></main><Footer/></div>;
}
