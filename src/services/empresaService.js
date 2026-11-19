// =========================================================
// Serviço do PERFIL DA EMPRESA
//
// API (só empresa logada): GET e PUT /empresa/perfil.
// Nome, CNPJ, telefone e endereço ficam na tabela empresas; o resto da vitrine
// (descrição, contatos, horário de funcionamento, pagamentos, política, logo,
// capa e fotos) fica no campo "perfil" da empresa. O responsável é a conta logada.
// =========================================================
import { api } from "./api.js";
import { aoTrocarConta, renovarSessao, sessaoAtual } from "./sessaoService.js";
import { enviarFoto } from "./uploadService.js";
import { mascaraCnpj, mascaraTelefone } from "../utils/mascaras.js";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Empresa que ainda não preencheu o perfil: horário comercial e textos padrão.
const HORARIOS_PADRAO = [1, 2, 3, 4, 5, 6, 0].map((dia) => ({
  dia,
  nome: DIAS[dia],
  abre: dia === 0 ? "09:00" : "08:00",
  fecha: dia === 0 ? "20:00" : "23:00",
}));
export const POLITICA_PADRAO = "Cancelamento gratuito até 24 horas antes do horário reservado.";
const PAGAMENTOS_PADRAO = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];

/** "Av. Ipiranga, 6681 - Partenon, Porto Alegre/RS" -> { rua, numero, bairro, cidade, estado } */
function enderecoDoTexto(texto = "") {
  const [ruaNumero = "", resto = ""] = texto.split(" - ");
  const [rua = "", numero = ""] = ruaNumero.split(",").map((p) => p.trim());
  const partes = resto.split(",").map((p) => p.trim()).filter(Boolean);
  const cidadeUf = partes.at(-1) ?? "";
  const [cidade = "", estado = ""] = cidadeUf.split("/");
  return { rua, numero, bairro: partes.length > 1 ? partes[0] : "", cidade, estado, cep: "" };
}

/** Resposta da API -> formato das telas. */
function daApi(e) {
  const p = e.perfil ?? {};
  return {
    id: e.id,
    nome: e.nome,
    slogan: p.slogan ?? "",
    cnpj: e.cnpj ? mascaraCnpj(e.cnpj) : "",
    responsavel: e.responsavel ?? "",
    telefone: e.telefone ? mascaraTelefone(e.telefone) : "",
    whatsapp: p.whatsapp ?? "",
    email: p.email || e.email_login || "",
    instagram: p.instagram ?? "",
    site: p.site ?? "",
    descricao: p.descricao ?? "",
    endereco: { cep: "", ...(p.endereco ?? enderecoDoTexto(e.endereco)) },
    membroDesde: e.created_at ? new Date(e.created_at).toISOString().slice(0, 10) : null,
    verificada: p.verificada ?? Boolean(e.cnpj),
    logo: p.logo || "🏟️",
    capa: p.capa ?? "",
    fotos: p.fotos ?? [],
    comodidades: p.comodidades ?? [],
    pagamentos: p.pagamentos ?? PAGAMENTOS_PADRAO,
    politicaCancelamento: p.politicaCancelamento || POLITICA_PADRAO,
    horarios: p.horarios?.length ? p.horarios : HORARIOS_PADRAO,
  };
}

// Último perfil lido (leitura imediata: menu lateral, grade padrão de quadra nova).
let atual = null;
aoTrocarConta(() => {
  atual = null;
});

/** Mínimo para a tela abrir antes da API responder: o que a sessão já sabe. */
function daSessao() {
  const sessao = sessaoAtual();
  return daApi({
    id: sessao?.empresa?.id,
    nome: sessao?.empresa?.nome ?? "",
    responsavel: sessao?.nome ?? "",
    email_login: sessao?.email ?? "",
  });
}

/**
 * Leitura imediata (sem esperar), para dados pequenos usados em vários lugares
 * como o nome no menu lateral. Telas devem preferir obterEmpresa().
 */
export function empresaAtual() {
  return atual ?? daSessao();
}

export async function obterEmpresa() {
  atual = daApi(await api("/empresa/perfil"));
  return atual;
}

/** Salva o perfil. Fotos novas (data URL) são enviadas antes. */
export async function salvarEmpresa(dados) {
  const corpo = { ...dados };
  delete corpo.id;
  delete corpo.membroDesde;
  delete corpo.verificada;
  if (dados.capa !== undefined) corpo.capa = await enviarFoto(dados.capa);
  if (dados.fotos !== undefined) corpo.fotos = await Promise.all(dados.fotos.map(enviarFoto));

  const resposta = await api("/empresa/perfil", { metodo: "PUT", corpo });
  atual = daApi(resposta.empresa);
  // Nome da empresa e do responsável aparecem no cabeçalho: renova a sessão com o token novo.
  if (resposta.token) renovarSessao(resposta);
  return atual;
}
